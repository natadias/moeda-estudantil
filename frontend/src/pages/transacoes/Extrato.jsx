import { useEffect, useState } from 'react';
import { lerErro } from '../../api/http';
import transacaoApi from '../../api/transacaoApi';
import Alerta from '../../components/Alerta';
import { useAuth } from '../../contexts/AuthContext';

const formatarData = (iso) => new Date(iso).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'short' });

// Texto principal e detalhe de cada linha, do ponto de vista de quem consulta.
function descrever(t, tipoUsuario) {
  if (t.tipo === 'CREDITO_SEMESTRAL') return [`Crédito do semestre ${t.semestre}`, 'Moedas semestrais do professor'];
  if (t.tipo === 'TRANSFERENCIA') {
    return tipoUsuario === 'ALUNO' ? [`Recebido de ${t.professor.nome}`, t.motivo] : [`Enviado para ${t.aluno.nome}`, t.motivo];
  }
  return [`Troca: ${t.vantagem.nome} (${t.vantagem.empresa.nome})`, `Cupom ${t.codigoCupom}`];
}

function ExtratoMovimentos({ transacoes, tipoUsuario }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Descrição</th>
          <th className="num">Moedas</th>
        </tr>
      </thead>
      <tbody>
        {transacoes.map((t) => {
          const [titulo, detalhe] = descrever(t, tipoUsuario);
          const entrada = t.natureza === 'ENTRADA';
          return (
            <tr key={t.id}>
              <td>{formatarData(t.dataHora)}</td>
              <td className="quebra">
                {titulo}
                <br />
                <small className="dica">{detalhe}</small>
              </td>
              <td className={`num ${entrada ? 'entrada' : 'saida'}`}>{entrada ? '+' : '−'}{t.valor}</td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

function CuponsResgatados({ transacoes }) {
  return (
    <table>
      <thead>
        <tr>
          <th>Data</th>
          <th>Cupom</th>
          <th>Aluno</th>
          <th>Vantagem</th>
          <th className="num">Moedas</th>
        </tr>
      </thead>
      <tbody>
        {transacoes.map((t) => (
          <tr key={t.id}>
            <td>{formatarData(t.dataHora)}</td>
            <td><code className="cupom">{t.codigoCupom}</code></td>
            <td>{t.aluno.nome}</td>
            <td>{t.vantagem.nome}</td>
            <td className="num">{t.valor}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// Aluno e professor: saldo e movimentações. Empresa: cupons resgatados das suas vantagens, para conferir na troca.
export default function Extrato() {
  const { usuario } = useAuth();
  const empresa = usuario.tipo === 'EMPRESA';
  const [extrato, setExtrato] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    transacaoApi.extrato().then(setExtrato).catch((e) => setErro(lerErro(e).mensagem));
  }, []);

  return (
    <section>
      <div className="cabecalho">
        <h1>{empresa ? 'Cupons resgatados' : 'Extrato'}</h1>
      </div>
      <Alerta>{erro}</Alerta>

      {!extrato ? (
        !erro && <p>Carregando…</p>
      ) : (
        <>
          {!empresa && (
            <div className="saldo">
              <span>Saldo</span>
              <strong>{extrato.saldo.toLocaleString('pt-BR')}</strong>
              <span>moedas</span>
            </div>
          )}
          {extrato.transacoes.length === 0 ? (
            <p className="vazio">{empresa ? 'Nenhuma vantagem sua foi resgatada ainda.' : 'Nenhuma movimentação ainda.'}</p>
          ) : (
            <div className="tabela-wrapper">
              {empresa ? (
                <CuponsResgatados transacoes={extrato.transacoes} />
              ) : (
                <ExtratoMovimentos transacoes={extrato.transacoes} tipoUsuario={usuario.tipo} />
              )}
            </div>
          )}
        </>
      )}
    </section>
  );
}

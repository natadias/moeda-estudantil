import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import alunoApi from '../../api/alunoApi';
import { lerErro, urlArquivo } from '../../api/http';
import transacaoApi from '../../api/transacaoApi';
import vantagemApi from '../../api/vantagemApi';
import Alerta from '../../components/Alerta';
import { useAuth } from '../../contexts/AuthContext';

export default function CatalogoVantagens() {
  const { usuario } = useAuth();
  const [vantagens, setVantagens] = useState([]);
  const [saldo, setSaldo] = useState(null);
  const [carregando, setCarregando] = useState(true);
  const [confirmando, setConfirmando] = useState(null);
  const [resgatando, setResgatando] = useState(false);
  const [erro, setErro] = useState('');
  const [cupom, setCupom] = useState(null);

  useEffect(() => {
    Promise.all([vantagemApi.listar(), alunoApi.buscar(usuario.id)])
      .then(([lista, aluno]) => {
        setVantagens(lista);
        setSaldo(aluno.saldoMoedas);
      })
      .catch((e) => setErro(lerErro(e).mensagem))
      .finally(() => setCarregando(false));
  }, [usuario.id]);

  async function resgatar(vantagem) {
    setResgatando(true);
    setErro('');
    setCupom(null);
    try {
      const resgate = await transacaoApi.resgatar(vantagem.id);
      setSaldo((atual) => atual - resgate.valor);
      setCupom(resgate);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (e) {
      setErro(lerErro(e).mensagem);
    } finally {
      setResgatando(false);
      setConfirmando(null);
    }
  }

  return (
    <section>
      <div className="cabecalho">
        <h1>Vantagens</h1>
        {saldo !== null && <p className="saldo-pequeno">Seu saldo: <strong>🪙 {saldo.toLocaleString('pt-BR')} moedas</strong></p>}
      </div>
      {cupom && (
        <div className="alerta alerta-sucesso" role="status">
          Troca feita! Seu cupom para <strong>{cupom.vantagem.nome}</strong> é <code className="cupom">{cupom.codigoCupom}</code>.
          Ele também foi enviado para o seu email; apresente-o em {cupom.vantagem.empresa.nome}. <Link to="/aluno/extrato">Ver extrato</Link>
        </div>
      )}
      <Alerta>{erro}</Alerta>

      {carregando ? (
        <p>Carregando…</p>
      ) : vantagens.length === 0 ? (
        <p className="vazio">Nenhuma vantagem disponível no momento.</p>
      ) : (
        <div className="grade-vantagens">
          {vantagens.map((v) => {
            const semSaldo = saldo !== null && saldo < v.custoMoedas;
            return (
              <article key={v.id} className="vantagem">
                <img src={urlArquivo(v.fotoUrl)} alt={v.nome} loading="lazy" />
                <div className="vantagem-corpo">
                  <h2>{v.nome}</h2>
                  <p className="empresa">{v.empresa.nome}</p>
                  <p>{v.descricao}</p>
                  <p className="custo">🪙 {v.custoMoedas} moedas</p>
                  {confirmando === v.id ? (
                    <div className="acoes inicio">
                      <button type="button" className="botao" onClick={() => resgatar(v)} disabled={resgatando}>
                        {resgatando ? 'Trocando…' : `Confirmar troca`}
                      </button>
                      <button type="button" className="botao secundario" onClick={() => setConfirmando(null)} disabled={resgatando}>Cancelar</button>
                    </div>
                  ) : (
                    <div className="acoes inicio">
                      <button type="button" className="botao" onClick={() => setConfirmando(v.id)} disabled={semSaldo}>Trocar moedas</button>
                      {semSaldo && <small className="dica">Faltam {v.custoMoedas - saldo} moedas</small>}
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

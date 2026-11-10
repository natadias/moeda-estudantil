import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { lerErro, urlArquivo } from '../../api/http';
import vantagemApi from '../../api/vantagemApi';
import Alerta from '../../components/Alerta';

export default function MinhasVantagens() {
  const { state } = useLocation();
  const [vantagens, setVantagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(state?.sucesso ?? '');

  const carregar = () =>
    vantagemApi
      .listar()
      .then(setVantagens)
      .catch((e) => setErro(lerErro(e).mensagem))
      .finally(() => setCarregando(false));

  useEffect(() => {
    carregar();
  }, []);

  async function alternarAtiva(v) {
    try {
      await vantagemApi.atualizar(v.id, { ...v, ativa: !v.ativa });
      setSucesso(v.ativa ? `“${v.nome}” não aparece mais para os alunos.` : `“${v.nome}” voltou ao catálogo.`);
      setErro('');
      carregar();
    } catch (e) {
      setErro(lerErro(e).mensagem);
    }
  }

  async function excluir(v) {
    if (!window.confirm(`Excluir a vantagem “${v.nome}”?`)) return;
    try {
      const resposta = await vantagemApi.excluir(v.id);
      setSucesso(resposta?.mensagem ?? 'Vantagem excluída.');
      setErro('');
      carregar();
    } catch (e) {
      setErro(lerErro(e).mensagem);
    }
  }

  return (
    <section>
      <div className="cabecalho">
        <h1>Minhas vantagens</h1>
        <Link to="/empresa/vantagens/nova" className="botao">Nova vantagem</Link>
      </div>
      <Alerta tipo="sucesso">{sucesso}</Alerta>
      <Alerta>{erro}</Alerta>

      {carregando ? (
        <p>Carregando…</p>
      ) : vantagens.length === 0 ? (
        <p className="vazio">Você ainda não cadastrou vantagens. Elas aparecem para os alunos trocarem por moedas.</p>
      ) : (
        <div className="grade-vantagens">
          {vantagens.map((v) => (
            <article key={v.id} className={`vantagem ${v.ativa ? '' : 'inativa'}`}>
              <img src={urlArquivo(v.fotoUrl)} alt={v.nome} loading="lazy" />
              <div className="vantagem-corpo">
                <div className="linha">
                  <h2>{v.nome}</h2>
                  <span className={`etiqueta ${v.ativa ? 'ok' : ''}`}>{v.ativa ? 'Ativa' : 'Inativa'}</span>
                </div>
                <p>{v.descricao}</p>
                <p className="custo">🪙 {v.custoMoedas} moedas · {v.totalResgates} resgate(s)</p>
                <div className="acoes inicio">
                  <Link to={`/empresa/vantagens/${v.id}`} className="botao secundario">Editar</Link>
                  <button type="button" className="botao secundario" onClick={() => alternarAtiva(v)}>{v.ativa ? 'Desativar' : 'Ativar'}</button>
                  <button type="button" className="botao perigo" onClick={() => excluir(v)}>Excluir</button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

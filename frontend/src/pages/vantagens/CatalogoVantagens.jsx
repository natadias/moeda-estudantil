import { useEffect, useState } from 'react';
import { lerErro, urlArquivo } from '../../api/http';
import vantagemApi from '../../api/vantagemApi';
import Alerta from '../../components/Alerta';

export default function CatalogoVantagens() {
  const [vantagens, setVantagens] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    vantagemApi
      .listar()
      .then(setVantagens)
      .catch((e) => setErro(lerErro(e).mensagem))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <section>
      <div className="cabecalho">
        <h1>Vantagens</h1>
      </div>
      <Alerta>{erro}</Alerta>

      {carregando ? (
        <p>Carregando…</p>
      ) : vantagens.length === 0 ? (
        <p className="vazio">Nenhuma vantagem disponível no momento.</p>
      ) : (
        <div className="grade-vantagens">
          {vantagens.map((v) => (
            <article key={v.id} className="vantagem">
              <img src={urlArquivo(v.fotoUrl)} alt={v.nome} loading="lazy" />
              <div className="vantagem-corpo">
                <h2>{v.nome}</h2>
                <p className="empresa">{v.empresa.nome}</p>
                <p>{v.descricao}</p>
                <p className="custo">🪙 {v.custoMoedas} moedas</p>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

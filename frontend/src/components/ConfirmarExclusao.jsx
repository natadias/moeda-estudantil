import { useState } from 'react';

export default function ConfirmarExclusao({ descricao, aoConfirmar }) {
  const [aberto, setAberto] = useState(false);
  const [excluindo, setExcluindo] = useState(false);

  async function confirmar() {
    setExcluindo(true);
    try {
      await aoConfirmar();
    } finally {
      setExcluindo(false);
    }
  }

  return (
    <section className="zona-perigo">
      <h2>Excluir conta</h2>
      <p>{descricao}</p>
      {aberto ? (
        <div className="botoes inicio">
          <button type="button" className="botao perigo-cheio" onClick={confirmar} disabled={excluindo}>
            {excluindo ? 'Excluindo…' : 'Sim, excluir minha conta'}
          </button>
          <button type="button" className="botao secundario" onClick={() => setAberto(false)}>Cancelar</button>
        </div>
      ) : (
        <button type="button" className="botao perigo" onClick={() => setAberto(true)}>Excluir conta</button>
      )}
    </section>
  );
}

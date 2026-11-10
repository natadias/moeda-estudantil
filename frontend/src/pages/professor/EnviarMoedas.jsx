import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import alunoApi from '../../api/alunoApi';
import { lerErro } from '../../api/http';
import transacaoApi from '../../api/transacaoApi';
import Alerta from '../../components/Alerta';
import Campo from '../../components/Campo';

export default function EnviarMoedas() {
  const [parametros] = useSearchParams();
  const [alunos, setAlunos] = useState([]);
  const [saldo, setSaldo] = useState(null);
  const [form, setForm] = useState({ alunoId: parametros.get('aluno') ?? '', valor: '', motivo: '' });
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');
  const [sucesso, setSucesso] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    alunoApi.listar().then(setAlunos).catch((e) => setMensagem(lerErro(e).mensagem));
    transacaoApi.extrato().then((e) => setSaldo(e.saldo)).catch((e) => setMensagem(lerErro(e).mensagem));
  }, []);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setErros({});
    setMensagem('');
    setSucesso('');
    try {
      const envio = await transacaoApi.enviarMoedas({ ...form, alunoId: Number(form.alunoId) || '' });
      setSaldo((atual) => atual - envio.valor);
      setSucesso(`${envio.valor} moedas enviadas para ${envio.aluno.nome}. O aluno foi avisado por email.`);
      setForm({ alunoId: '', valor: '', motivo: '' });
    } catch (erro) {
      const { mensagem: msg, campos } = lerErro(erro);
      setMensagem(msg);
      setErros(campos);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <section>
      <div className="cabecalho">
        <h1>Enviar moedas</h1>
      </div>
      {saldo !== null && (
        <div className="saldo">
          <span>Seu saldo</span>
          <strong>{saldo.toLocaleString('pt-BR')}</strong>
          <span>moedas</span>
        </div>
      )}
      <Alerta tipo="sucesso">{sucesso}</Alerta>
      <Alerta>{mensagem}</Alerta>

      <form className="formulario" onSubmit={enviar} noValidate>
        <fieldset>
          <legend>Reconhecer um aluno</legend>
          <div className="grade">
            <label className="campo largo">
              <span>Aluno</span>
              <select name="alunoId" value={form.alunoId} onChange={alterar} aria-invalid={Boolean(erros.alunoId)} required>
                <option value="">Selecione…</option>
                {alunos.map((a) => (
                  <option key={a.id} value={a.id}>{a.nome} · {a.curso}</option>
                ))}
              </select>
              {erros.alunoId && <small className="erro-campo">{erros.alunoId}</small>}
            </label>
            <Campo rotulo="Quantidade de moedas" nome="valor" type="number" min="1" step="1" value={form.valor} onChange={alterar} erro={erros.valor} required />
          </div>
          <label className="campo">
            <span>Motivo (vai no email para o aluno)</span>
            <textarea name="motivo" rows={3} value={form.motivo} onChange={alterar} aria-invalid={Boolean(erros.motivo)} placeholder="Ex.: participação excelente na aula de hoje" required />
            {erros.motivo && <small className="erro-campo">{erros.motivo}</small>}
          </label>
        </fieldset>
        <div className="botoes">
          <button type="submit" className="botao" disabled={enviando}>{enviando ? 'Enviando…' : 'Enviar moedas'}</button>
        </div>
      </form>
    </section>
  );
}

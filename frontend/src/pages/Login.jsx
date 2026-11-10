import { useEffect, useState } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import { lerErro } from '../api/http';
import Alerta from '../components/Alerta';
import Campo from '../components/Campo';
import { useJaAutenticadoAoAbrir } from '../components/SomenteVisitante';
import { INICIO_POR_TIPO, useAuth } from '../contexts/AuthContext';

export default function Login() {
  const { entrar, aviso, limparAviso } = useAuth();
  const { usuarioInicial } = useJaAutenticadoAoAbrir();
  const navigate = useNavigate();
  const { state } = useLocation();
  const [form, setForm] = useState({ login: '', senha: '' });
  const [erro, setErro] = useState('');
  const [enviando, setEnviando] = useState(false);

  const [avisoInicial] = useState(aviso);
  useEffect(() => limparAviso(), [limparAviso]);

  if (usuarioInicial) return <Navigate to={INICIO_POR_TIPO[usuarioInicial.tipo]} replace />;

  async function enviar(e) {
    e.preventDefault();
    setEnviando(true);
    setErro('');
    try {
      const dados = await entrar(form.login, form.senha);
      navigate(state?.destino ?? INICIO_POR_TIPO[dados.tipo], { replace: true });
    } catch (falha) {
      setErro(lerErro(falha).mensagem);
      setEnviando(false);
    }
  }

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  return (
    <section className="caixa-login">
      <h1>Entrar</h1>
      <p className="dica">Alunos, professores e empresas parceiras usam o mesmo acesso.</p>
      <Alerta tipo="sucesso">{avisoInicial || state?.sucesso}</Alerta>
      <Alerta>{erro}</Alerta>
      <form className="formulario" onSubmit={enviar}>
        <Campo rotulo="Login ou email" nome="login" value={form.login} onChange={alterar} autoComplete="username" autoFocus required />
        <Campo rotulo="Senha" nome="senha" type="password" value={form.senha} onChange={alterar} autoComplete="current-password" required />
        <button type="submit" className="botao" disabled={enviando}>{enviando ? 'Entrando…' : 'Entrar'}</button>
      </form>
      <p className="dica">
        Ainda não tem conta? <Link to="/alunos/novo">Cadastre-se como aluno</Link> ou <Link to="/empresas/nova">como empresa</Link>.
      </p>
    </section>
  );
}

import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import empresaApi from '../../api/empresaApi';
import { lerErro } from '../../api/http';
import Alerta from '../../components/Alerta';
import Campo from '../../components/Campo';
import { useAuth } from '../../contexts/AuthContext';
import { formatarCnpj } from '../../utils/formatadores';

const VAZIO = { nome: '', cnpj: '', email: '', login: '', senha: '' };

export default function EmpresaForm({ edicao = false }) {
  const { usuario, entrar, atualizarUsuario } = useAuth();
  const id = edicao ? usuario.id : null;
  const navigate = useNavigate();

  const [form, setForm] = useState(VAZIO);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!edicao) return;
    empresaApi
      .buscar(id)
      .then((empresa) => setForm({ ...VAZIO, nome: empresa.nome, cnpj: formatarCnpj(empresa.cnpj), email: empresa.email, login: empresa.login }))
      .catch((e) => setMensagem(lerErro(e).mensagem));
  }, [id, edicao]);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  async function salvar(e) {
    e.preventDefault();
    setEnviando(true);
    setErros({});
    setMensagem('');
    try {
      if (edicao) {
        const empresa = await empresaApi.atualizar(id, form);
        atualizarUsuario({ nome: empresa.nome, email: empresa.email, login: empresa.login });
        navigate('/empresa/perfil', { state: { sucesso: 'Dados atualizados.' } });
      } else {
        await empresaApi.cadastrar(form);
        await entrar(form.login, form.senha);
        navigate('/empresa/vantagens', { state: { sucesso: 'Cadastro realizado! Agora cadastre as vantagens que deseja oferecer.' } });
      }
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
        <h1>{edicao ? 'Editar dados da empresa' : 'Cadastro de empresa parceira'}</h1>
      </div>
      <Alerta>{mensagem}</Alerta>

      <form className="formulario" onSubmit={salvar} noValidate>
        <fieldset>
          <legend>Dados da empresa</legend>
          <div className="grade">
            <Campo rotulo="Nome / razão social" nome="nome" value={form.nome} onChange={alterar} erro={erros.nome} className="largo" required />
            <Campo rotulo="CNPJ" nome="cnpj" value={form.cnpj} onChange={alterar} erro={erros.cnpj} placeholder="00.000.000/0000-00" required />
          </div>
        </fieldset>

        <fieldset>
          <legend>Acesso</legend>
          <div className="grade">
            <Campo rotulo="Email" nome="email" type="email" value={form.email} onChange={alterar} erro={erros.email} required />
            <Campo rotulo="Login" nome="login" value={form.login} onChange={alterar} erro={erros.login} autoComplete="username" required />
            <Campo
              rotulo={edicao ? 'Nova senha (opcional)' : 'Senha'}
              nome="senha"
              type="password"
              value={form.senha}
              onChange={alterar}
              erro={erros.senha}
              autoComplete="new-password"
              required={!edicao}
            />
          </div>
        </fieldset>
        <div className="botoes">
          <Link to={edicao ? '/empresa/perfil' : '/'} className="botao secundario">Cancelar</Link>
          <button type="submit" className="botao" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar'}</button>
        </div>
      </form>
    </section>
  );
}

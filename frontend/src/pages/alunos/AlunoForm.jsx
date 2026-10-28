import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import alunoApi from '../../api/alunoApi';
import { lerErro } from '../../api/http';
import instituicaoApi from '../../api/instituicaoApi';
import Alerta from '../../components/Alerta';
import Campo from '../../components/Campo';
import { formatarCep, formatarCpf } from '../../utils/formatadores';

const VAZIO = {
  nome: '',
  email: '',
  login: '',
  senha: '',
  cpf: '',
  rg: '',
  curso: '',
  instituicaoId: '',
  endereco: { logradouro: '', numero: '', complemento: '', bairro: '', cidade: '', estado: '', cep: '' },
};

function paraFormulario(aluno) {
  return {
    ...VAZIO,
    nome: aluno.nome,
    email: aluno.email,
    login: aluno.login,
    cpf: formatarCpf(aluno.cpf),
    rg: aluno.rg,
    curso: aluno.curso,
    instituicaoId: String(aluno.instituicao.id),
    endereco: {
      ...VAZIO.endereco,
      ...aluno.endereco,
      complemento: aluno.endereco?.complemento ?? '',
      cep: formatarCep(aluno.endereco?.cep),
    },
  };
}

export default function AlunoForm() {
  const { id } = useParams();
  const edicao = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(VAZIO);
  const [instituicoes, setInstituicoes] = useState([]);
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    instituicaoApi.listar().then(setInstituicoes).catch((e) => setMensagem(lerErro(e).mensagem));
    if (edicao) {
      alunoApi
        .buscar(id)
        .then((aluno) => setForm(paraFormulario(aluno)))
        .catch((e) => setMensagem(lerErro(e).mensagem));
    }
  }, [id, edicao]);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const alterarEndereco = (e) => setForm({ ...form, endereco: { ...form.endereco, [e.target.name]: e.target.value } });

  async function salvar(e) {
    e.preventDefault();
    setEnviando(true);
    setErros({});
    setMensagem('');
    try {
      const dados = { ...form, instituicaoId: Number(form.instituicaoId) || '' };
      if (edicao) {
        await alunoApi.atualizar(id, dados);
        navigate('/alunos', { state: { sucesso: 'Dados do aluno atualizados.' } });
      } else {
        await alunoApi.cadastrar(dados);
        navigate('/alunos', { state: { sucesso: 'Aluno cadastrado com sucesso.' } });
      }
    } catch (erro) {
      const { mensagem: msg, campos } = lerErro(erro);
      setMensagem(msg);
      setErros(campos);
    } finally {
      setEnviando(false);
    }
  }

  const erroEnd = (campo) => erros[`endereco.${campo}`];

  return (
    <section>
      <div className="cabecalho">
        <h1>{edicao ? 'Editar aluno' : 'Cadastro de aluno'}</h1>
      </div>
      <Alerta>{mensagem}</Alerta>

      <form className="formulario" onSubmit={salvar} noValidate>
        <fieldset>
          <legend>Dados pessoais</legend>
          <div className="grade">
            <Campo rotulo="Nome completo" nome="nome" value={form.nome} onChange={alterar} erro={erros.nome} className="largo" required />
            <Campo rotulo="CPF" nome="cpf" value={form.cpf} onChange={alterar} erro={erros.cpf} placeholder="000.000.000-00" required />
            <Campo rotulo="RG" nome="rg" value={form.rg} onChange={alterar} erro={erros.rg} required />
          </div>
        </fieldset>

        <fieldset>
          <legend>Vínculo acadêmico</legend>
          <div className="grade">
            <label className="campo">
              <span>Instituição de ensino</span>
              <select name="instituicaoId" value={form.instituicaoId} onChange={alterar} aria-invalid={Boolean(erros.instituicaoId)} required>
                <option value="">Selecione…</option>
                {instituicoes.map((inst) => (
                  <option key={inst.id} value={inst.id}>{inst.nome}</option>
                ))}
              </select>
              {erros.instituicaoId && <small className="erro-campo">{erros.instituicaoId}</small>}
            </label>
            <Campo rotulo="Curso" nome="curso" value={form.curso} onChange={alterar} erro={erros.curso} required />
          </div>
        </fieldset>

        <fieldset>
          <legend>Endereço</legend>
          <div className="grade">
            <Campo rotulo="CEP" nome="cep" value={form.endereco.cep} onChange={alterarEndereco} erro={erroEnd('cep')} placeholder="00000-000" required />
            <Campo rotulo="Logradouro" nome="logradouro" value={form.endereco.logradouro} onChange={alterarEndereco} erro={erroEnd('logradouro')} className="largo" required />
            <Campo rotulo="Número" nome="numero" value={form.endereco.numero} onChange={alterarEndereco} erro={erroEnd('numero')} required />
            <Campo rotulo="Complemento" nome="complemento" value={form.endereco.complemento} onChange={alterarEndereco} />
            <Campo rotulo="Bairro" nome="bairro" value={form.endereco.bairro} onChange={alterarEndereco} erro={erroEnd('bairro')} required />
            <Campo rotulo="Cidade" nome="cidade" value={form.endereco.cidade} onChange={alterarEndereco} erro={erroEnd('cidade')} required />
            <Campo rotulo="UF" nome="estado" value={form.endereco.estado} onChange={alterarEndereco} erro={erroEnd('estado')} maxLength={2} placeholder="MG" required />
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
          <Link to="/alunos" className="botao secundario">Cancelar</Link>
          <button type="submit" className="botao" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar'}</button>
        </div>
      </form>
    </section>
  );
}

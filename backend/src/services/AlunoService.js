import alunoDAO from '../dao/AlunoDAO.js';
import instituicaoDAO from '../dao/InstituicaoEnsinoDAO.js';
import AppError from '../utils/AppError.js';
import { cpfValido, emailValido, preenchido, somenteDigitos } from '../utils/validators.js';
import { gerarHash } from './senha.js';

const CAMPOS_ENDERECO = ['logradouro', 'numero', 'bairro', 'cidade', 'estado', 'cep'];

function paraResposta(aluno) {
  const { usuario, instituicaoId, endereco, ...dados } = aluno;
  const { id: _id, alunoId: _alunoId, ...dadosEndereco } = endereco ?? {};
  return {
    ...dados,
    email: usuario.email,
    login: usuario.login,
    criadoEm: usuario.criadoEm,
    endereco: endereco ? dadosEndereco : null,
  };
}

async function validar(dados, { criacao }) {
  const erros = {};
  for (const campo of ['nome', 'email', 'login', 'cpf', 'rg', 'curso', 'instituicaoId']) {
    if (!preenchido(dados[campo])) erros[campo] = 'Campo obrigatório.';
  }
  if (criacao && !preenchido(dados.senha)) erros.senha = 'Campo obrigatório.';
  if (preenchido(dados.senha) && dados.senha.length < 6) erros.senha = 'A senha deve ter ao menos 6 caracteres.';
  if (preenchido(dados.email) && !emailValido(dados.email)) erros.email = 'Email inválido.';
  if (preenchido(dados.cpf) && !cpfValido(dados.cpf)) erros.cpf = 'CPF inválido.';

  const endereco = dados.endereco ?? {};
  for (const campo of CAMPOS_ENDERECO) {
    if (!preenchido(endereco[campo])) erros[`endereco.${campo}`] = 'Campo obrigatório.';
  }
  if (preenchido(endereco.estado) && !/^[A-Za-z]{2}$/.test(endereco.estado.trim())) erros['endereco.estado'] = 'Use a sigla do estado (ex.: MG).';
  if (preenchido(endereco.cep) && somenteDigitos(endereco.cep).length !== 8) erros['endereco.cep'] = 'CEP deve ter 8 dígitos.';

  if (preenchido(dados.instituicaoId) && !(await instituicaoDAO.findById(Number(dados.instituicaoId)))) {
    erros.instituicaoId = 'Instituição de ensino não encontrada.';
  }

  if (Object.keys(erros).length) throw new AppError('Dados inválidos.', 422, erros);
}

async function normalizar(dados) {
  const { endereco } = dados;
  return {
    nome: dados.nome.trim(),
    email: dados.email.trim().toLowerCase(),
    login: dados.login.trim(),
    senhaHash: preenchido(dados.senha) ? await gerarHash(dados.senha) : undefined,
    cpf: somenteDigitos(dados.cpf),
    rg: dados.rg.trim(),
    curso: dados.curso.trim(),
    instituicaoId: Number(dados.instituicaoId),
    endereco: {
      logradouro: endereco.logradouro.trim(),
      numero: String(endereco.numero).trim(),
      complemento: endereco.complemento?.trim() || null,
      bairro: endereco.bairro.trim(),
      cidade: endereco.cidade.trim(),
      estado: endereco.estado.trim().toUpperCase(),
      cep: somenteDigitos(endereco.cep),
    },
  };
}

class AlunoService {
  async listar() {
    const alunos = await alunoDAO.findAll();
    return alunos.map(paraResposta);
  }

  async buscarPorId(id) {
    const aluno = await alunoDAO.findById(id);
    if (!aluno) throw new AppError('Aluno não encontrado.', 404);
    return paraResposta(aluno);
  }

  async cadastrar(dados) {
    await validar(dados, { criacao: true });
    const aluno = await alunoDAO.create(await normalizar(dados));
    return paraResposta(aluno);
  }

  async atualizar(id, dados) {
    await validar(dados, { criacao: false });
    const aluno = await alunoDAO.update(id, await normalizar(dados));
    return paraResposta(aluno);
  }

  async excluir(id) {
    await alunoDAO.delete(id);
  }
}

export default new AlunoService();

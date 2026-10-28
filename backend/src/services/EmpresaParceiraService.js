import empresaDAO from '../dao/EmpresaParceiraDAO.js';
import AppError from '../utils/AppError.js';
import { cnpjValido, emailValido, preenchido, somenteDigitos } from '../utils/validators.js';
import { gerarHash } from './senha.js';

function paraResposta(empresa) {
  const { usuario, _count, ...dados } = empresa;
  return {
    ...dados,
    email: usuario.email,
    login: usuario.login,
    criadoEm: usuario.criadoEm,
    totalVantagens: _count?.vantagens ?? 0,
  };
}

function validar(dados, { criacao }) {
  const erros = {};
  for (const campo of ['nome', 'cnpj', 'email', 'login']) {
    if (!preenchido(dados[campo])) erros[campo] = 'Campo obrigatório.';
  }
  if (criacao && !preenchido(dados.senha)) erros.senha = 'Campo obrigatório.';
  if (preenchido(dados.senha) && dados.senha.length < 6) erros.senha = 'A senha deve ter ao menos 6 caracteres.';
  if (preenchido(dados.email) && !emailValido(dados.email)) erros.email = 'Email inválido.';
  if (preenchido(dados.cnpj) && !cnpjValido(dados.cnpj)) erros.cnpj = 'CNPJ inválido.';

  if (Object.keys(erros).length) throw new AppError('Dados inválidos.', 422, erros);
}

async function normalizar(dados) {
  return {
    nome: dados.nome.trim(),
    cnpj: somenteDigitos(dados.cnpj),
    email: dados.email.trim().toLowerCase(),
    login: dados.login.trim(),
    senhaHash: preenchido(dados.senha) ? await gerarHash(dados.senha) : undefined,
  };
}

class EmpresaParceiraService {
  async listar() {
    const empresas = await empresaDAO.findAll();
    return empresas.map(paraResposta);
  }

  async buscarPorId(id) {
    const empresa = await empresaDAO.findById(id);
    if (!empresa) throw new AppError('Empresa parceira não encontrada.', 404);
    return paraResposta(empresa);
  }

  async cadastrar(dados) {
    validar(dados, { criacao: true });
    const empresa = await empresaDAO.create(await normalizar(dados));
    return paraResposta(empresa);
  }

  async atualizar(id, dados) {
    validar(dados, { criacao: false });
    const empresa = await empresaDAO.update(id, await normalizar(dados));
    return paraResposta(empresa);
  }

  async excluir(id) {
    await empresaDAO.delete(id);
  }
}

export default new EmpresaParceiraService();

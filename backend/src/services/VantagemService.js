import { removerArquivo } from '../config/upload.js';
import vantagemDAO from '../dao/VantagemDAO.js';
import AppError from '../utils/AppError.js';
import { preenchido } from '../utils/validators.js';

function paraResposta(vantagem) {
  const { _count, ...dados } = vantagem;
  return { ...dados, totalResgates: _count?.resgates ?? 0 };
}

function validar(dados, { exigeFoto }) {
  const erros = {};
  if (!preenchido(dados.nome)) erros.nome = 'Campo obrigatório.';
  if (!preenchido(dados.descricao)) erros.descricao = 'Campo obrigatório.';
  const custo = Number(dados.custoMoedas);
  if (!Number.isInteger(custo) || custo <= 0) erros.custoMoedas = 'Informe um número inteiro de moedas maior que zero.';
  if (exigeFoto && !dados.fotoUrl) erros.foto = 'A foto do produto é obrigatória.';
  if (Object.keys(erros).length) throw new AppError('Dados inválidos.', 422, erros);
}

const lerAtiva = (valor) => (valor === undefined ? undefined : valor === true || valor === 'true');

class VantagemService {
  async listar(filtro) {
    const vantagens = await vantagemDAO.findAll(filtro);
    return vantagens.map(paraResposta);
  }

  async buscarPorId(id) {
    const vantagem = await vantagemDAO.findById(id);
    if (!vantagem) throw new AppError('Vantagem não encontrada.', 404);
    return paraResposta(vantagem);
  }

  async cadastrar(empresaId, dados) {
    try {
      validar(dados, { exigeFoto: true });
    } catch (erro) {
      removerArquivo(dados.fotoUrl);
      throw erro;
    }
    const vantagem = await vantagemDAO.create({
      nome: dados.nome.trim(),
      descricao: dados.descricao.trim(),
      custoMoedas: Number(dados.custoMoedas),
      fotoUrl: dados.fotoUrl,
      ativa: lerAtiva(dados.ativa) ?? true,
      empresaId,
    });
    return paraResposta(vantagem);
  }

  async atualizar(empresaId, id, dados) {
    const atual = await this.#buscarDaEmpresa(empresaId, id, dados.fotoUrl);
    try {
      validar(dados, { exigeFoto: false });
    } catch (erro) {
      removerArquivo(dados.fotoUrl);
      throw erro;
    }
    const vantagem = await vantagemDAO.update(id, {
      nome: dados.nome.trim(),
      descricao: dados.descricao.trim(),
      custoMoedas: Number(dados.custoMoedas),
      fotoUrl: dados.fotoUrl ?? atual.fotoUrl,
      ativa: lerAtiva(dados.ativa),
    });
    if (dados.fotoUrl) removerArquivo(atual.fotoUrl);
    return paraResposta(vantagem);
  }

  // Vantagens já resgatadas não são apagadas: ficam inativas para preservar o histórico dos alunos.
  async excluir(empresaId, id) {
    const atual = await this.#buscarDaEmpresa(empresaId, id);
    if (atual._count.resgates > 0) {
      await vantagemDAO.update(id, { ativa: false });
      return { desativada: true };
    }
    await vantagemDAO.delete(id);
    removerArquivo(atual.fotoUrl);
    return { desativada: false };
  }

  async #buscarDaEmpresa(empresaId, id, arquivoEnviado) {
    const vantagem = await vantagemDAO.findById(id);
    if (!vantagem || vantagem.empresaId !== empresaId) {
      removerArquivo(arquivoEnviado);
      throw new AppError('Vantagem não encontrada.', 404);
    }
    return vantagem;
  }
}

export default new VantagemService();

import vantagemDAO from '../dao/VantagemDAO.js';
import AppError from '../utils/AppError.js';
import { preenchido } from '../utils/validators.js';

function paraResposta(vantagem) {
  const { _count, fotoTipo, fotoAtualizadaEm, ...dados } = vantagem;
  return {
    ...dados,
    fotoUrl: `/api/vantagens/${vantagem.id}/foto?v=${fotoAtualizadaEm.getTime()}`,
    totalResgates: _count?.resgates ?? 0,
  };
}

function validar(dados, { exigeFoto }) {
  const erros = {};
  if (!preenchido(dados.nome)) erros.nome = 'Campo obrigatório.';
  if (!preenchido(dados.descricao)) erros.descricao = 'Campo obrigatório.';
  const custo = Number(dados.custoMoedas);
  if (!Number.isInteger(custo) || custo <= 0) erros.custoMoedas = 'Informe um número inteiro de moedas maior que zero.';
  if (exigeFoto && !dados.foto) erros.foto = 'A foto do produto é obrigatória.';
  if (Object.keys(erros).length) throw new AppError('Dados inválidos.', 422, erros);
}

const lerAtiva = (valor) => (valor === undefined ? undefined : valor === true || valor === 'true');

const dadosDaFoto = (foto) => (foto ? { foto: foto.dados, fotoTipo: foto.tipo, fotoAtualizadaEm: new Date() } : {});

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

  async buscarFoto(id) {
    const foto = await vantagemDAO.findFoto(id);
    if (!foto) throw new AppError('Vantagem não encontrada.', 404);
    return { dados: Buffer.from(foto.foto), tipo: foto.fotoTipo };
  }

  async cadastrar(empresaId, dados) {
    validar(dados, { exigeFoto: true });
    const vantagem = await vantagemDAO.create({
      nome: dados.nome.trim(),
      descricao: dados.descricao.trim(),
      custoMoedas: Number(dados.custoMoedas),
      ativa: lerAtiva(dados.ativa) ?? true,
      empresaId,
      ...dadosDaFoto(dados.foto),
    });
    return paraResposta(vantagem);
  }

  async atualizar(empresaId, id, dados) {
    await this.#buscarDaEmpresa(empresaId, id);
    validar(dados, { exigeFoto: false });
    const vantagem = await vantagemDAO.update(id, {
      nome: dados.nome.trim(),
      descricao: dados.descricao.trim(),
      custoMoedas: Number(dados.custoMoedas),
      ativa: lerAtiva(dados.ativa),
      ...dadosDaFoto(dados.foto),
    });
    return paraResposta(vantagem);
  }

  async excluir(empresaId, id) {
    const atual = await this.#buscarDaEmpresa(empresaId, id);
    if (atual._count.resgates > 0) {
      await vantagemDAO.update(id, { ativa: false });
      return { desativada: true };
    }
    await vantagemDAO.delete(id);
    return { desativada: false };
  }

  async #buscarDaEmpresa(empresaId, id) {
    const vantagem = await vantagemDAO.findById(id);
    if (!vantagem || vantagem.empresaId !== empresaId) throw new AppError('Vantagem não encontrada.', 404);
    return vantagem;
  }
}

export default new VantagemService();

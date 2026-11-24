import prisma from '../config/prisma.js';
import { ENTIDADES, executar } from './daoErrors.js';

const INCLUDE = {
  empresa: { select: { id: true, nome: true } },
  _count: { select: { resgates: true } },
};

const SEM_FOTO = { foto: true };

class VantagemDAO {
  create(dados) {
    return prisma.vantagem.create({ data: dados, include: INCLUDE, omit: SEM_FOTO });
  }

  findAll({ empresaId, somenteAtivas } = {}) {
    return prisma.vantagem.findMany({
      where: { empresaId, ativa: somenteAtivas ? true : undefined },
      include: INCLUDE,
      omit: SEM_FOTO,
      orderBy: { nome: 'asc' },
    });
  }

  findById(id) {
    return prisma.vantagem.findUnique({ where: { id }, include: INCLUDE, omit: SEM_FOTO });
  }

  findFoto(id) {
    return prisma.vantagem.findUnique({ where: { id }, select: { foto: true, fotoTipo: true } });
  }

  update(id, dados) {
    return executar(ENTIDADES.vantagem, () => prisma.vantagem.update({ where: { id }, data: dados, include: INCLUDE, omit: SEM_FOTO }));
  }

  delete(id) {
    return executar(ENTIDADES.vantagem, () => prisma.vantagem.delete({ where: { id } }));
  }
}

export default new VantagemDAO();

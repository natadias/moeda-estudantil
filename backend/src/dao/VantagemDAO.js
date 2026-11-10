import prisma from '../config/prisma.js';
import { ENTIDADES, executar } from './daoErrors.js';

const INCLUDE = {
  empresa: { select: { id: true, nome: true } },
  _count: { select: { resgates: true } },
};

class VantagemDAO {
  create(dados) {
    return prisma.vantagem.create({ data: dados, include: INCLUDE });
  }

  findAll({ empresaId, somenteAtivas } = {}) {
    return prisma.vantagem.findMany({
      where: { empresaId, ativa: somenteAtivas ? true : undefined },
      include: INCLUDE,
      orderBy: { nome: 'asc' },
    });
  }

  findById(id) {
    return prisma.vantagem.findUnique({ where: { id }, include: INCLUDE });
  }

  update(id, dados) {
    return executar(ENTIDADES.vantagem, () => prisma.vantagem.update({ where: { id }, data: dados, include: INCLUDE }));
  }

  delete(id) {
    return executar(ENTIDADES.vantagem, () => prisma.vantagem.delete({ where: { id } }));
  }
}

export default new VantagemDAO();

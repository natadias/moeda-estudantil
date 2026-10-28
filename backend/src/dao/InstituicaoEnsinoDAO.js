import prisma from '../config/prisma.js';

class InstituicaoEnsinoDAO {
  findAll() {
    return prisma.instituicaoEnsino.findMany({ orderBy: { nome: 'asc' } });
  }

  findById(id) {
    return prisma.instituicaoEnsino.findUnique({ where: { id } });
  }
}

export default new InstituicaoEnsinoDAO();

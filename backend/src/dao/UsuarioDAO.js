import prisma from '../config/prisma.js';

const INCLUDE = {
  aluno: { select: { nome: true } },
  professor: { select: { nome: true } },
  empresa: { select: { nome: true } },
};

class UsuarioDAO {
  findByLoginOuEmail(identificador) {
    return prisma.usuario.findFirst({
      where: { OR: [{ login: identificador }, { email: identificador.toLowerCase() }] },
      include: INCLUDE,
    });
  }

  findById(id) {
    return prisma.usuario.findUnique({ where: { id }, include: INCLUDE });
  }
}

export default new UsuarioDAO();

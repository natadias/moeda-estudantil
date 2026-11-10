import prisma from '../config/prisma.js';

class ProfessorDAO {
  findById(id) {
    return prisma.professor.findUnique({
      where: { id },
      include: { usuario: { select: { email: true, login: true } }, instituicao: true },
    });
  }
}

export default new ProfessorDAO();

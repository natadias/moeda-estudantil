import prisma from '../config/prisma.js';
import { ENTIDADES, executar } from './daoErrors.js';

const INCLUDE = {
  usuario: { select: { email: true, login: true, criadoEm: true } },
  instituicao: true,
  endereco: true,
};

class AlunoDAO {
  create({ email, login, senhaHash, endereco, ...dadosAluno }) {
    return executar(ENTIDADES.aluno, async () => {
      const usuario = await prisma.usuario.create({
        data: {
          email,
          login,
          senhaHash,
          tipo: 'ALUNO',
          aluno: {
            create: {
              ...dadosAluno,
              endereco: { create: endereco },
            },
          },
        },
      });
      return this.findById(usuario.id);
    });
  }

  findAll({ instituicaoId } = {}) {
    return prisma.aluno.findMany({ where: { instituicaoId }, include: INCLUDE, orderBy: { nome: 'asc' } });
  }

  findById(id) {
    return prisma.aluno.findUnique({ where: { id }, include: INCLUDE });
  }

  update(id, { email, login, senhaHash, endereco, instituicaoId, ...dadosAluno }) {
    const dadosUsuario = { email, login };
    if (senhaHash) dadosUsuario.senhaHash = senhaHash;

    return executar(ENTIDADES.aluno, () =>
      prisma.aluno.update({
        where: { id },
        data: {
          ...dadosAluno,
          instituicao: { connect: { id: instituicaoId } },
          usuario: { update: dadosUsuario },
          endereco: { upsert: { create: endereco, update: endereco } },
        },
        include: INCLUDE,
      }),
    );
  }

  delete(id) {
    return executar(ENTIDADES.aluno, () => prisma.usuario.delete({ where: { id, tipo: 'ALUNO' } }));
  }
}

export default new AlunoDAO();

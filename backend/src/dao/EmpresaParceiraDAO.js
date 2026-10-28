import prisma from '../config/prisma.js';
import { ENTIDADES, executar } from './daoErrors.js';

const INCLUDE = {
  usuario: { select: { email: true, login: true, criadoEm: true } },
  _count: { select: { vantagens: true } },
};

class EmpresaParceiraDAO {
  create({ email, login, senhaHash, ...dadosEmpresa }) {
    return executar(ENTIDADES.empresa, async () => {
      const usuario = await prisma.usuario.create({
        data: {
          email,
          login,
          senhaHash,
          tipo: 'EMPRESA',
          empresa: { create: dadosEmpresa },
        },
      });
      return this.findById(usuario.id);
    });
  }

  findAll() {
    return prisma.empresaParceira.findMany({ include: INCLUDE, orderBy: { nome: 'asc' } });
  }

  findById(id) {
    return prisma.empresaParceira.findUnique({ where: { id }, include: INCLUDE });
  }

  update(id, { email, login, senhaHash, ...dadosEmpresa }) {
    const dadosUsuario = { email, login };
    if (senhaHash) dadosUsuario.senhaHash = senhaHash;

    return executar(ENTIDADES.empresa, () =>
      prisma.empresaParceira.update({
        where: { id },
        data: { ...dadosEmpresa, usuario: { update: dadosUsuario } },
        include: INCLUDE,
      }),
    );
  }

  delete(id) {
    return executar(ENTIDADES.empresa, () => prisma.usuario.delete({ where: { id, tipo: 'EMPRESA' } }));
  }
}

export default new EmpresaParceiraDAO();

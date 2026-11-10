import prisma from '../config/prisma.js';

const COM_EMAIL = { select: { email: true } };

const INCLUDE_NOTIFICACAO = {
  professor: { select: { id: true, nome: true } },
  aluno: { select: { id: true, nome: true, usuario: COM_EMAIL } },
  vantagem: { select: { id: true, nome: true, empresa: { select: { id: true, nome: true, usuario: COM_EMAIL } } } },
};

const INCLUDE_EXTRATO = {
  professor: { select: { id: true, nome: true } },
  aluno: { select: { id: true, nome: true } },
  vantagem: { select: { id: true, nome: true, empresa: { select: { id: true, nome: true } } } },
};

class TransacaoDAO {
  transferir({ professorId, alunoId, valor, motivo }) {
    return prisma.$transaction(async (tx) => {
      const debito = await tx.professor.updateMany({
        where: { id: professorId, saldoMoedas: { gte: valor } },
        data: { saldoMoedas: { decrement: valor } },
      });
      if (debito.count === 0) return null;
      await tx.aluno.update({ where: { id: alunoId }, data: { saldoMoedas: { increment: valor } } });
      return tx.transacao.create({
        data: { tipo: 'TRANSFERENCIA', valor, motivo, professorId, alunoId },
        include: INCLUDE_NOTIFICACAO,
      });
    });
  }

  resgatar({ alunoId, vantagemId, valor, codigoCupom }) {
    return prisma.$transaction(async (tx) => {
      const debito = await tx.aluno.updateMany({
        where: { id: alunoId, saldoMoedas: { gte: valor } },
        data: { saldoMoedas: { decrement: valor } },
      });
      if (debito.count === 0) return null;
      return tx.transacao.create({
        data: { tipo: 'RESGATE', valor, codigoCupom, alunoId, vantagemId },
        include: INCLUDE_NOTIFICACAO,
      });
    });
  }

  findExtrato({ alunoId, professorId, empresaId }) {
    return prisma.transacao.findMany({
      where: { alunoId, professorId, vantagem: empresaId ? { empresaId } : undefined },
      include: INCLUDE_EXTRATO,
      orderBy: [{ dataHora: 'desc' }, { id: 'desc' }],
    });
  }

  async creditarSemestre(semestre, valor) {
    const pendentes = await prisma.professor.findMany({
      where: { transacoes: { none: { tipo: 'CREDITO_SEMESTRAL', semestre } } },
      select: { id: true },
    });
    let creditados = 0;
    for (const { id } of pendentes) {
      try {
        await prisma.$transaction([
          prisma.transacao.create({ data: { tipo: 'CREDITO_SEMESTRAL', valor, semestre, professorId: id } }),
          prisma.professor.update({ where: { id }, data: { saldoMoedas: { increment: valor } } }),
        ]);
        creditados++;
      } catch (erro) {
        if (erro.code !== 'P2002') throw erro;
      }
    }
    return creditados;
  }
}

export default new TransacaoDAO();

import { PrismaClient } from '@prisma/client';
import { INSTITUICOES, PROFESSORES, popularBase, popularDemo } from './dados.js';

const prisma = new PrismaClient();

async function main() {
  await popularBase(prisma);
  await popularDemo(prisma);
  console.log(`Seed concluído: ${INSTITUICOES.length} instituições, ${PROFESSORES.length} professores, 1 aluno e 1 empresa de demonstração.`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

import { PrismaClient } from '@prisma/client';
import { INSTITUICOES, PROFESSORES, VANTAGENS_DEMO, popularBase, popularDemo } from './dados.js';

const prisma = new PrismaClient();

async function main() {
  await popularBase(prisma);
  await popularDemo(prisma);
  console.log(`Seed concluído: ${INSTITUICOES.length} instituições, ${PROFESSORES.length} professores, 1 aluno, 1 empresa e ${VANTAGENS_DEMO.length} vantagens de demonstração.`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

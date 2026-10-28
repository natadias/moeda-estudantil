import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

// Instituições e professores são pré-cadastrados (enviados pela instituição na parceria).
const INSTITUICOES = [
  { nome: 'PUC Minas', cnpj: '17178195000167' },
  { nome: 'Universidade Federal de Minas Gerais', cnpj: '17217985000104' },
  { nome: 'CEFET-MG', cnpj: '17220203000196' },
];

const PROFESSORES = [
  { nome: 'Ana Souza', cpf: '52998224725', departamento: 'Engenharia de Software', email: 'ana.souza@pucminas.br', login: 'ana.souza', instituicao: '17178195000167' },
  { nome: 'Carlos Lima', cpf: '11144477735', departamento: 'Ciência da Computação', email: 'carlos.lima@ufmg.br', login: 'carlos.lima', instituicao: '17217985000104' },
];

const hoje = new Date();
const SEMESTRE_ATUAL = `${hoje.getFullYear()}.${hoje.getMonth() < 6 ? 1 : 2}`;

async function main() {
  for (const instituicao of INSTITUICOES) {
    await prisma.instituicaoEnsino.upsert({ where: { cnpj: instituicao.cnpj }, update: { nome: instituicao.nome }, create: instituicao });
  }

  const senhaHash = await bcrypt.hash('professor123', 10);
  for (const { email, login, instituicao, ...dados } of PROFESSORES) {
    const { id: instituicaoId } = await prisma.instituicaoEnsino.findUniqueOrThrow({ where: { cnpj: instituicao } });
    await prisma.usuario.upsert({
      where: { login },
      update: {},
      create: {
        email,
        login,
        senhaHash,
        tipo: 'PROFESSOR',
        professor: {
          create: {
            ...dados,
            instituicaoId,
            saldoMoedas: 1000,
            transacoes: { create: { tipo: 'CREDITO_SEMESTRAL', valor: 1000, semestre: SEMESTRE_ATUAL } },
          },
        },
      },
    });
  }

  console.log(`Seed concluído: ${INSTITUICOES.length} instituições e ${PROFESSORES.length} professores.`);
}

main()
  .catch((erro) => {
    console.error(erro);
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());

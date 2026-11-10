import bcrypt from 'bcryptjs';
import { semestreAtual } from '../src/utils/semestre.js';

export const INSTITUICOES = [
  { nome: 'PUC Minas', cnpj: '17178195000167' },
  { nome: 'Universidade Federal de Minas Gerais', cnpj: '17217985000104' },
  { nome: 'CEFET-MG', cnpj: '17220203000196' },
];

export const PROFESSORES = [
  { nome: 'Ana Souza', cpf: '52998224725', departamento: 'Engenharia de Software', email: 'ana.souza@pucminas.br', login: 'ana.souza', instituicao: '17178195000167' },
  { nome: 'Carlos Lima', cpf: '11144477735', departamento: 'Ciência da Computação', email: 'carlos.lima@ufmg.br', login: 'carlos.lima', instituicao: '17217985000104' },
];

export const SENHA_PROFESSORES = 'professor123';

const SEMESTRE_ATUAL = semestreAtual();

export async function popularBase(prisma) {
  for (const instituicao of INSTITUICOES) {
    await prisma.instituicaoEnsino.upsert({ where: { cnpj: instituicao.cnpj }, update: { nome: instituicao.nome }, create: instituicao });
  }

  const senhaHash = await bcrypt.hash(SENHA_PROFESSORES, 10);
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
}

export async function popularDemo(prisma) {
  const senhaHash = await bcrypt.hash('123456', 10);
  const puc = await prisma.instituicaoEnsino.findUniqueOrThrow({ where: { cnpj: '17178195000167' } });

  await prisma.usuario.upsert({
    where: { login: 'maria' },
    update: {},
    create: {
      email: 'maria.silva@email.com',
      login: 'maria',
      senhaHash,
      tipo: 'ALUNO',
      aluno: {
        create: {
          nome: 'Maria Silva',
          cpf: '39053344705',
          rg: 'MG-12.345.678',
          curso: 'Engenharia de Software',
          instituicaoId: puc.id,
          endereco: {
            create: { logradouro: 'Av. Dom José Gaspar', numero: '500', bairro: 'Coração Eucarístico', cidade: 'Belo Horizonte', estado: 'MG', cep: '30535901' },
          },
        },
      },
    },
  });

  await prisma.usuario.upsert({
    where: { login: 'cantina' },
    update: {},
    create: {
      email: 'contato@cantinacentral.com.br',
      login: 'cantina',
      senhaHash,
      tipo: 'EMPRESA',
      empresa: { create: { nome: 'Cantina Central', cnpj: '11222333000181' } },
    },
  });
}

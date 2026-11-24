import fs from 'node:fs';
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

export const VANTAGENS_DEMO = [
  { nome: 'Café com pão de queijo', descricao: 'Café coado e dois pães de queijo, em qualquer horário.', custoMoedas: 30, arquivo: 'cafe-pao-de-queijo.jpg' },
  { nome: '20% de desconto no lanche', descricao: 'Desconto em qualquer sanduíche do cardápio.', custoMoedas: 50, arquivo: 'desconto-lanche.jpg' },
  { nome: 'Almoço executivo', descricao: 'Prato do dia com suco e sobremesa.', custoMoedas: 80, arquivo: 'almoco-executivo.jpg' },
];

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
      update: { senhaHash },
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
    update: { senhaHash },
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

  const cantina = await prisma.usuario.upsert({
    where: { login: 'cantina' },
    update: { senhaHash },
    create: {
      email: 'contato@cantinacentral.com.br',
      login: 'cantina',
      senhaHash,
      tipo: 'EMPRESA',
      empresa: { create: { nome: 'Cantina Central', cnpj: '11222333000181' } },
    },
  });

  for (const { arquivo, ...vantagem } of VANTAGENS_DEMO) {
    const existente = await prisma.vantagem.findFirst({ where: { empresaId: cantina.id, nome: vantagem.nome }, select: { id: true } });
    if (existente) continue;
    const foto = fs.readFileSync(new URL(`./imagens/${arquivo}`, import.meta.url));
    await prisma.vantagem.create({ data: { ...vantagem, empresaId: cantina.id, foto, fotoTipo: 'image/jpeg' } });
  }
}

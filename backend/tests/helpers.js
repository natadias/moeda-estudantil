import request from 'supertest';
import app from '../src/app.js';
import prisma from '../src/config/prisma.js';
import { popularBase, SENHA_PROFESSORES } from '../prisma/dados.js';

export const api = () => request(app);
export const auth = (token) => ({ Authorization: `Bearer ${token}` });

export const PNG = Buffer.from(
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=',
  'base64',
);

export async function resetarBanco() {
  await prisma.$executeRawUnsafe(
    'TRUNCATE transacao, vantagem, endereco, aluno, professor, empresa_parceira, usuario, instituicao_ensino RESTART IDENTITY CASCADE',
  );
  await popularBase(prisma);
}

export async function login(usuario, senha) {
  const res = await api().post('/api/auth/login').send({ login: usuario, senha });
  return res.body.token;
}

export const loginProfessor = (usuario) => login(usuario, SENHA_PROFESSORES);

export const instituicaoPorNome = (nome) => prisma.instituicaoEnsino.findFirstOrThrow({ where: { nome } });

let contador = 0;
const CPFS = ['39053344705', '16899535009', '74682489070', '86288366757', '07068093868'];

export function novoAluno(instituicaoId, extras = {}) {
  const n = contador++;
  return {
    nome: `Aluno ${n}`,
    email: `aluno${n}@email.com`,
    login: `aluno${n}`,
    senha: 'segredo1',
    cpf: CPFS[n % CPFS.length],
    rg: `MG-${n}`,
    curso: 'Engenharia de Software',
    instituicaoId,
    endereco: { logradouro: 'Rua A', numero: '10', bairro: 'Centro', cidade: 'Belo Horizonte', estado: 'MG', cep: '30140-000' },
    ...extras,
  };
}

export function novaEmpresa(cnpj, extras = {}) {
  const n = contador++;
  return { nome: `Empresa ${n}`, cnpj, email: `empresa${n}@email.com`, login: `empresa${n}`, senha: 'segredo1', ...extras };
}

export { prisma };

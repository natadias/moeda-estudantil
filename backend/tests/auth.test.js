import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { api, auth, loginProfessor, prisma, resetarBanco } from './helpers.js';

describe('Autenticação', () => {
  before(resetarBanco);
  after(() => prisma.$disconnect());

  it('autentica professor pré-cadastrado e devolve token e perfil', async () => {
    const res = await api().post('/api/auth/login').send({ login: 'ana.souza', senha: 'professor123' });
    assert.equal(res.status, 200);
    assert.ok(res.body.token);
    assert.equal(res.body.usuario.tipo, 'PROFESSOR');
    assert.equal(res.body.usuario.nome, 'Ana Souza');
  });

  it('aceita o email no lugar do login', async () => {
    const res = await api().post('/api/auth/login').send({ login: 'ANA.SOUZA@pucminas.br', senha: 'professor123' });
    assert.equal(res.status, 200);
  });

  it('rejeita senha errada sem revelar qual campo está incorreto', async () => {
    const res = await api().post('/api/auth/login').send({ login: 'ana.souza', senha: 'errada' });
    assert.equal(res.status, 401);
    assert.equal(res.body.erro, 'Login ou senha inválidos.');
  });

  it('exige login e senha', async () => {
    const res = await api().post('/api/auth/login').send({});
    assert.equal(res.status, 422);
  });

  it('protege rotas sem token ou com token inválido', async () => {
    assert.equal((await api().get('/api/auth/eu')).status, 401);
    assert.equal((await api().get('/api/auth/eu').set(auth('xyz'))).status, 401);
  });

  it('devolve o usuário autenticado em /auth/eu', async () => {
    const token = await loginProfessor('carlos.lima');
    const res = await api().get('/api/auth/eu').set(auth(token));
    assert.equal(res.status, 200);
    assert.equal(res.body.login, 'carlos.lima');
  });
});

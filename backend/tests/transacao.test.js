import assert from 'node:assert/strict';
import { after, before, beforeEach, describe, it, mock } from 'node:test';
import creditoSemestralService from '../src/services/CreditoSemestralService.js';
import emailService from '../src/services/EmailService.js';
import { semestreAtual } from '../src/utils/semestre.js';
import {
  PNG,
  api,
  auth,
  instituicaoPorNome,
  login,
  loginProfessor,
  novaEmpresa,
  novoAluno,
  prisma,
  resetarBanco,
} from './helpers.js';

const saldoProfessor = async (login) => (await prisma.professor.findFirst({ where: { usuario: { login } } })).saldoMoedas;
const saldoAluno = async (id) => (await prisma.aluno.findUnique({ where: { id } })).saldoMoedas;

describe('Envio de moedas, resgate, extrato e crédito semestral', () => {
  let ana; // PUC Minas
  let carlos; // UFMG
  let aluno;
  let tokenAluno;
  let alunoUfmg;
  let tokenEmpresa;
  let empresa;
  let vantagem;
  let emails;

  before(async () => {
    await resetarBanco();
    ana = await loginProfessor('ana.souza');
    carlos = await loginProfessor('carlos.lima');
    const puc = await instituicaoPorNome('PUC Minas');
    const ufmg = await instituicaoPorNome('Universidade Federal de Minas Gerais');

    const dadosAluno = novoAluno(puc.id);
    aluno = (await api().post('/api/alunos').send(dadosAluno)).body;
    tokenAluno = await login(dadosAluno.login, dadosAluno.senha);
    alunoUfmg = (await api().post('/api/alunos').send(novoAluno(ufmg.id))).body;

    const dadosEmpresa = novaEmpresa('11222333000181');
    empresa = (await api().post('/api/empresas').send(dadosEmpresa)).body;
    tokenEmpresa = await login(dadosEmpresa.login, dadosEmpresa.senha);
    vantagem = (
      await api()
        .post('/api/vantagens')
        .set(auth(tokenEmpresa))
        .field('nome', 'Almoço executivo')
        .field('descricao', 'Prato do dia com suco')
        .field('custoMoedas', '80')
        .attach('foto', PNG, 'almoco.png')
    ).body;
  });

  beforeEach(() => {
    emails = mock.method(emailService, 'enviar', async () => ({}));
  });
  after(async () => {
    mock.restoreAll();
    await prisma.$disconnect();
  });

  it('professor envia moedas a um aluno da sua instituição e o aluno é notificado', async () => {
    const res = await api().post('/api/transferencias').set(auth(ana)).send({ alunoId: aluno.id, valor: 100, motivo: 'Ótima apresentação' });
    assert.equal(res.status, 201);
    assert.equal(res.body.tipo, 'TRANSFERENCIA');
    assert.equal(res.body.aluno.nome, aluno.nome);
    assert.equal(await saldoProfessor('ana.souza'), 900);
    assert.equal(await saldoAluno(aluno.id), 100);

    assert.equal(emails.mock.callCount(), 1);
    const [{ para, texto }] = emails.mock.calls[0].arguments;
    assert.equal(para, aluno.email);
    assert.match(texto, /Ana Souza enviou 100 moedas/);
    assert.match(texto, /Ótima apresentação/);
  });

  it('exige motivo, valor inteiro positivo e aluno da mesma instituição', async () => {
    const res = await api().post('/api/transferencias').set(auth(ana)).send({ alunoId: alunoUfmg.id, valor: 2.5, motivo: ' ' });
    assert.equal(res.status, 422);
    assert.ok(res.body.detalhes.motivo);
    assert.ok(res.body.detalhes.valor);
    assert.equal(res.body.detalhes.alunoId, 'O aluno não é da sua instituição.');
    assert.equal(emails.mock.callCount(), 0);
  });

  it('não envia mais do que o saldo do professor', async () => {
    const res = await api().post('/api/transferencias').set(auth(ana)).send({ alunoId: aluno.id, valor: 901, motivo: 'Teste' });
    assert.equal(res.status, 422);
    assert.match(res.body.detalhes.valor, /Saldo insuficiente/);
    assert.equal(await saldoProfessor('ana.souza'), 900);
  });

  it('envios simultâneos não deixam o saldo negativo', async () => {
    const envio = () => api().post('/api/transferencias').set(auth(carlos)).send({ alunoId: alunoUfmg.id, valor: 600, motivo: 'Monitoria' });
    const respostas = await Promise.all([envio(), envio()]);
    assert.deepEqual(respostas.map((r) => r.status).sort(), [201, 422]);
    assert.equal(await saldoProfessor('carlos.lima'), 400);
  });

  it('somente professores enviam moedas', async () => {
    const res = await api().post('/api/transferencias').set(auth(tokenAluno)).send({ alunoId: aluno.id, valor: 1, motivo: 'x' });
    assert.equal(res.status, 403);
  });

  it('aluno sem saldo suficiente não resgata', async () => {
    await prisma.aluno.update({ where: { id: aluno.id }, data: { saldoMoedas: 50 } });
    const res = await api().post('/api/resgates').set(auth(tokenAluno)).send({ vantagemId: vantagem.id });
    assert.equal(res.status, 422);
    assert.match(res.body.erro, /custa 80 moedas e você tem 50/);
    await prisma.aluno.update({ where: { id: aluno.id }, data: { saldoMoedas: 100 } });
  });

  it('aluno resgata vantagem: débito, cupom único e emails para aluno e empresa', async () => {
    const res = await api().post('/api/resgates').set(auth(tokenAluno)).send({ vantagemId: vantagem.id });
    assert.equal(res.status, 201);
    assert.match(res.body.codigoCupom, /^[A-Z2-9]{4}-[A-Z2-9]{4}$/);
    assert.equal(res.body.valor, 80);
    assert.equal(res.body.vantagem.empresa.nome, empresa.nome);
    assert.equal(await saldoAluno(aluno.id), 20);

    assert.equal(emails.mock.callCount(), 2);
    const [paraAluno, paraEmpresa] = emails.mock.calls.map((c) => c.arguments[0]);
    assert.equal(paraAluno.para, aluno.email);
    assert.equal(paraEmpresa.para, empresa.email);
    assert.ok(paraAluno.texto.includes(res.body.codigoCupom));
    assert.ok(paraEmpresa.texto.includes(res.body.codigoCupom));
  });

  it('não resgata vantagem inativa', async () => {
    await prisma.vantagem.update({ where: { id: vantagem.id }, data: { ativa: false } });
    const res = await api().post('/api/resgates').set(auth(tokenAluno)).send({ vantagemId: vantagem.id });
    assert.equal(res.status, 404);
    await prisma.vantagem.update({ where: { id: vantagem.id }, data: { ativa: true } });
  });

  it('extrato do aluno mostra saldo, recebimentos e resgates', async () => {
    const res = await api().get('/api/extrato').set(auth(tokenAluno));
    assert.equal(res.status, 200);
    assert.equal(res.body.saldo, 20);
    assert.deepEqual(res.body.transacoes.map((t) => [t.tipo, t.natureza]), [
      ['RESGATE', 'SAIDA'],
      ['TRANSFERENCIA', 'ENTRADA'],
    ]);
    const [resgate, recebida] = res.body.transacoes;
    assert.equal(resgate.vantagem.nome, 'Almoço executivo');
    assert.equal(recebida.professor.nome, 'Ana Souza');
    assert.equal(recebida.motivo, 'Ótima apresentação');
    assert.equal(recebida.aluno.email, undefined);
  });

  it('extrato do professor mostra saldo, créditos e envios', async () => {
    const res = await api().get('/api/extrato').set(auth(ana));
    assert.equal(res.body.saldo, 900);
    assert.deepEqual(res.body.transacoes.map((t) => [t.tipo, t.natureza]), [
      ['TRANSFERENCIA', 'SAIDA'],
      ['CREDITO_SEMESTRAL', 'ENTRADA'],
    ]);
  });

  it('empresa vê os cupons resgatados das suas vantagens', async () => {
    const res = await api().get('/api/extrato').set(auth(tokenEmpresa));
    assert.equal(res.body.saldo, null);
    assert.equal(res.body.transacoes.length, 1);
    assert.equal(res.body.transacoes[0].aluno.nome, aluno.nome);
    assert.ok(res.body.transacoes[0].codigoCupom);
  });

  it('crédito semestral soma 1.000 moedas uma única vez por semestre', async () => {
    const atual = await creditoSemestralService.creditar();
    assert.equal(atual.semestre, semestreAtual());
    assert.equal(atual.professoresCreditados, 0);

    const [ano, numero] = semestreAtual().split('.').map(Number);
    const proximo = numero === 1 ? `${ano}.2` : `${ano + 1}.1`;
    const novo = await creditoSemestralService.creditar(proximo);
    assert.equal(novo.professoresCreditados, 2);
    assert.equal(await saldoProfessor('ana.souza'), 1900);
    assert.equal(await saldoProfessor('carlos.lima'), 1400);

    const repetido = await creditoSemestralService.creditar(proximo);
    assert.equal(repetido.professoresCreditados, 0);
    assert.equal(await saldoProfessor('ana.souza'), 1900);
  });
});

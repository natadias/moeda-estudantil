import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { api, auth, instituicaoPorNome, login, loginProfessor, novoAluno, prisma, resetarBanco } from './helpers.js';

describe('CRUD de aluno', () => {
  let puc;
  let ufmg;
  let aluno;
  let token;

  before(async () => {
    await resetarBanco();
    puc = await instituicaoPorNome('PUC Minas');
    ufmg = await instituicaoPorNome('Universidade Federal de Minas Gerais');
  });
  after(() => prisma.$disconnect());

  it('cadastra aluno sem autenticação, sem devolver a senha', async () => {
    const dados = novoAluno(puc.id);
    const res = await api().post('/api/alunos').send(dados);
    assert.equal(res.status, 201);
    assert.equal(res.body.saldoMoedas, 0);
    assert.equal(res.body.instituicao.nome, 'PUC Minas');
    assert.equal(res.body.endereco.cep, '30140000');
    assert.equal(res.body.senha, undefined);
    assert.equal(res.body.senhaHash, undefined);
    aluno = { ...dados, id: res.body.id };
    token = await login(dados.login, dados.senha);
    assert.ok(token);
  });

  it('valida campos obrigatórios, CPF e instituição', async () => {
    const res = await api().post('/api/alunos').send({ ...novoAluno(999), cpf: '123.456.789-00', endereco: {} });
    assert.equal(res.status, 422);
    assert.equal(res.body.detalhes.cpf, 'CPF inválido.');
    assert.equal(res.body.detalhes.instituicaoId, 'Instituição de ensino não encontrada.');
    assert.equal(res.body.detalhes['endereco.cep'], 'Campo obrigatório.');
  });

  it('rejeita CPF duplicado', async () => {
    const res = await api().post('/api/alunos').send({ ...novoAluno(puc.id), cpf: aluno.cpf });
    assert.equal(res.status, 409);
    assert.ok(res.body.detalhes.cpf);
  });

  it('aluno consulta o próprio cadastro, mas não o de outro aluno', async () => {
    const proprio = await api().get(`/api/alunos/${aluno.id}`).set(auth(token));
    assert.equal(proprio.status, 200);

    const outro = await api().post('/api/alunos').send(novoAluno(ufmg.id));
    const alheio = await api().get(`/api/alunos/${outro.body.id}`).set(auth(token));
    assert.equal(alheio.status, 403);
  });

  it('aluno atualiza dados, endereço, instituição e senha', async () => {
    const res = await api()
      .put(`/api/alunos/${aluno.id}`)
      .set(auth(token))
      .send({
        ...aluno,
        senha: 'novaSenha1',
        curso: 'Ciência da Computação',
        instituicaoId: ufmg.id,
        endereco: { ...aluno.endereco, complemento: 'apto 2' },
      });
    assert.equal(res.status, 200);
    assert.equal(res.body.curso, 'Ciência da Computação');
    assert.equal(res.body.instituicao.id, ufmg.id);
    assert.equal(res.body.endereco.complemento, 'apto 2');

    assert.equal(await login(aluno.login, aluno.senha), undefined);
    token = await login(aluno.login, 'novaSenha1');
    assert.ok(token);
  });

  it('mantém a senha quando ela não é enviada na edição', async () => {
    const res = await api()
      .put(`/api/alunos/${aluno.id}`)
      .set(auth(token))
      .send({ ...aluno, senha: '', instituicaoId: ufmg.id });
    assert.equal(res.status, 200);
    assert.ok(await login(aluno.login, 'novaSenha1'));
  });

  it('professor lista apenas os alunos da sua instituição', async () => {
    const carlos = await loginProfessor('carlos.lima'); // UFMG
    const ana = await loginProfessor('ana.souza'); // PUC Minas
    const daUfmg = await api().get('/api/alunos').set(auth(carlos));
    const daPuc = await api().get('/api/alunos').set(auth(ana));
    assert.equal(daUfmg.status, 200);
    assert.ok(daUfmg.body.some((a) => a.id === aluno.id));
    assert.ok(daUfmg.body.every((a) => a.instituicao.id === ufmg.id));
    assert.ok(!daPuc.body.some((a) => a.id === aluno.id));
  });

  it('aluno não pode listar todos os alunos', async () => {
    const res = await api().get('/api/alunos').set(auth(token));
    assert.equal(res.status, 403);
  });

  it('aluno exclui a própria conta e não consegue mais entrar', async () => {
    const res = await api().delete(`/api/alunos/${aluno.id}`).set(auth(token));
    assert.equal(res.status, 204);
    assert.equal(await login(aluno.login, 'novaSenha1'), undefined);
    assert.equal(await prisma.endereco.count({ where: { alunoId: aluno.id } }), 0);
  });
});

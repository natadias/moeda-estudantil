import assert from 'node:assert/strict';
import { after, before, describe, it } from 'node:test';
import { PNG, PNG_AZUL, api, auth, instituicaoPorNome, login, novaEmpresa, novoAluno, prisma, resetarBanco } from './helpers.js';

function enviarVantagem(req, campos, foto = PNG, nomeArquivo = 'foto.png') {
  for (const [chave, valor] of Object.entries(campos)) req.field(chave, String(valor));
  if (foto) req.attach('foto', foto, nomeArquivo);
  return req;
}

describe('CRUD de empresa parceira e vantagens', () => {
  let empresa;
  let token;
  let outraEmpresa;
  let tokenOutra;
  let tokenAluno;
  let alunoId;
  let vantagem;

  before(async () => {
    await resetarBanco();
    const puc = await instituicaoPorNome('PUC Minas');
    const dadosAluno = novoAluno(puc.id);
    alunoId = (await api().post('/api/alunos').send(dadosAluno)).body.id;
    tokenAluno = await login(dadosAluno.login, dadosAluno.senha);
  });
  after(() => prisma.$disconnect());

  it('cadastra empresa sem autenticação', async () => {
    const dados = novaEmpresa('11.222.333/0001-81');
    const res = await api().post('/api/empresas').send(dados);
    assert.equal(res.status, 201);
    assert.equal(res.body.cnpj, '11222333000181');
    assert.equal(res.body.senhaHash, undefined);
    empresa = { ...dados, id: res.body.id };
    token = await login(dados.login, dados.senha);

    const dadosOutra = novaEmpresa('11444777000161');
    outraEmpresa = (await api().post('/api/empresas').send(dadosOutra)).body;
    tokenOutra = await login(dadosOutra.login, dadosOutra.senha);
    assert.ok(token && tokenOutra);
  });

  it('valida CNPJ e rejeita duplicados', async () => {
    const invalido = await api().post('/api/empresas').send(novaEmpresa('11222333000100'));
    assert.equal(invalido.status, 422);
    const duplicado = await api().post('/api/empresas').send(novaEmpresa(empresa.cnpj));
    assert.equal(duplicado.status, 409);
  });

  it('lista empresas publicamente sem expor o login', async () => {
    const res = await api().get('/api/empresas');
    assert.equal(res.status, 200);
    assert.equal(res.body.length, 2);
    assert.ok(res.body.every((e) => e.login === undefined));
  });

  it('empresa consulta e edita o próprio cadastro, mas não o de outra empresa', async () => {
    const proprio = await api().get(`/api/empresas/${empresa.id}`).set(auth(token));
    assert.equal(proprio.body.login, empresa.login);

    const res = await api().put(`/api/empresas/${empresa.id}`).set(auth(token)).send({ ...empresa, nome: 'Cantina Nova' });
    assert.equal(res.status, 200);
    assert.equal(res.body.nome, 'Cantina Nova');

    const alheio = await api().put(`/api/empresas/${outraEmpresa.id}`).set(auth(token)).send(empresa);
    assert.equal(alheio.status, 403);
    const porAluno = await api().put(`/api/empresas/${empresa.id}`).set(auth(tokenAluno)).send(empresa);
    assert.equal(porAluno.status, 403);
  });

  it('exige foto (imagem) e custo válido ao cadastrar vantagem', async () => {
    const semFoto = await enviarVantagem(api().post('/api/vantagens').set(auth(token)), { nome: 'X', descricao: 'Y', custoMoedas: 0 }, null);
    assert.equal(semFoto.status, 422);
    assert.ok(semFoto.body.detalhes.foto);
    assert.ok(semFoto.body.detalhes.custoMoedas);

    const naoImagem = await enviarVantagem(
      api().post('/api/vantagens').set(auth(token)),
      { nome: 'X', descricao: 'Y', custoMoedas: 10 },
      Buffer.from('texto'),
      'arquivo.txt',
    );
    assert.equal(naoImagem.status, 422);
  });

  it('cadastra vantagem com foto acessível por URL', async () => {
    const res = await enviarVantagem(api().post('/api/vantagens').set(auth(token)), {
      nome: 'Desconto no almoço',
      descricao: '20% de desconto no prato do dia',
      custoMoedas: 50,
    });
    assert.equal(res.status, 201);
    assert.equal(res.body.empresa.id, empresa.id);
    assert.match(res.body.fotoUrl, /^\/api\/vantagens\/\d+\/foto\?v=\d+$/);
    assert.equal(res.body.foto, undefined);
    vantagem = res.body;

    const foto = await api().get(vantagem.fotoUrl);
    assert.equal(foto.status, 200);
    assert.equal(foto.headers['content-type'], 'image/png');
    assert.deepEqual(foto.body, PNG);
  });

  it('somente empresas cadastram vantagens', async () => {
    const res = await enviarVantagem(api().post('/api/vantagens').set(auth(tokenAluno)), { nome: 'X', descricao: 'Y', custoMoedas: 10 });
    assert.equal(res.status, 403);
  });

  it('aluno vê o catálogo de vantagens ativas', async () => {
    const res = await api().get('/api/vantagens').set(auth(tokenAluno));
    assert.equal(res.status, 200);
    assert.deepEqual(res.body.map((v) => v.id), [vantagem.id]);
  });

  it('edita vantagem mantendo a foto e pode desativá-la', async () => {
    const res = await enviarVantagem(
      api().put(`/api/vantagens/${vantagem.id}`).set(auth(token)),
      { nome: 'Desconto no almoço', descricao: '25% de desconto', custoMoedas: 60, ativa: false },
      null,
    );
    assert.equal(res.status, 200);
    assert.equal(res.body.custoMoedas, 60);
    assert.equal(res.body.ativa, false);
    assert.equal(res.body.fotoUrl, vantagem.fotoUrl);

    const catalogo = await api().get('/api/vantagens').set(auth(tokenAluno));
    assert.equal(catalogo.body.length, 0);
    const daEmpresa = await api().get('/api/vantagens').set(auth(token));
    assert.equal(daEmpresa.body.length, 1);
  });

  it('troca a foto e muda a URL para o navegador não usar a antiga do cache', async () => {
    await new Promise((r) => setTimeout(r, 5));
    const res = await enviarVantagem(
      api().put(`/api/vantagens/${vantagem.id}`).set(auth(token)),
      { nome: 'Desconto no almoço', descricao: '25% de desconto', custoMoedas: 60, ativa: true },
      PNG_AZUL,
    );
    assert.equal(res.status, 200);
    assert.notEqual(res.body.fotoUrl, vantagem.fotoUrl);
    const foto = await api().get(res.body.fotoUrl);
    assert.deepEqual(foto.body, PNG_AZUL);
    vantagem = res.body;
  });

  it('outra empresa não altera nem exclui a vantagem', async () => {
    const edicao = await enviarVantagem(api().put(`/api/vantagens/${vantagem.id}`).set(auth(tokenOutra)), { nome: 'X', descricao: 'Y', custoMoedas: 1 }, null);
    assert.equal(edicao.status, 404);
    const exclusao = await api().delete(`/api/vantagens/${vantagem.id}`).set(auth(tokenOutra));
    assert.equal(exclusao.status, 404);
  });

  it('vantagem já resgatada é desativada em vez de excluída', async () => {
    await prisma.transacao.create({ data: { tipo: 'RESGATE', valor: 60, alunoId, vantagemId: vantagem.id, codigoCupom: 'TESTE-001' } });
    const res = await api().delete(`/api/vantagens/${vantagem.id}`).set(auth(token));
    assert.equal(res.status, 200);
    const atual = await prisma.vantagem.findUnique({ where: { id: vantagem.id } });
    assert.equal(atual.ativa, false);
  });

  it('empresa com vantagens resgatadas não pode ser excluída', async () => {
    const res = await api().delete(`/api/empresas/${empresa.id}`).set(auth(token));
    assert.equal(res.status, 409);
  });

  it('aluno com transações não pode excluir a conta', async () => {
    const res = await api().delete(`/api/alunos/${alunoId}`).set(auth(tokenAluno));
    assert.equal(res.status, 409);
  });

  it('exclui vantagem sem resgates junto com a foto', async () => {
    const nova = await enviarVantagem(api().post('/api/vantagens').set(auth(tokenOutra)), { nome: 'Caderno', descricao: 'Caderno universitário', custoMoedas: 30 });
    const res = await api().delete(`/api/vantagens/${nova.body.id}`).set(auth(tokenOutra));
    assert.equal(res.status, 204);
    assert.equal((await api().get(nova.body.fotoUrl)).status, 404);
  });

  it('empresa sem resgates exclui a própria conta junto com as vantagens', async () => {
    await enviarVantagem(api().post('/api/vantagens').set(auth(tokenOutra)), { nome: 'Caneta', descricao: 'Caneta azul', custoMoedas: 5 });
    const res = await api().delete(`/api/empresas/${outraEmpresa.id}`).set(auth(tokenOutra));
    assert.equal(res.status, 204);
    assert.equal(await prisma.vantagem.count({ where: { empresaId: outraEmpresa.id } }), 0);
  });
});

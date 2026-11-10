import { Router } from 'express';
import alunoController from '../controllers/AlunoController.js';
import authController from '../controllers/AuthController.js';
import empresaController from '../controllers/EmpresaParceiraController.js';
import instituicaoController from '../controllers/InstituicaoEnsinoController.js';
import vantagemController from '../controllers/VantagemController.js';
import { autenticar, autorizar, somenteProprio } from '../middlewares/autenticacao.js';
import { receberFoto } from '../middlewares/upload.js';

const routes = Router();

routes.post('/auth/login', authController.login);
routes.get('/auth/eu', autenticar, authController.eu);

routes.get('/instituicoes', instituicaoController.listar);

routes.post('/alunos', alunoController.cadastrar);
routes.get('/alunos', autenticar, autorizar('PROFESSOR'), alunoController.listar);
routes.get('/alunos/:id', autenticar, autorizar('ALUNO'), somenteProprio, alunoController.buscarPorId);
routes.put('/alunos/:id', autenticar, autorizar('ALUNO'), somenteProprio, alunoController.atualizar);
routes.delete('/alunos/:id', autenticar, autorizar('ALUNO'), somenteProprio, alunoController.excluir);

routes.post('/empresas', empresaController.cadastrar);
routes.get('/empresas', empresaController.listar);
routes.get('/empresas/:id', autenticar, autorizar('EMPRESA'), somenteProprio, empresaController.buscarPorId);
routes.put('/empresas/:id', autenticar, autorizar('EMPRESA'), somenteProprio, empresaController.atualizar);
routes.delete('/empresas/:id', autenticar, autorizar('EMPRESA'), somenteProprio, empresaController.excluir);

routes.get('/vantagens', autenticar, vantagemController.listar);
routes.get('/vantagens/:id', autenticar, vantagemController.buscarPorId);
routes.post('/vantagens', autenticar, autorizar('EMPRESA'), receberFoto, vantagemController.cadastrar);
routes.put('/vantagens/:id', autenticar, autorizar('EMPRESA'), receberFoto, vantagemController.atualizar);
routes.delete('/vantagens/:id', autenticar, autorizar('EMPRESA'), vantagemController.excluir);

export default routes;

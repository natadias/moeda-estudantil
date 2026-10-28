import { Router } from 'express';
import alunoController from '../controllers/AlunoController.js';
import empresaController from '../controllers/EmpresaParceiraController.js';
import instituicaoController from '../controllers/InstituicaoEnsinoController.js';
import crudRoutes from './crudRoutes.js';

const routes = Router();

routes.get('/instituicoes', (req, res) => instituicaoController.listar(req, res));
routes.use('/alunos', crudRoutes(alunoController));
routes.use('/empresas', crudRoutes(empresaController));

export default routes;

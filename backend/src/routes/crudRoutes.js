import { Router } from 'express';

export default function crudRoutes(controller) {
  const router = Router();
  router.get('/', (req, res) => controller.listar(req, res));
  router.get('/:id', (req, res) => controller.buscarPorId(req, res));
  router.post('/', (req, res) => controller.cadastrar(req, res));
  router.put('/:id', (req, res) => controller.atualizar(req, res));
  router.delete('/:id', (req, res) => controller.excluir(req, res));
  return router;
}

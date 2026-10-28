import alunoService from '../services/AlunoService.js';
import parseId from '../utils/parseId.js';

class AlunoController {
  async listar(req, res) {
    res.json(await alunoService.listar());
  }

  async buscarPorId(req, res) {
    res.json(await alunoService.buscarPorId(parseId(req.params.id)));
  }

  async cadastrar(req, res) {
    res.status(201).json(await alunoService.cadastrar(req.body ?? {}));
  }

  async atualizar(req, res) {
    res.json(await alunoService.atualizar(parseId(req.params.id), req.body ?? {}));
  }

  async excluir(req, res) {
    await alunoService.excluir(parseId(req.params.id));
    res.status(204).end();
  }
}

export default new AlunoController();

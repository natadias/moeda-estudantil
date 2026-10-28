import empresaService from '../services/EmpresaParceiraService.js';
import parseId from '../utils/parseId.js';

class EmpresaParceiraController {
  async listar(req, res) {
    res.json(await empresaService.listar());
  }

  async buscarPorId(req, res) {
    res.json(await empresaService.buscarPorId(parseId(req.params.id)));
  }

  async cadastrar(req, res) {
    res.status(201).json(await empresaService.cadastrar(req.body ?? {}));
  }

  async atualizar(req, res) {
    res.json(await empresaService.atualizar(parseId(req.params.id), req.body ?? {}));
  }

  async excluir(req, res) {
    await empresaService.excluir(parseId(req.params.id));
    res.status(204).end();
  }
}

export default new EmpresaParceiraController();

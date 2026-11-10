import vantagemService from '../services/VantagemService.js';
import parseId from '../utils/parseId.js';

class VantagemController {
  async listar(req, res) {
    const { tipo, id } = req.usuario;
    const filtro = tipo === 'EMPRESA' ? { empresaId: id } : { somenteAtivas: true };
    res.json(await vantagemService.listar(filtro));
  }

  async buscarPorId(req, res) {
    res.json(await vantagemService.buscarPorId(parseId(req.params.id)));
  }

  async cadastrar(req, res) {
    res.status(201).json(await vantagemService.cadastrar(req.usuario.id, req.body ?? {}));
  }

  async atualizar(req, res) {
    res.json(await vantagemService.atualizar(req.usuario.id, parseId(req.params.id), req.body ?? {}));
  }

  async excluir(req, res) {
    const { desativada } = await vantagemService.excluir(req.usuario.id, parseId(req.params.id));
    if (desativada) return res.json({ mensagem: 'A vantagem já foi resgatada e foi desativada em vez de excluída.' });
    res.status(204).end();
  }
}

export default new VantagemController();

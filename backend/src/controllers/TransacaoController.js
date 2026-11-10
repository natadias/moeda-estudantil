import resgateService from '../services/ResgateService.js';
import transacaoService from '../services/TransacaoService.js';

class TransacaoController {
  async enviarMoedas(req, res) {
    res.status(201).json(await transacaoService.enviarMoedas(req.usuario.id, req.body ?? {}));
  }

  async resgatar(req, res) {
    res.status(201).json(await resgateService.resgatar(req.usuario.id, req.body ?? {}));
  }

  async extrato(req, res) {
    res.json(await transacaoService.extrato(req.usuario));
  }
}

export default new TransacaoController();

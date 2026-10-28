import instituicaoService from '../services/InstituicaoEnsinoService.js';

class InstituicaoEnsinoController {
  async listar(req, res) {
    res.json(await instituicaoService.listar());
  }
}

export default new InstituicaoEnsinoController();

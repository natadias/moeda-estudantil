import authService from '../services/AuthService.js';

class AuthController {
  async login(req, res) {
    res.json(await authService.login(req.body ?? {}));
  }

  async eu(req, res) {
    res.json(await authService.usuarioAtual(req.usuario.id));
  }
}

export default new AuthController();

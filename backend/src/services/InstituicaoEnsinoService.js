import instituicaoDAO from '../dao/InstituicaoEnsinoDAO.js';

class InstituicaoEnsinoService {
  listar() {
    return instituicaoDAO.findAll();
  }
}

export default new InstituicaoEnsinoService();

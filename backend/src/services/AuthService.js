import jwt from 'jsonwebtoken';
import { JWT_EXPIRES_IN, JWT_SECRET } from '../config/auth.js';
import usuarioDAO from '../dao/UsuarioDAO.js';
import AppError from '../utils/AppError.js';
import { preenchido } from '../utils/validators.js';
import { conferirSenha } from './senha.js';

function paraResposta(usuario) {
  const perfil = usuario.aluno ?? usuario.professor ?? usuario.empresa;
  return { id: usuario.id, tipo: usuario.tipo, nome: perfil?.nome, email: usuario.email, login: usuario.login };
}

class AuthService {
  async login({ login, senha } = {}) {
    if (!preenchido(login) || !preenchido(senha)) {
      throw new AppError('Informe login e senha.', 422);
    }
    const usuario = await usuarioDAO.findByLoginOuEmail(login.trim());
    if (!usuario || !(await conferirSenha(senha, usuario.senhaHash))) {
      throw new AppError('Login ou senha inválidos.', 401);
    }
    const token = jwt.sign({ tipo: usuario.tipo }, JWT_SECRET, { subject: String(usuario.id), expiresIn: JWT_EXPIRES_IN });
    return { token, usuario: paraResposta(usuario) };
  }

  verificarToken(token) {
    try {
      const { sub, tipo } = jwt.verify(token, JWT_SECRET);
      return { id: Number(sub), tipo };
    } catch {
      throw new AppError('Sessão inválida ou expirada. Faça login novamente.', 401);
    }
  }

  async usuarioAtual(id) {
    const usuario = await usuarioDAO.findById(id);
    if (!usuario) throw new AppError('Usuário não encontrado.', 401);
    return paraResposta(usuario);
  }
}

export default new AuthService();

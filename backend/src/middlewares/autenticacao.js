import authService from '../services/AuthService.js';
import AppError from '../utils/AppError.js';

export function autenticar(req, res, next) {
  const [esquema, token] = (req.headers.authorization ?? '').split(' ');
  if (esquema !== 'Bearer' || !token) throw new AppError('Autenticação necessária.', 401);
  req.usuario = authService.verificarToken(token);
  next();
}

export const autorizar = (...tipos) => (req, res, next) => {
  if (!tipos.includes(req.usuario?.tipo)) throw new AppError('Acesso não permitido para este perfil.', 403);
  next();
};

export function somenteProprio(req, res, next) {
  if (Number(req.params.id) !== req.usuario?.id) throw new AppError('Você só pode acessar o seu próprio cadastro.', 403);
  next();
}

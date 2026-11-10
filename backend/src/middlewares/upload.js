import { uploadFoto, urlDoArquivo } from '../config/upload.js';
import AppError from '../utils/AppError.js';

export function receberFoto(req, res, next) {
  uploadFoto(req, res, (erro) => {
    if (erro?.code === 'LIMIT_FILE_SIZE') return next(new AppError('Dados inválidos.', 422, { foto: 'A imagem deve ter no máximo 2 MB.' }));
    if (erro) return next(erro);
    req.body = { ...req.body };
    delete req.body.fotoUrl;
    if (req.file) req.body.fotoUrl = urlDoArquivo(req.file);
    next();
  });
}

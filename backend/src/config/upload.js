import multer from 'multer';
import AppError from '../utils/AppError.js';

const TIPOS_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export const uploadFoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (TIPOS_PERMITIDOS.includes(file.mimetype)) return cb(null, true);
    cb(new AppError('Dados inválidos.', 422, { foto: 'Envie uma imagem JPG, PNG, WEBP ou GIF.' }));
  },
}).single('foto');

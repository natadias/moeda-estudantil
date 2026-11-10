import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import multer from 'multer';
import AppError from '../utils/AppError.js';

export const UPLOAD_DIR = path.resolve(process.env.UPLOAD_DIR ?? 'uploads');
export const UPLOAD_URL = '/uploads';

fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const TIPOS_PERMITIDOS = { 'image/jpeg': '.jpg', 'image/png': '.png', 'image/webp': '.webp', 'image/gif': '.gif' };

export const uploadFoto = multer({
  storage: multer.diskStorage({
    destination: UPLOAD_DIR,
    filename: (req, file, cb) => cb(null, `${crypto.randomUUID()}${TIPOS_PERMITIDOS[file.mimetype]}`),
  }),
  limits: { fileSize: 2 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (TIPOS_PERMITIDOS[file.mimetype]) return cb(null, true);
    cb(new AppError('Dados inválidos.', 422, { foto: 'Envie uma imagem JPG, PNG, WEBP ou GIF.' }));
  },
}).single('foto');

export const urlDoArquivo = (arquivo) => `${UPLOAD_URL}/${arquivo.filename}`;

export function removerArquivo(url) {
  if (!url?.startsWith(`${UPLOAD_URL}/`)) return;
  fs.rm(path.join(UPLOAD_DIR, path.basename(url)), { force: true }, () => {});
}

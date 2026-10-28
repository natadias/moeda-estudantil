import AppError from './AppError.js';

export default function parseId(valor) {
  const id = Number(valor);
  if (!Number.isInteger(id) || id <= 0) throw new AppError('Identificador inválido.', 400);
  return id;
}

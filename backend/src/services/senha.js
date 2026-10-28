import bcrypt from 'bcryptjs';

const ROUNDS = 10;

export const gerarHash = (senha) => bcrypt.hash(senha, ROUNDS);
export const conferirSenha = (senha, hash) => bcrypt.compare(senha, hash);

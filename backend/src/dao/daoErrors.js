import { Prisma } from '@prisma/client';
import AppError from '../utils/AppError.js';

const NOMES_CAMPOS = {
  email: 'email',
  login: 'login',
  cpf: 'CPF',
  cnpj: 'CNPJ',
};

export const ENTIDADES = {
  aluno: { naoEncontrado: 'Aluno não encontrado.', vinculado: 'O aluno possui transações registradas e não pode ser excluído.' },
  empresa: {
    naoEncontrado: 'Empresa parceira não encontrada.',
    vinculado: 'A empresa possui vantagens já resgatadas e não pode ser excluída.',
  },
};

export function traduzirErro(erro, entidade) {
  if (erro instanceof Prisma.PrismaClientKnownRequestError) {
    switch (erro.code) {
      case 'P2002': {
        const alvo = [].concat(erro.meta?.target ?? []);
        const campo = alvo.map((c) => NOMES_CAMPOS[c] ?? c).join(', ');
        return new AppError(`Já existe um cadastro com este ${campo || 'valor'}.`, 409, { [alvo[0] ?? 'campo']: 'Já cadastrado.' });
      }
      case 'P2025':
        return new AppError(entidade.naoEncontrado, 404);
      case 'P2003':
        return new AppError(entidade.vinculado, 409);
      default:
        break;
    }
  }
  return erro;
}

export async function executar(entidade, operacao) {
  try {
    return await operacao();
  } catch (erro) {
    throw traduzirErro(erro, entidade);
  }
}

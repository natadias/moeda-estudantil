import transacaoDAO from '../dao/TransacaoDAO.js';
import AppError from '../utils/AppError.js';
import { semestreAtual } from '../utils/semestre.js';

export const VALOR_CREDITO_SEMESTRAL = 1000;

class CreditoSemestralService {
  async creditar(semestre = semestreAtual()) {
    if (!/^\d{4}\.[12]$/.test(semestre)) throw new AppError('Semestre inválido. Use o formato 2026.2.', 422);
    const professoresCreditados = await transacaoDAO.creditarSemestre(semestre, VALOR_CREDITO_SEMESTRAL);
    return { semestre, valor: VALOR_CREDITO_SEMESTRAL, professoresCreditados };
  }
}

export default new CreditoSemestralService();

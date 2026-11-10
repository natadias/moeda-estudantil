import cron from 'node-cron';
import creditoSemestralService from '../services/CreditoSemestralService.js';

async function creditarSemestre() {
  try {
    const { semestre, professoresCreditados } = await creditoSemestralService.creditar();
    if (professoresCreditados) console.log(`[agendador] Crédito do semestre ${semestre}: ${professoresCreditados} professor(es).`);
  } catch (erro) {
    console.error('[agendador] Falha no crédito semestral:', erro);
  }
}

export function iniciarAgendador() {
  cron.schedule('5 0 1 1,7 *', creditarSemestre, { timezone: 'America/Sao_Paulo' });
  creditarSemestre();
}

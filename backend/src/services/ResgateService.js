import { randomInt } from 'node:crypto';
import alunoDAO from '../dao/AlunoDAO.js';
import transacaoDAO from '../dao/TransacaoDAO.js';
import vantagemDAO from '../dao/VantagemDAO.js';
import AppError from '../utils/AppError.js';
import emailService from './EmailService.js';
import { paraResposta } from './TransacaoService.js';

const ALFABETO = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

export function gerarCodigoCupom() {
  const parte = () => Array.from({ length: 4 }, () => ALFABETO[randomInt(ALFABETO.length)]).join('');
  return `${parte()}-${parte()}`;
}

class ResgateService {
  async resgatar(alunoId, { vantagemId } = {}) {
    const id = Number(vantagemId);
    const vantagem = Number.isInteger(id) && id > 0 ? await vantagemDAO.findById(id) : null;
    if (!vantagem || !vantagem.ativa) throw new AppError('Vantagem não encontrada ou indisponível.', 404);

    const aluno = await alunoDAO.findById(alunoId);
    if (!aluno) throw new AppError('Aluno não encontrado.', 404);
    const insuficiente = `Saldo insuficiente: a vantagem custa ${vantagem.custoMoedas} moedas e você tem ${aluno.saldoMoedas}.`;
    if (aluno.saldoMoedas < vantagem.custoMoedas) throw new AppError(insuficiente, 422);

    const resgate = await transacaoDAO.resgatar({
      alunoId,
      vantagemId: id,
      valor: vantagem.custoMoedas,
      codigoCupom: gerarCodigoCupom(),
    });
    if (!resgate) throw new AppError(insuficiente, 422);

    await emailService.enviarCupom(resgate);
    await emailService.notificarEmpresa(resgate);
    return paraResposta(resgate, 'ALUNO');
  }
}

export default new ResgateService();

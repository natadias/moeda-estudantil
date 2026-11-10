import alunoDAO from '../dao/AlunoDAO.js';
import professorDAO from '../dao/ProfessorDAO.js';
import transacaoDAO from '../dao/TransacaoDAO.js';
import AppError from '../utils/AppError.js';
import { preenchido } from '../utils/validators.js';
import emailService from './EmailService.js';

const NATUREZA = {
  ALUNO: { TRANSFERENCIA: 'ENTRADA', RESGATE: 'SAIDA' },
  PROFESSOR: { CREDITO_SEMESTRAL: 'ENTRADA', TRANSFERENCIA: 'SAIDA' },
  EMPRESA: {},
};

const semEmail = (pessoa) => (pessoa ? { id: pessoa.id, nome: pessoa.nome } : null);

export function paraResposta(transacao, tipoUsuario) {
  const { aluno, professor, vantagem, alunoId, professorId, vantagemId, ...dados } = transacao;
  return {
    ...dados,
    natureza: NATUREZA[tipoUsuario]?.[transacao.tipo] ?? null,
    professor: semEmail(professor),
    aluno: semEmail(aluno),
    vantagem: vantagem ? { id: vantagem.id, nome: vantagem.nome, empresa: semEmail(vantagem.empresa) } : null,
  };
}

const lerInteiro = (valor) => (preenchido(valor) && Number.isInteger(Number(valor)) ? Number(valor) : null);

class TransacaoService {
  async enviarMoedas(professorId, { alunoId, valor, motivo } = {}) {
    const professor = await professorDAO.findById(professorId);
    if (!professor) throw new AppError('Professor não encontrado.', 404);

    const erros = {};
    const quantidade = lerInteiro(valor);
    if (quantidade === null || quantidade <= 0) erros.valor = 'Informe um número inteiro de moedas maior que zero.';
    else if (quantidade > professor.saldoMoedas) erros.valor = `Saldo insuficiente: você tem ${professor.saldoMoedas} moedas.`;
    if (!preenchido(motivo)) erros.motivo = 'O motivo é obrigatório.';

    const id = lerInteiro(alunoId);
    const aluno = id ? await alunoDAO.findById(id) : null;
    if (!aluno) erros.alunoId = id ? 'Aluno não encontrado.' : 'Selecione um aluno.';
    else if (aluno.instituicaoId !== professor.instituicaoId) erros.alunoId = 'O aluno não é da sua instituição.';

    if (Object.keys(erros).length) throw new AppError('Dados inválidos.', 422, erros);

    const transferencia = await transacaoDAO.transferir({ professorId, alunoId: aluno.id, valor: quantidade, motivo: motivo.trim() });
    if (!transferencia) throw new AppError('Saldo insuficiente.', 422, { valor: 'Saldo insuficiente.' });

    await emailService.notificarMoedasRecebidas(transferencia);
    return paraResposta(transferencia, 'PROFESSOR');
  }

  async extrato({ id, tipo }) {
    let saldo = null;
    let filtro;
    if (tipo === 'ALUNO') {
      saldo = (await alunoDAO.findById(id))?.saldoMoedas;
      filtro = { alunoId: id };
    } else if (tipo === 'PROFESSOR') {
      saldo = (await professorDAO.findById(id))?.saldoMoedas;
      filtro = { professorId: id };
    } else {
      filtro = { empresaId: id };
    }
    const transacoes = await transacaoDAO.findExtrato(filtro);
    return { saldo, transacoes: transacoes.map((t) => paraResposta(t, tipo)) };
  }
}

export default new TransacaoService();

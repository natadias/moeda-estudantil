import { EMAIL_NO_CONSOLE, EMAIL_REMETENTE, SMTP_CONFIGURADO, transporte } from '../config/email.js';

const moedas = (valor) => `${valor.toLocaleString('pt-BR')} ${valor === 1 ? 'moeda' : 'moedas'}`;

class EmailService {
  async enviar({ para, assunto, texto }) {
    try {
      const info = await transporte.sendMail({ from: EMAIL_REMETENTE, to: para, subject: assunto, text: texto });
      if (!SMTP_CONFIGURADO && EMAIL_NO_CONSOLE) console.log(`\n[email] Para: ${para}\n[email] Assunto: ${assunto}\n${texto}\n`);
      return info;
    } catch (erro) {
      console.error(`[email] Falha ao enviar "${assunto}" para ${para}:`, erro.message);
      return null;
    }
  }

  notificarMoedasRecebidas(transferencia) {
    const { aluno, professor, valor, motivo } = transferencia;
    return this.enviar({
      para: aluno.usuario.email,
      assunto: `Você recebeu ${moedas(valor)}!`,
      texto: [
        `Olá, ${aluno.nome}!`,
        '',
        `${professor.nome} enviou ${moedas(valor)} para você.`,
        `Motivo: ${motivo}`,
        '',
        'Consulte seu extrato e as vantagens disponíveis no Sistema de Moeda Estudantil.',
      ].join('\n'),
    });
  }

  enviarCupom(resgate) {
    const { aluno, vantagem, valor, codigoCupom } = resgate;
    return this.enviar({
      para: aluno.usuario.email,
      assunto: `Seu cupom: ${vantagem.nome}`,
      texto: [
        `Olá, ${aluno.nome}!`,
        '',
        `Você trocou ${moedas(valor)} por "${vantagem.nome}" em ${vantagem.empresa.nome}.`,
        '',
        `Código do cupom: ${codigoCupom}`,
        '',
        'Apresente este código na empresa parceira para receber a vantagem.',
      ].join('\n'),
    });
  }

  notificarEmpresa(resgate) {
    const { aluno, vantagem, codigoCupom } = resgate;
    return this.enviar({
      para: vantagem.empresa.usuario.email,
      assunto: `Novo resgate: ${vantagem.nome}`,
      texto: [
        `Olá, ${vantagem.empresa.nome}!`,
        '',
        `O aluno ${aluno.nome} resgatou a vantagem "${vantagem.nome}".`,
        `Código do cupom: ${codigoCupom}`,
        '',
        'Confira este código quando o aluno apresentar o cupom.',
      ].join('\n'),
    });
  }
}

export default new EmailService();

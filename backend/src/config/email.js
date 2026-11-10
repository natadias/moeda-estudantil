import nodemailer from 'nodemailer';

export const SMTP_CONFIGURADO = Boolean(process.env.SMTP_HOST);

export const EMAIL_REMETENTE = process.env.EMAIL_REMETENTE ?? 'Moeda Estudantil <nao-responda@moedaestudantil.com>';

export const EMAIL_NO_CONSOLE = process.env.EMAIL_LOG !== 'false';

export const transporte = SMTP_CONFIGURADO
  ? nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT ?? 587),
      secure: process.env.SMTP_PORT === '465',
      auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
    })
  : nodemailer.createTransport({ jsonTransport: true });

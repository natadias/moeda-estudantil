import app from './app.js';
import { iniciarAgendador } from './jobs/agendador.js';

const PORT = process.env.PORT ?? 3333;

app.listen(PORT, () => {
  console.log(`API do Sistema de Moeda Estudantil em http://localhost:${PORT}/api`);
  iniciarAgendador();
});

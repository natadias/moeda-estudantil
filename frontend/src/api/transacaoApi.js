import http from './http';

const transacaoApi = {
  enviarMoedas: (envio) => http.post('/transferencias', envio).then((r) => r.data),
  resgatar: (vantagemId) => http.post('/resgates', { vantagemId }).then((r) => r.data),
  extrato: () => http.get('/extrato').then((r) => r.data),
};

export default transacaoApi;

import http from './http';

const instituicaoApi = {
  listar: () => http.get('/instituicoes').then((r) => r.data),
};

export default instituicaoApi;

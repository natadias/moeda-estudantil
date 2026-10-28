import http from './http';

const empresaApi = {
  listar: () => http.get('/empresas').then((r) => r.data),
  buscar: (id) => http.get(`/empresas/${id}`).then((r) => r.data),
  cadastrar: (empresa) => http.post('/empresas', empresa).then((r) => r.data),
  atualizar: (id, empresa) => http.put(`/empresas/${id}`, empresa).then((r) => r.data),
  excluir: (id) => http.delete(`/empresas/${id}`),
};

export default empresaApi;

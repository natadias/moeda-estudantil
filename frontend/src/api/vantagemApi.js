import http from './http';

function paraFormData({ nome, descricao, custoMoedas, ativa, foto }) {
  const dados = new FormData();
  dados.append('nome', nome);
  dados.append('descricao', descricao);
  dados.append('custoMoedas', custoMoedas);
  dados.append('ativa', ativa);
  if (foto) dados.append('foto', foto);
  return dados;
}

const vantagemApi = {
  listar: () => http.get('/vantagens').then((r) => r.data),
  buscar: (id) => http.get(`/vantagens/${id}`).then((r) => r.data),
  cadastrar: (vantagem) => http.post('/vantagens', paraFormData(vantagem)).then((r) => r.data),
  atualizar: (id, vantagem) => http.put(`/vantagens/${id}`, paraFormData(vantagem)).then((r) => r.data),
  excluir: (id) => http.delete(`/vantagens/${id}`).then((r) => r.data),
};

export default vantagemApi;

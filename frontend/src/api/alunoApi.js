import http from './http';

const alunoApi = {
  listar: () => http.get('/alunos').then((r) => r.data),
  buscar: (id) => http.get(`/alunos/${id}`).then((r) => r.data),
  cadastrar: (aluno) => http.post('/alunos', aluno).then((r) => r.data),
  atualizar: (id, aluno) => http.put(`/alunos/${id}`, aluno).then((r) => r.data),
  excluir: (id) => http.delete(`/alunos/${id}`),
};

export default alunoApi;

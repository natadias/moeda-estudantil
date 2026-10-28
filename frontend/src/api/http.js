import axios from 'axios';

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api',
});

export function lerErro(erro) {
  const dados = erro.response?.data;
  if (!erro.response) return { mensagem: 'Não foi possível conectar ao servidor.', campos: {} };
  return { mensagem: dados?.erro ?? 'Erro inesperado.', campos: dados?.detalhes ?? {} };
}

export default http;

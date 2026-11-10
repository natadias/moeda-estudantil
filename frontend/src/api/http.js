import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3333/api';
const CHAVE_TOKEN = 'moeda-estudantil:token';

const http = axios.create({ baseURL: API_URL });

export const urlArquivo = (caminho) => (caminho ? new URL(caminho, API_URL).href : '');

export const tokenSalvo = {
  ler: () => {
    try {
      return localStorage.getItem(CHAVE_TOKEN);
    } catch {
      return null;
    }
  },
  gravar: (token) => {
    try {
      if (token) localStorage.setItem(CHAVE_TOKEN, token);
      else localStorage.removeItem(CHAVE_TOKEN);
    } catch {
    }
  },
};

let tokenAtual = tokenSalvo.ler();
let aoExpirar = () => {};

export function definirSessao(token, callbackExpirar) {
  tokenAtual = token;
  tokenSalvo.gravar(token);
  if (callbackExpirar) aoExpirar = callbackExpirar;
}

http.interceptors.request.use((config) => {
  if (tokenAtual) config.headers.Authorization = `Bearer ${tokenAtual}`;
  return config;
});

http.interceptors.response.use(
  (res) => res,
  (erro) => {
    const rotaDeLogin = erro.config?.url?.includes('/auth/login');
    if (erro.response?.status === 401 && tokenAtual && !rotaDeLogin) aoExpirar();
    return Promise.reject(erro);
  },
);

export function lerErro(erro) {
  const dados = erro.response?.data;
  if (!erro.response) return { mensagem: 'Não foi possível conectar ao servidor.', campos: {} };
  return { mensagem: dados?.erro ?? 'Erro inesperado.', campos: dados?.detalhes ?? {} };
}

export default http;

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import authApi from '../api/authApi';
import { definirSessao, tokenSalvo } from '../api/http';

const AuthContext = createContext(null);

export const INICIO_POR_TIPO = {
  ALUNO: '/aluno/perfil',
  PROFESSOR: '/professor/alunos',
  EMPRESA: '/empresa/vantagens',
};

export function AuthProvider({ children }) {
  const [usuario, setUsuario] = useState(null);
  const [carregando, setCarregando] = useState(Boolean(tokenSalvo.ler()));
  const [aviso, setAviso] = useState('');

  const sair = useCallback((mensagem = '') => {
    definirSessao(null);
    setUsuario(null);
    setAviso(mensagem);
  }, []);
  const expirar = useCallback(() => sair('Sua sessão expirou. Entre novamente.'), [sair]);
  const limparAviso = useCallback(() => setAviso(''), []);

  useEffect(() => {
    const token = tokenSalvo.ler();
    if (!token) return;
    definirSessao(token, expirar);
    authApi
      .eu()
      .then(setUsuario)
      .catch(() => sair())
      .finally(() => setCarregando(false));
  }, [sair, expirar]);

  const entrar = useCallback(
    async (login, senha) => {
      const { token, usuario: dados } = await authApi.login(login, senha);
      definirSessao(token, expirar);
      setUsuario(dados);
      setAviso('');
      return dados;
    },
    [expirar],
  );

  const atualizarUsuario = useCallback((dados) => setUsuario((atual) => ({ ...atual, ...dados })), []);

  const valor = useMemo(
    () => ({ usuario, carregando, aviso, entrar, sair, limparAviso, atualizarUsuario }),
    [usuario, carregando, aviso, entrar, sair, limparAviso, atualizarUsuario],
  );

  return <AuthContext.Provider value={valor}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);

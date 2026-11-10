import { useRef } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { INICIO_POR_TIPO, useAuth } from '../contexts/AuthContext';

export function useJaAutenticadoAoAbrir() {
  const { usuario, carregando } = useAuth();
  const decisao = useRef(undefined);
  if (!carregando && decisao.current === undefined) decisao.current = usuario;
  return { carregando, usuarioInicial: decisao.current ?? null };
}

export default function SomenteVisitante() {
  const { carregando, usuarioInicial } = useJaAutenticadoAoAbrir();
  if (carregando) return <p>Carregando…</p>;
  if (usuarioInicial) return <Navigate to={INICIO_POR_TIPO[usuarioInicial.tipo]} replace />;
  return <Outlet />;
}

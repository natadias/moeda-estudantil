import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { INICIO_POR_TIPO, useAuth } from '../contexts/AuthContext';

export default function RotaProtegida({ tipos }) {
  const { usuario, carregando } = useAuth();
  const location = useLocation();

  if (carregando) return <p>Carregando…</p>;
  if (!usuario) return <Navigate to="/login" replace state={{ destino: location.pathname }} />;
  if (tipos && !tipos.includes(usuario.tipo)) return <Navigate to={INICIO_POR_TIPO[usuario.tipo]} replace />;
  return <Outlet />;
}

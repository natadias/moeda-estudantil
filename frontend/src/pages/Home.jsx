import { Link, Navigate } from 'react-router-dom';
import { INICIO_POR_TIPO, useAuth } from '../contexts/AuthContext';

export default function Home() {
  const { usuario } = useAuth();
  if (usuario) return <Navigate to={INICIO_POR_TIPO[usuario.tipo]} replace />;

  return (
    <section className="home">
      <h1>Sistema de Moeda Estudantil</h1>
      <p>Reconhecimento do mérito estudantil por meio de uma moeda virtual distribuída por professores e trocada por vantagens em empresas parceiras.</p>
      <div className="cartoes">
        <Link to="/alunos/novo" className="cartao">
          <strong>Sou aluno</strong>
          <span>Cadastre-se para receber moedas dos seus professores.</span>
        </Link>
        <Link to="/empresas/nova" className="cartao">
          <strong>Sou empresa</strong>
          <span>Cadastre sua empresa para oferecer vantagens aos alunos.</span>
        </Link>
        <Link to="/login" className="cartao">
          <strong>Já tenho conta</strong>
          <span>Entre como aluno, professor ou empresa parceira.</span>
        </Link>
      </div>
    </section>
  );
}

import { NavLink, Outlet } from 'react-router-dom';

export default function Layout() {
  return (
    <>
      <header className="topo">
        <div className="container topo-conteudo">
          <NavLink to="/" className="marca">🪙 Moeda Estudantil</NavLink>
          <nav>
            <NavLink to="/alunos">Alunos</NavLink>
            <NavLink to="/empresas">Empresas parceiras</NavLink>
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

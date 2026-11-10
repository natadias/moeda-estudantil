import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const MENUS = {
  ALUNO: [
    { para: '/aluno/perfil', rotulo: 'Meu perfil' },
    { para: '/vantagens', rotulo: 'Vantagens' },
    { para: '/aluno/extrato', rotulo: 'Extrato' },
    { para: '/empresas', rotulo: 'Empresas parceiras' },
  ],
  PROFESSOR: [
    { para: '/professor/alunos', rotulo: 'Meus alunos' },
    { para: '/professor/enviar', rotulo: 'Enviar moedas' },
    { para: '/professor/extrato', rotulo: 'Extrato' },
  ],
  EMPRESA: [
    { para: '/empresa/vantagens', rotulo: 'Minhas vantagens' },
    { para: '/empresa/cupons', rotulo: 'Cupons resgatados' },
    { para: '/empresa/perfil', rotulo: 'Meu perfil' },
  ],
  ANONIMO: [{ para: '/empresas', rotulo: 'Empresas parceiras' }],
};

const ROTULO_TIPO = { ALUNO: 'Aluno', PROFESSOR: 'Professor', EMPRESA: 'Empresa' };

export default function Layout() {
  const { usuario, sair } = useAuth();
  const navigate = useNavigate();

  function encerrar() {
    sair();
    navigate('/login');
  }

  return (
    <>
      <header className="topo">
        <div className="container topo-conteudo">
          <NavLink to="/" className="marca">🪙 Moeda Estudantil</NavLink>
          <nav>
            {MENUS[usuario?.tipo ?? 'ANONIMO'].map((item) => (
              <NavLink key={item.para} to={item.para}>{item.rotulo}</NavLink>
            ))}
            {usuario ? (
              <>
                <span className="usuario-logado" title={usuario.email}>
                  {usuario.nome} <small>({ROTULO_TIPO[usuario.tipo]})</small>
                </span>
                <button type="button" className="link-nav" onClick={encerrar}>Sair</button>
              </>
            ) : (
              <NavLink to="/login">Entrar</NavLink>
            )}
          </nav>
        </div>
      </header>
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import RotaProtegida from './components/RotaProtegida';
import SomenteVisitante from './components/SomenteVisitante';
import { AuthProvider } from './contexts/AuthContext';
import AlunoForm from './pages/alunos/AlunoForm';
import PerfilAluno from './pages/alunos/PerfilAluno';
import EmpresaForm from './pages/empresas/EmpresaForm';
import EmpresaLista from './pages/empresas/EmpresaLista';
import PerfilEmpresa from './pages/empresas/PerfilEmpresa';
import Home from './pages/Home';
import Login from './pages/Login';
import EnviarMoedas from './pages/professor/EnviarMoedas';
import MeusAlunos from './pages/professor/MeusAlunos';
import Extrato from './pages/transacoes/Extrato';
import CatalogoVantagens from './pages/vantagens/CatalogoVantagens';
import MinhasVantagens from './pages/vantagens/MinhasVantagens';
import VantagemForm from './pages/vantagens/VantagemForm';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="login" element={<Login />} />
            <Route path="empresas" element={<EmpresaLista />} />

            <Route element={<SomenteVisitante />}>
              <Route path="alunos/novo" element={<AlunoForm />} />
              <Route path="empresas/nova" element={<EmpresaForm />} />
            </Route>

            <Route element={<RotaProtegida tipos={['ALUNO']} />}>
              <Route path="aluno/perfil" element={<PerfilAluno />} />
              <Route path="aluno/perfil/editar" element={<AlunoForm edicao />} />
              <Route path="aluno/extrato" element={<Extrato />} />
              <Route path="vantagens" element={<CatalogoVantagens />} />
            </Route>

            <Route element={<RotaProtegida tipos={['PROFESSOR']} />}>
              <Route path="professor/alunos" element={<MeusAlunos />} />
              <Route path="professor/enviar" element={<EnviarMoedas />} />
              <Route path="professor/extrato" element={<Extrato />} />
            </Route>

            <Route element={<RotaProtegida tipos={['EMPRESA']} />}>
              <Route path="empresa/perfil" element={<PerfilEmpresa />} />
              <Route path="empresa/perfil/editar" element={<EmpresaForm edicao />} />
              <Route path="empresa/vantagens" element={<MinhasVantagens />} />
              <Route path="empresa/vantagens/nova" element={<VantagemForm />} />
              <Route path="empresa/vantagens/:id" element={<VantagemForm />} />
              <Route path="empresa/cupons" element={<Extrato />} />
            </Route>

            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);

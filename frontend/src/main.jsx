import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import AlunoForm from './pages/alunos/AlunoForm';
import AlunoLista from './pages/alunos/AlunoLista';
import EmpresaForm from './pages/empresas/EmpresaForm';
import EmpresaLista from './pages/empresas/EmpresaLista';
import Home from './pages/Home';
import './styles.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="alunos" element={<AlunoLista />} />
          <Route path="alunos/novo" element={<AlunoForm />} />
          <Route path="alunos/:id" element={<AlunoForm />} />
          <Route path="empresas" element={<EmpresaLista />} />
          <Route path="empresas/nova" element={<EmpresaForm />} />
          <Route path="empresas/:id" element={<EmpresaForm />} />
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>,
);

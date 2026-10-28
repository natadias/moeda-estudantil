import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import empresaApi from '../../api/empresaApi';
import { lerErro } from '../../api/http';
import Alerta from '../../components/Alerta';
import { formatarCnpj } from '../../utils/formatadores';

export default function EmpresaLista() {
  const { state } = useLocation();
  const [empresas, setEmpresas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(state?.sucesso ?? '');

  useEffect(() => {
    empresaApi
      .listar()
      .then(setEmpresas)
      .catch((e) => setErro(lerErro(e).mensagem))
      .finally(() => setCarregando(false));
  }, []);

  async function excluir(empresa) {
    if (!window.confirm(`Excluir a empresa ${empresa.nome}? As vantagens dela também serão removidas.`)) return;
    try {
      await empresaApi.excluir(empresa.id);
      setEmpresas((lista) => lista.filter((e) => e.id !== empresa.id));
      setSucesso('Empresa excluída.');
      setErro('');
    } catch (e) {
      setErro(lerErro(e).mensagem);
    }
  }

  return (
    <section>
      <div className="cabecalho">
        <h1>Empresas parceiras</h1>
        <Link to="/empresas/nova" className="botao">Nova empresa</Link>
      </div>

      <Alerta tipo="sucesso">{sucesso}</Alerta>
      <Alerta>{erro}</Alerta>

      {carregando ? (
        <p>Carregando…</p>
      ) : empresas.length === 0 ? (
        <p className="vazio">Nenhuma empresa cadastrada.</p>
      ) : (
        <div className="tabela-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>CNPJ</th>
                <th>Email</th>
                <th>Login</th>
                <th className="num">Vantagens</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.id}>
                  <td>{empresa.nome}</td>
                  <td>{formatarCnpj(empresa.cnpj)}</td>
                  <td>{empresa.email}</td>
                  <td>{empresa.login}</td>
                  <td className="num">{empresa.totalVantagens}</td>
                  <td className="acoes">
                    <Link to={`/empresas/${empresa.id}`} className="botao secundario">Editar</Link>
                    <button type="button" className="botao perigo" onClick={() => excluir(empresa)}>Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

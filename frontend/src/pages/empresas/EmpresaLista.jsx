import { useEffect, useState } from 'react';
import empresaApi from '../../api/empresaApi';
import { lerErro } from '../../api/http';
import Alerta from '../../components/Alerta';
import { formatarCnpj } from '../../utils/formatadores';

export default function EmpresaLista() {
  const [empresas, setEmpresas] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    empresaApi
      .listar()
      .then(setEmpresas)
      .catch((e) => setErro(lerErro(e).mensagem))
      .finally(() => setCarregando(false));
  }, []);

  return (
    <section>
      <div className="cabecalho">
        <h1>Empresas parceiras</h1>
      </div>
      <Alerta>{erro}</Alerta>

      {carregando ? (
        <p>Carregando…</p>
      ) : empresas.length === 0 ? (
        <p className="vazio">Nenhuma empresa parceira cadastrada ainda.</p>
      ) : (
        <div className="tabela-wrapper">
          <table>
            <thead>
              <tr>
                <th>Empresa</th>
                <th>CNPJ</th>
                <th>Contato</th>
                <th className="num">Vantagens</th>
              </tr>
            </thead>
            <tbody>
              {empresas.map((empresa) => (
                <tr key={empresa.id}>
                  <td>{empresa.nome}</td>
                  <td>{formatarCnpj(empresa.cnpj)}</td>
                  <td>{empresa.email}</td>
                  <td className="num">{empresa.totalVantagens}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

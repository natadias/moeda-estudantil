import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import empresaApi from '../../api/empresaApi';
import { lerErro } from '../../api/http';
import Alerta from '../../components/Alerta';
import ConfirmarExclusao from '../../components/ConfirmarExclusao';
import { useAuth } from '../../contexts/AuthContext';
import { formatarCnpj } from '../../utils/formatadores';

export default function PerfilEmpresa() {
  const { usuario, sair } = useAuth();
  const { state } = useLocation();
  const [empresa, setEmpresa] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    empresaApi.buscar(usuario.id).then(setEmpresa).catch((e) => setErro(lerErro(e).mensagem));
  }, [usuario.id]);

  async function excluirConta() {
    try {
      await empresaApi.excluir(usuario.id);
      sair('Conta da empresa excluída.');
    } catch (e) {
      setErro(lerErro(e).mensagem);
    }
  }

  return (
    <section>
      <div className="cabecalho">
        <h1>Meu perfil</h1>
        <Link to="/empresa/perfil/editar" className="botao">Editar dados</Link>
      </div>
      <Alerta tipo="sucesso">{state?.sucesso}</Alerta>
      <Alerta>{erro}</Alerta>

      {empresa && (
        <>
          <div className="painel">
            <dl className="dados">
              <dt>Empresa</dt><dd>{empresa.nome}</dd>
              <dt>CNPJ</dt><dd>{formatarCnpj(empresa.cnpj)}</dd>
              <dt>Email</dt><dd>{empresa.email}</dd>
              <dt>Login</dt><dd>{empresa.login}</dd>
              <dt>Vantagens cadastradas</dt><dd>{empresa.totalVantagens} · <Link to="/empresa/vantagens">gerenciar</Link></dd>
            </dl>
          </div>
          <ConfirmarExclusao
            descricao="A conta e todas as vantagens cadastradas serão removidas. Se alguma vantagem já foi resgatada por alunos, a exclusão é bloqueada para preservar o histórico."
            aoConfirmar={excluirConta}
          />
        </>
      )}
    </section>
  );
}

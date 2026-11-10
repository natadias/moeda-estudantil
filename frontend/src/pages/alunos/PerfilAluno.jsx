import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import alunoApi from '../../api/alunoApi';
import { lerErro } from '../../api/http';
import Alerta from '../../components/Alerta';
import ConfirmarExclusao from '../../components/ConfirmarExclusao';
import { useAuth } from '../../contexts/AuthContext';
import { formatarCep, formatarCpf } from '../../utils/formatadores';

export default function PerfilAluno() {
  const { usuario, sair } = useAuth();
  const { state } = useLocation();
  const [aluno, setAluno] = useState(null);
  const [erro, setErro] = useState('');

  useEffect(() => {
    alunoApi.buscar(usuario.id).then(setAluno).catch((e) => setErro(lerErro(e).mensagem));
  }, [usuario.id]);

  async function excluirConta() {
    try {
      await alunoApi.excluir(usuario.id);
      sair('Sua conta foi excluída.');
    } catch (e) {
      setErro(lerErro(e).mensagem);
    }
  }

  const end = aluno?.endereco;

  return (
    <section>
      <div className="cabecalho">
        <h1>Meu perfil</h1>
        <Link to="/aluno/perfil/editar" className="botao">Editar dados</Link>
      </div>
      <Alerta tipo="sucesso">{state?.sucesso}</Alerta>
      <Alerta>{erro}</Alerta>

      {aluno && (
        <>
          <div className="saldo">
            <span>Saldo</span>
            <strong>{aluno.saldoMoedas.toLocaleString('pt-BR')}</strong>
            <span>moedas</span>
            <div className="botoes">
              <Link to="/aluno/extrato" className="botao secundario">Ver extrato</Link>
              <Link to="/vantagens" className="botao secundario">Trocar por vantagens</Link>
            </div>
          </div>

          <div className="painel colunas">
            <dl className="dados">
              <dt>Nome</dt><dd>{aluno.nome}</dd>
              <dt>CPF</dt><dd>{formatarCpf(aluno.cpf)}</dd>
              <dt>RG</dt><dd>{aluno.rg}</dd>
              <dt>Email</dt><dd>{aluno.email}</dd>
              <dt>Login</dt><dd>{aluno.login}</dd>
            </dl>
            <dl className="dados">
              <dt>Instituição</dt><dd>{aluno.instituicao.nome}</dd>
              <dt>Curso</dt><dd>{aluno.curso}</dd>
              <dt>Endereço</dt>
              <dd>
                {end.logradouro}, {end.numero}{end.complemento ? ` – ${end.complemento}` : ''}
                <br />
                {end.bairro}, {end.cidade}/{end.estado} · CEP {formatarCep(end.cep)}
              </dd>
            </dl>
          </div>

          <ConfirmarExclusao
            descricao="Seus dados serão removidos do sistema de mérito. Contas com moedas recebidas ou trocadas não podem ser excluídas, para preservar o histórico."
            aoConfirmar={excluirConta}
          />
        </>
      )}
    </section>
  );
}

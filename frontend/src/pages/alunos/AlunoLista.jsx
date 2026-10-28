import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import alunoApi from '../../api/alunoApi';
import { lerErro } from '../../api/http';
import Alerta from '../../components/Alerta';
import { formatarCpf } from '../../utils/formatadores';

export default function AlunoLista() {
  const { state } = useLocation();
  const [alunos, setAlunos] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');
  const [sucesso, setSucesso] = useState(state?.sucesso ?? '');

  useEffect(() => {
    alunoApi
      .listar()
      .then(setAlunos)
      .catch((e) => setErro(lerErro(e).mensagem))
      .finally(() => setCarregando(false));
  }, []);

  async function excluir(aluno) {
    if (!window.confirm(`Excluir o aluno ${aluno.nome}? Esta ação não pode ser desfeita.`)) return;
    try {
      await alunoApi.excluir(aluno.id);
      setAlunos((lista) => lista.filter((a) => a.id !== aluno.id));
      setSucesso('Aluno excluído.');
      setErro('');
    } catch (e) {
      setErro(lerErro(e).mensagem);
    }
  }

  return (
    <section>
      <div className="cabecalho">
        <h1>Alunos</h1>
        <Link to="/alunos/novo" className="botao">Novo aluno</Link>
      </div>

      <Alerta tipo="sucesso">{sucesso}</Alerta>
      <Alerta>{erro}</Alerta>

      {carregando ? (
        <p>Carregando…</p>
      ) : alunos.length === 0 ? (
        <p className="vazio">Nenhum aluno cadastrado.</p>
      ) : (
        <div className="tabela-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>CPF</th>
                <th>Instituição</th>
                <th>Curso</th>
                <th className="num">Saldo</th>
                <th aria-label="Ações" />
              </tr>
            </thead>
            <tbody>
              {alunos.map((aluno) => (
                <tr key={aluno.id}>
                  <td>{aluno.nome}</td>
                  <td>{aluno.email}</td>
                  <td>{formatarCpf(aluno.cpf)}</td>
                  <td>{aluno.instituicao?.nome}</td>
                  <td>{aluno.curso}</td>
                  <td className="num">{aluno.saldoMoedas}</td>
                  <td className="acoes">
                    <Link to={`/alunos/${aluno.id}`} className="botao secundario">Editar</Link>
                    <button type="button" className="botao perigo" onClick={() => excluir(aluno)}>Excluir</button>
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

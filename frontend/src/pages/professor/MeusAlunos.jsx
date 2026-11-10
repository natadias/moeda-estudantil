import { useEffect, useMemo, useState } from 'react';
import alunoApi from '../../api/alunoApi';
import { lerErro } from '../../api/http';
import Alerta from '../../components/Alerta';
import { formatarCpf } from '../../utils/formatadores';

export default function MeusAlunos() {
  const [alunos, setAlunos] = useState([]);
  const [busca, setBusca] = useState('');
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    alunoApi
      .listar()
      .then(setAlunos)
      .catch((e) => setErro(lerErro(e).mensagem))
      .finally(() => setCarregando(false));
  }, []);

  const filtrados = useMemo(() => {
    const termo = busca.trim().toLowerCase();
    if (!termo) return alunos;
    return alunos.filter((a) => [a.nome, a.email, a.curso, a.cpf].some((v) => v.toLowerCase().includes(termo)));
  }, [alunos, busca]);

  return (
    <section>
      <div className="cabecalho">
        <div>
          <h1>Meus alunos</h1>
          {alunos[0] && <p className="dica">{alunos[0].instituicao.nome}</p>}
        </div>
        <input className="busca" type="search" placeholder="Buscar por nome, email, curso ou CPF" value={busca} onChange={(e) => setBusca(e.target.value)} />
      </div>
      <Alerta>{erro}</Alerta>

      {carregando ? (
        <p>Carregando…</p>
      ) : filtrados.length === 0 ? (
        <p className="vazio">{alunos.length ? 'Nenhum aluno encontrado para a busca.' : 'Nenhum aluno da sua instituição está cadastrado ainda.'}</p>
      ) : (
        <div className="tabela-wrapper">
          <table>
            <thead>
              <tr>
                <th>Nome</th>
                <th>Email</th>
                <th>CPF</th>
                <th>Curso</th>
                <th className="num">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.map((aluno) => (
                <tr key={aluno.id}>
                  <td>{aluno.nome}</td>
                  <td>{aluno.email}</td>
                  <td>{formatarCpf(aluno.cpf)}</td>
                  <td>{aluno.curso}</td>
                  <td className="num">{aluno.saldoMoedas}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

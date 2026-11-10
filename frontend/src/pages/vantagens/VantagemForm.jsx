import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { lerErro, urlArquivo } from '../../api/http';
import vantagemApi from '../../api/vantagemApi';
import Alerta from '../../components/Alerta';
import Campo from '../../components/Campo';

const VAZIO = { nome: '', descricao: '', custoMoedas: '', ativa: true, foto: null };

export default function VantagemForm() {
  const { id } = useParams();
  const edicao = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState(VAZIO);
  const [previa, setPrevia] = useState('');
  const [erros, setErros] = useState({});
  const [mensagem, setMensagem] = useState('');
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    if (!edicao) return;
    vantagemApi
      .buscar(id)
      .then((v) => {
        setForm({ nome: v.nome, descricao: v.descricao, custoMoedas: String(v.custoMoedas), ativa: v.ativa, foto: null });
        setPrevia(urlArquivo(v.fotoUrl));
      })
      .catch((e) => setMensagem(lerErro(e).mensagem));
  }, [id, edicao]);

  useEffect(() => () => previa.startsWith('blob:') && URL.revokeObjectURL(previa), [previa]);

  const alterar = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  function escolherFoto(e) {
    const foto = e.target.files[0] ?? null;
    setForm({ ...form, foto });
    if (foto) setPrevia(URL.createObjectURL(foto));
  }

  async function salvar(e) {
    e.preventDefault();
    setEnviando(true);
    setErros({});
    setMensagem('');
    try {
      if (edicao) {
        await vantagemApi.atualizar(id, form);
        navigate('/empresa/vantagens', { state: { sucesso: 'Vantagem atualizada.' } });
      } else {
        await vantagemApi.cadastrar(form);
        navigate('/empresa/vantagens', { state: { sucesso: 'Vantagem cadastrada e disponível para os alunos.' } });
      }
    } catch (erro) {
      const { mensagem: msg, campos } = lerErro(erro);
      setMensagem(msg);
      setErros(campos);
      setEnviando(false);
    }
  }

  return (
    <section>
      <div className="cabecalho">
        <h1>{edicao ? 'Editar vantagem' : 'Nova vantagem'}</h1>
      </div>
      <Alerta>{mensagem}</Alerta>

      <form className="formulario" onSubmit={salvar} noValidate>
        <fieldset>
          <legend>Produto ou desconto</legend>
          <div className="grade">
            <Campo rotulo="Nome" nome="nome" value={form.nome} onChange={alterar} erro={erros.nome} className="largo" required />
            <Campo
              rotulo="Custo (moedas)"
              nome="custoMoedas"
              type="number"
              min="1"
              step="1"
              value={form.custoMoedas}
              onChange={alterar}
              erro={erros.custoMoedas}
              required
            />
            <label className="campo largo">
              <span>Descrição</span>
              <textarea name="descricao" rows={3} value={form.descricao} onChange={alterar} aria-invalid={Boolean(erros.descricao)} required />
              {erros.descricao && <small className="erro-campo">{erros.descricao}</small>}
            </label>
            <label className="campo-check">
              <input type="checkbox" checked={form.ativa} onChange={(e) => setForm({ ...form, ativa: e.target.checked })} />
              <span>Visível para os alunos</span>
            </label>
          </div>
        </fieldset>

        <fieldset>
          <legend>Foto do produto</legend>
          <div className="foto-upload">
            {previa ? <img src={previa} alt="Prévia da foto" /> : <div className="foto-vazia">Sem foto</div>}
            <label className="campo">
              <span>{edicao ? 'Trocar foto (opcional)' : 'Foto'} — JPG, PNG, WEBP ou GIF até 2 MB</span>
              <input type="file" accept="image/jpeg,image/png,image/webp,image/gif" onChange={escolherFoto} aria-invalid={Boolean(erros.foto)} />
              {erros.foto && <small className="erro-campo">{erros.foto}</small>}
            </label>
          </div>
        </fieldset>

        <div className="botoes">
          <Link to="/empresa/vantagens" className="botao secundario">Cancelar</Link>
          <button type="submit" className="botao" disabled={enviando}>{enviando ? 'Salvando…' : 'Salvar'}</button>
        </div>
      </form>
    </section>
  );
}

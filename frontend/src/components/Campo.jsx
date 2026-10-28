export default function Campo({ rotulo, nome, erro, className = '', ...props }) {
  return (
    <label className={`campo ${className}`}>
      <span>{rotulo}</span>
      <input name={nome} aria-invalid={Boolean(erro)} {...props} />
      {erro && <small className="erro-campo">{erro}</small>}
    </label>
  );
}

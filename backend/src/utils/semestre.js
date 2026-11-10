export function semestreAtual(data = new Date()) {
  return `${data.getFullYear()}.${data.getMonth() < 6 ? 1 : 2}`;
}

export default class AppError extends Error {
  constructor(message, status = 400, detalhes = undefined) {
    super(message);
    this.status = status;
    this.detalhes = detalhes;
  }
}

import http from './http';

const authApi = {
  login: (login, senha) => http.post('/auth/login', { login, senha }).then((r) => r.data),
  eu: () => http.get('/auth/eu').then((r) => r.data),
};

export default authApi;

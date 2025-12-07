import client from './client';

export async function loginUsuario(data: { email: string; senha: string }) {
  return client.post('/usuarios/login', data);
}

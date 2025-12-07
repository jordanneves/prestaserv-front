import client from '../../src/api/client';

export async function loginUsuario(data: { email: string; senha: string }) {
  // Use client.post so request parsing/throwing is consistent. The client won't send Authorization for this request.
  return client.post('/usuarios/login', data);
}

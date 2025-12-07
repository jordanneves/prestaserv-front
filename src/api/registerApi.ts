import client from './client';

export async function createUsuario(data: {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  tipo: 'cliente' | 'fornecedor';
  cpf: string;
  endereco: string;
}) {
  return client.post('/usuarios', data);
}

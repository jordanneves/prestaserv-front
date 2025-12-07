const API_URL = `${process.env.API_URL}/usuarios`;

export async function createUsuario(data: {
  nome: string;
  email: string;
  telefone: string;
  senha: string;
  tipo: 'cliente' | 'fornecedor';
  cpf: string;
  endereco: string;
}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Erro ao criar usuário');
  }
  return response.json();
}

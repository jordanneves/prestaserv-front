const API_URL = 'http://localhost:3000/servicos';

export async function createServico(data: {
  descricao: string;
  tipoServico: string;
  valorHora: number;
  mensagem: string;
}) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    throw new Error('Erro ao criar serviço');
  }
  return response.json();
}

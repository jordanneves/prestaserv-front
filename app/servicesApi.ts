const API_URL = `${process.env.API_URL}/servicos`;

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

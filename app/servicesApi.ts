import client from '../src/api/client';

export async function createServico(data: {
  descricao: string;
  tipoServico: string;
  valorHora: number;
  mensagem: string;
}) {
  return client.post('/servicos', data);
}

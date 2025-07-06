const API_URL = 'http://localhost:3000/usuarios/login';

export async function loginUsuario(data: { email: string; senha: string }) {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    const error = await response.json().catch(() => ({}));
    throw new Error(error.message || 'Email ou senha inválidos');
  }
  return response.json();
}

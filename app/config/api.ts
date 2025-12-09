import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuração centralizada da API
export const API_BASE_URL = 'http://localhost:3000';

// URLs específicas da API
export const API_ENDPOINTS = {
  usuarios: `${API_BASE_URL}/usuarios`,
  login: `${API_BASE_URL}/usuarios/login`,
  servicos: `${API_BASE_URL}/servicos`,
  contratos: `${API_BASE_URL}/contratos`,
} as const;

// Função utilitária para fazer chamadas autenticadas à API
export const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  try {
    const token = await AsyncStorage.getItem('token');
    
    const headers = {
      'Content-Type': 'application/json',
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Se o token expirou ou é inválido, redirecionar para login
      if (response.status === 401) {
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('usuario');
        throw new Error('Sessão expirada. Faça login novamente.');
      }
      throw new Error(`Erro na requisição: ${response.status}`);
    }

    return response;
  } catch (error) {
    console.error('Erro na chamada da API:', error);
    throw error;
  }
};

// Função para verificar se o usuário está autenticado
export const checkAuthentication = async (): Promise<boolean> => {
  try {
    const token = await AsyncStorage.getItem('token');
    const usuario = await AsyncStorage.getItem('usuario');
    
    if (!token || !usuario) {
      return false;
    }
    
    // Opcional: Verificar se o token ainda é válido fazendo uma chamada à API
    // Por exemplo, uma rota que retorna os dados do usuário atual
    // const response = await authenticatedFetch(`${API_BASE_URL}/usuarios/me`);
    // return response.ok;
    
    return true;
  } catch (error) {
    console.error('Erro ao verificar autenticação:', error);
    return false;
  }
};

// Função para fazer logout
export const logout = async () => {
  try {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  }
};
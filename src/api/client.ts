import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Resolve BASE_URL from multiple sources in order of precedence:
// 1. expo app.json/app.config extra.API_URL (Constants.expoConfig.extra or Constants.manifest.extra)
// 2. process.env.API_URL (for non-Expo environments)
// 3. fallback to localhost for development
const BASE_URL =
  (Constants.expoConfig && (Constants.expoConfig.extra?.API_URL || Constants.expoConfig.extra?.apiUrl)) ||
  (Constants.manifest && (Constants.manifest.extra?.API_URL || Constants.manifest.extra?.apiUrl)) ||
  (typeof process !== 'undefined' && (process.env?.API_URL)) ||
  'https://prestaserv-api-68y8.onrender.com';

// Helpful log to confirm which base URL is used at runtime
if (__DEV__) {
  // eslint-disable-next-line no-console
  console.log('[client] BASE_URL =', BASE_URL);
}

async function request(path: string, options: { method?: string; body?: any; headers?: Record<string,string> } = {}) {
  const { method = 'GET', body, headers = {} } = options;
  const token = await AsyncStorage.getItem('token');
  const finalHeaders: Record<string,string> = { ...headers };
  if (token) finalHeaders['Authorization'] = `Bearer ${token}`;

  let fetchBody: any = undefined;
  if (body !== undefined) {
    // If it's a FormData (for file uploads), don't stringify
    if (body instanceof FormData) {
      fetchBody = body;
    } else {
      finalHeaders['Content-Type'] = finalHeaders['Content-Type'] || 'application/json';
      fetchBody = JSON.stringify(body);
    }
  }

  const res = await fetch(`${BASE_URL}${path}`, { method, headers: finalHeaders, body: fetchBody });

  const text = await res.text();
  let data: any = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch (e) {
    data = text;
  }

  if (!res.ok) {
    // Handle unauthorized centrally if desired
    if (res.status === 401) {
      // Optionally clear token or notify app
      // await AsyncStorage.removeItem('token');
    }
    const message = (data && (data.message || data.error)) || text || `HTTP ${res.status}`;
    throw new Error(message);
  }

  return data;
}

export function get(path: string) {
  return request(path, { method: 'GET' });
}

export function post(path: string, body?: any) {
  return request(path, { method: 'POST', body });
}

export function patch(path: string, body?: any) {
  return request(path, { method: 'PATCH', body });
}

export function del(path: string) {
  return request(path, { method: 'DELETE' });
}

export default { get, post, patch, del };

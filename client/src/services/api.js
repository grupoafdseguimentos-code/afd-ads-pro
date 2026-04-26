import axios from 'axios';
import { API_URL, HAS_API_URL } from '../config.js';
import { tokenStore } from './tokenStore.js';

export const api = axios.create({
  baseURL: API_URL,
  timeout: 15000
});

let refreshPromise = null;

function createMissingApiUrlError() {
  const error = new Error('VITE_API_URL nao configurada.');
  error.isMissingApiUrl = true;
  return error;
}

api.interceptors.request.use(config => {
  if (!HAS_API_URL) {
    window.dispatchEvent(new CustomEvent('afd-api-connection-error'));
    return Promise.reject(createMissingApiUrlError());
  }

  const token = tokenStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;
    const method = original?.method?.toUpperCase() || 'REQUEST';
    const url = original?.url || 'unknown-url';

    console.error('API request failed:', {
      method,
      url,
      status: error.response?.status || 'no-response',
      message: error.message
    });

    if (!error.response) {
      window.dispatchEvent(new CustomEvent('afd-api-connection-error'));
    }

    if (error.response?.status === 401 && original && !original._retry && tokenStore.getRefreshToken()) {
      original._retry = true;
      try {
        if (!refreshPromise) {
          refreshPromise = axios.post(`${API_URL}/auth/refresh`, {
            refreshToken: tokenStore.getRefreshToken()
          }, { timeout: 15000 }).finally(() => {
            refreshPromise = null;
          });
        }

        const { data } = await refreshPromise;
        tokenStore.setTokens(data.accessToken, data.refreshToken);
        original.headers.Authorization = `Bearer ${data.accessToken}`;
        return api(original);
      } catch (refreshError) {
        tokenStore.clear();
        window.dispatchEvent(new CustomEvent('afd-auth-session-expired'));
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

export function getApiErrorMessage(error, fallback = 'Nao foi possivel conectar ao servidor.') {
  if (error.isMissingApiUrl) return 'A URL da API nao esta configurada. Configure VITE_API_URL na Vercel.';
  if (!error.response) return 'Servidor temporariamente indisponivel. Tente novamente em instantes.';
  return error.response.data?.message || fallback;
}

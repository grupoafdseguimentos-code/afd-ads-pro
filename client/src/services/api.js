import axios from 'axios';
import { API_BASE_URL, API_URL, HAS_API_URL, getApiEndpoint } from '../config.js';
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
      baseURL: original?.baseURL || API_URL,
      url,
      status: error.response?.status || 'no-response',
      message: error.message,
      response: error.response?.data || null
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
  if (error.response.status === 409) return error.response.data?.message || 'E-mail ja cadastrado.';
  if (error.response.status === 400) return error.response.data?.message || 'Revise os dados informados.';
  if (error.response.status === 401) return error.response.data?.message || 'E-mail ou senha invalidos.';
  if (error.response.status >= 500) return error.response.data?.message || 'Servidor indisponivel. Tente novamente em instantes.';
  return error.response.data?.message || fallback;
}

export async function checkApiStatus() {
  if (!HAS_API_URL) {
    return {
      online: false,
      code: 'MISSING_API_URL',
      apiUrl: API_URL,
      backendUrl: API_BASE_URL,
      health: null,
      ready: null
    };
  }

  const diagnostics = {
    online: false,
    code: 'API_UNAVAILABLE',
    apiUrl: API_URL,
    backendUrl: API_BASE_URL,
    healthUrl: getApiEndpoint('/health'),
    readyUrl: getApiEndpoint('/ready'),
    health: null,
    ready: null
  };

  try {
    const [health, ready] = await Promise.allSettled([
      api.get('/health'),
      api.get('/ready')
    ]);

    diagnostics.health = health.status === 'fulfilled'
      ? { ok: true, status: health.value.status, data: health.value.data }
      : { ok: false, status: health.reason?.response?.status || null, data: health.reason?.response?.data || null, message: health.reason?.message };

    diagnostics.ready = ready.status === 'fulfilled'
      ? { ok: true, status: ready.value.status, data: ready.value.data }
      : { ok: false, status: ready.reason?.response?.status || null, data: ready.reason?.response?.data || null, message: ready.reason?.message };

    diagnostics.online = diagnostics.health.ok && diagnostics.ready.ok;
    diagnostics.code = diagnostics.online ? 'API_CONNECTED' : 'API_CHECK_FAILED';

    console.info('A.F.D Ads Pro API diagnostics:', diagnostics);
    return diagnostics;
  } catch (error) {
    diagnostics.error = error.message;
    console.error('A.F.D Ads Pro API diagnostics failed:', diagnostics);
    return diagnostics;
  }
}

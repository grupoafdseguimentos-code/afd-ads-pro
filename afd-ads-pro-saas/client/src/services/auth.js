import { api } from './api.js';
import { tokenStore } from './tokenStore.js';

export async function login(payload) {
  const { data } = await api.post('/auth/login', payload);
  tokenStore.setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function register(payload) {
  const { data } = await api.post('/auth/register', payload);
  tokenStore.setTokens(data.accessToken, data.refreshToken);
  return data.user;
}

export async function logout(refreshToken) {
  try {
    await api.post('/auth/logout', { refreshToken });
  } finally {
    tokenStore.clear();
  }
}

export async function getMe() {
  const { data } = await api.get('/users/me');
  return data.user;
}

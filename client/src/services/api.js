import axios from 'axios';
import { API_URL } from '../config.js';
import { tokenStore } from './tokenStore.js';

export const api = axios.create({
  baseURL: API_URL
});

api.interceptors.request.use(config => {
  const token = tokenStore.getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  response => response,
  async error => {
    const original = error.config;
    if (error.response?.status === 401 && !original._retry && tokenStore.getRefreshToken()) {
      original._retry = true;
      const { data } = await axios.post(`${API_URL}/auth/refresh`, {
        refreshToken: tokenStore.getRefreshToken()
      });
      tokenStore.setTokens(data.accessToken, data.refreshToken);
      original.headers.Authorization = `Bearer ${data.accessToken}`;
      return api(original);
    }
    return Promise.reject(error);
  }
);

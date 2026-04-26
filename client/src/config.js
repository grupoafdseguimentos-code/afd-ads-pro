function trimTrailingSlashes(value) {
  return String(value || '').trim().replace(/\/+$/, '');
}

export function joinUrl(baseUrl, path = '') {
  const normalizedBase = trimTrailingSlashes(baseUrl);
  const normalizedPath = String(path || '').replace(/^\/+/, '');

  if (!normalizedBase) return normalizedPath ? `/${normalizedPath}` : '';
  if (!normalizedPath) return normalizedBase;

  return `${normalizedBase}/${normalizedPath}`;
}

export function getApiBaseUrl() {
  const rawUrl = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:4000' : '');
  const normalized = trimTrailingSlashes(rawUrl);

  if (!normalized) return '';

  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
}

export function getPublicBackendUrl() {
  const apiUrl = getApiBaseUrl();
  return apiUrl.endsWith('/api') ? apiUrl.slice(0, -4) : apiUrl;
}

export const API_URL = getApiBaseUrl();
export const API_BASE_URL = getPublicBackendUrl();
export const HAS_API_URL = Boolean(API_URL);

export function getApiEndpoint(path) {
  return joinUrl(API_URL, path);
}

export function getBackendEndpoint(path) {
  return joinUrl(API_BASE_URL, path);
}

import axios, { AxiosError } from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.trim();
export const AUTH_EXPIRED_EVENT = 'lojas-pedidos.auth-expired';

export const api = axios.create({
  baseURL: API_BASE_URL || '/',
  timeout: 30000
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (axios.isAxiosError(error) && error.response?.status === 401) {
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
    }

    return Promise.reject(error);
  },
);

export function setAuthToken(token: string | null) {
  if (token) {
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } else {
    delete api.defaults.headers.common.Authorization;
  }
}

export function getApiErrorMessage(error: unknown, fallback: string) {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<{ message?: string; title?: string; warnings?: string[] }>;
    const body = axiosError.response?.data;
    return body?.message ?? body?.title ?? body?.warnings?.[0] ?? fallback;
  }

  return error instanceof Error ? error.message : fallback;
}

export function hasApiBaseUrl() {
  return Boolean(API_BASE_URL);
}

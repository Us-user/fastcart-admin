import axios, { type InternalAxiosRequestConfig } from 'axios';

import { authStorage } from '@/shared/lib/authStorage';
import { refreshAccessToken } from './tokenRefresh';

type RetriableConfig = InternalAxiosRequestConfig & { _retry?: boolean };

/**
 * Shared axios instance for the few endpoints that need `multipart/form-data`
 * (TRD §7). It carries the same auth header and reuses the same single-flight
 * 401-refresh logic as the RTK Query base query.
 */
export const http = axios.create({
  baseURL: `${import.meta.env.VITE_API_BASE_URL}/api/v1`,
});

http.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (token) {
    config.headers.set('Authorization', `Bearer ${token}`);
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) {
      return Promise.reject(error);
    }
    const original = error.config as RetriableConfig | undefined;
    if (error.response?.status === 401 && original && !original._retry) {
      original._retry = true;
      const newToken = await refreshAccessToken();
      if (newToken) {
        original.headers.set('Authorization', `Bearer ${newToken}`);
        return http(original);
      }
    }
    return Promise.reject(error);
  },
);

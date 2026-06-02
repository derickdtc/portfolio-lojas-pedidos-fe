import { api } from './api';
import type { AuthResponse, AuthUser, LoginRequest } from '../types/api';

export async function login(request: LoginRequest) {
  const { data } = await api.post<AuthResponse>('/api/auth/login', request);
  return data;
}

export async function getCurrentUser() {
  const { data } = await api.get<AuthUser>('/api/auth/me');
  return data;
}

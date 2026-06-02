import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import { AUTH_EXPIRED_EVENT, getApiErrorMessage, setAuthToken } from '../services/api';
import * as authService from '../services/authService';
import type { AuthResponse, AuthUser, LoginRequest } from '../types/api';

type AuthSession = AuthResponse;

type AuthContextValue = {
  token: string | null;
  user: AuthUser | null;
  isLoading: boolean;
  login: (request: LoginRequest) => Promise<void>;
  logout: () => void;
};

const LOCAL_SESSION_KEY = 'lojas-pedidos.auth.local';
const SESSION_SESSION_KEY = 'lojas-pedidos.auth.session';

const AuthContext = createContext<AuthContextValue | null>(null);

function readStoredSession() {
  const rawSession =
    window.localStorage.getItem(LOCAL_SESSION_KEY) ??
    window.sessionStorage.getItem(SESSION_SESSION_KEY);

  if (!rawSession) {
    return null;
  }

  try {
    return JSON.parse(rawSession) as AuthSession;
  } catch {
    clearStoredSession();
    return null;
  }
}

function clearStoredSession() {
  window.localStorage.removeItem(LOCAL_SESSION_KEY);
  window.sessionStorage.removeItem(SESSION_SESSION_KEY);
}

function persistSession(session: AuthSession, rememberMe: boolean) {
  clearStoredSession();
  const storage = rememberMe ? window.localStorage : window.sessionStorage;
  storage.setItem(rememberMe ? LOCAL_SESSION_KEY : SESSION_SESSION_KEY, JSON.stringify(session));
}

function isExpired(session: AuthSession) {
  return new Date(session.expiresAtUtc).getTime() <= Date.now();
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    clearStoredSession();
    setAuthToken(null);
    setSession(null);
  }, []);

  useEffect(() => {
    const storedSession = readStoredSession();

    if (!storedSession || isExpired(storedSession)) {
      logout();
      setIsLoading(false);
      return;
    }

    setAuthToken(storedSession.token);
    setSession(storedSession);

    authService
      .getCurrentUser()
      .then((user) => {
        setSession((current) => (current ? { ...current, user } : current));
      })
      .catch(() => {
        logout();
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, [logout]);

  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, logout);
  }, [logout]);

  const login = useCallback(async (request: LoginRequest) => {
    try {
      const nextSession = await authService.login(request);
      setAuthToken(nextSession.token);
      persistSession(nextSession, request.rememberMe);
      setSession(nextSession);
    } catch (error) {
      throw new Error(getApiErrorMessage(error, 'Não foi possível entrar.'));
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      token: session?.token ?? null,
      user: session?.user ?? null,
      isLoading,
      login,
      logout
    }),
    [isLoading, login, logout, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth precisa ser usado dentro de AuthProvider.');
  }

  return context;
}

"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import * as api from "./api";
import type { AuthResponse, UserDto } from "./api";

export const AUTH_STORAGE_KEY = "apnaghar.auth";

interface AuthContextValue {
  user: UserDto | null;
  token: string | null;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserDto | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Hydrate from localStorage once on mount.
  useEffect(() => {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return;
    try {
      const parsed = JSON.parse(raw) as AuthResponse;
      setUser(parsed.user);
      setToken(parsed.token);
    } catch {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }, []);

  const persist = useCallback((res: AuthResponse) => {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(res));
    setUser(res.user);
    setToken(res.token);
  }, []);

  const login = useCallback(
    async (email: string, password: string) => {
      persist(await api.login(email, password));
    },
    [persist],
  );

  const register = useCallback(
    async (email: string, password: string, displayName: string) => {
      persist(await api.register(email, password, displayName));
    },
    [persist],
  );

  const logout = useCallback(() => {
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}

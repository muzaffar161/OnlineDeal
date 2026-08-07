import { createContext, useContext, useMemo, useState } from "react";
import { authApi, clearSession, getCurrentUser, type AuthResponse } from "@/lib/api";

type AuthState = {
  user: Omit<AuthResponse, "accessToken"> | null;
  isAuthenticated: boolean;
  login: (contact: string, password: string) => Promise<void>;
  register: (username: string, contact: string, password: string) => Promise<void>;
  logout: () => void;
};

const defaultAuthState: AuthState = {
  user: null,
  isAuthenticated: false,
  login: async () => {
    throw new Error("AuthProvider is not initialized");
  },
  register: async () => {
    throw new Error("AuthProvider is not initialized");
  },
  logout: () => {
    // no-op fallback to avoid runtime crash in edge HMR cases
  },
};

const AuthContext = createContext<AuthState>(defaultAuthState);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<Omit<AuthResponse, "accessToken"> | null>(getCurrentUser());

  const value = useMemo<AuthState>(
    () => ({
      user,
      isAuthenticated: Boolean(user),
      login: async (contact, password) => {
        const response = await authApi.login(contact, password);
        setUser({ userId: response.userId, username: response.username, contact: response.contact });
      },
      register: async (username, contact, password) => {
        const response = await authApi.register(username, contact, password);
        setUser({ userId: response.userId, username: response.username, contact: response.contact });
      },
      logout: () => {
        clearSession();
        setUser(null);
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

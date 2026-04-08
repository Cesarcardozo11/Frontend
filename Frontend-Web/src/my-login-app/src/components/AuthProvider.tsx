import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';

const API_BASE = 'http://localhost:8000';

interface AuthContextType {
  isAuthenticated: boolean;
  username: string | null;
  role: 'ADMIN' | 'USER' | null;
  token: string | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState<string | null>(null);
  const [role, setRole] = useState<'ADMIN' | 'USER' | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Restore session from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem('access_token');
    const savedUsername = localStorage.getItem('username');
    const savedRole = localStorage.getItem('role') as 'ADMIN' | 'USER' | null;

    if (savedToken && savedUsername && savedRole) {
      setToken(savedToken);
      setUsername(savedUsername);
      setRole(savedRole);
      setIsAuthenticated(true);
    }
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<{ success: boolean; error?: string }> => {
    if (!email || !password) {
      return { success: false, error: 'Email y contraseña son requeridos' };
    }

    try {
      const response = await fetch(`${API_BASE}/api/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (response.status === 403) {
          return { success: false, error: 'Cuenta desactivada. Contacte al administrador.' };
        }
        return { success: false, error: errorData?.detail || 'Credenciales inválidas' };
      }

      const data = await response.json();

      // Persist in localStorage
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('refresh_token', data.refresh_token);
      localStorage.setItem('username', data.full_name);
      localStorage.setItem('role', data.role);

      setToken(data.access_token);
      setUsername(data.full_name);
      setRole(data.role);
      setIsAuthenticated(true);

      return { success: true };
    } catch {
      return { success: false, error: 'Error de conexión. Intenta de nuevo.' };
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('username');
    localStorage.removeItem('role');
    setIsAuthenticated(false);
    setUsername(null);
    setRole(null);
    setToken(null);
  }, []);

  return (
    <AuthContext.Provider value={{ isAuthenticated, username, role, token, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
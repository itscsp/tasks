import React, { createContext, useState, useEffect, useContext } from 'react';
import type { ReactNode } from 'react';

interface User {
  id: number;
  email: string;
  name: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (token: string, refreshToken: string, user: User) => void;
  logout: () => void;
  updateToken: (newToken: string, newRefreshToken: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const savedToken = localStorage.getItem('csp_token');
      const savedRefreshToken = localStorage.getItem('csp_refresh_token');
      const savedUser = localStorage.getItem('csp_user');
      
      if (savedToken && savedUser) {
        setToken(savedToken);
        setRefreshToken(savedRefreshToken);
        setUser(JSON.parse(savedUser));
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (newToken: string, newRefreshToken: string, newUser: User) => {
    localStorage.setItem('csp_token', newToken);
    localStorage.setItem('csp_refresh_token', newRefreshToken);
    localStorage.setItem('csp_user', JSON.stringify(newUser));
    setToken(newToken);
    setRefreshToken(newRefreshToken);
    setUser(newUser);
  };

  const updateToken = (newToken: string, newRefreshToken: string) => {
    localStorage.setItem('csp_token', newToken);
    localStorage.setItem('csp_refresh_token', newRefreshToken);
    setToken(newToken);
    setRefreshToken(newRefreshToken);
  };

  const logout = () => {
    localStorage.removeItem('csp_token');
    localStorage.removeItem('csp_refresh_token');
    localStorage.removeItem('csp_user');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      refreshToken, 
      isAuthenticated: !!token, 
      isLoading,
      login, 
      logout,
      updateToken
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

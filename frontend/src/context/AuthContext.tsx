import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, AuthState } from '../types/auth.types';

// Extendemos AuthState para incluir 'loading'
interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean; // <-- Fundamental para App.tsx
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState & { loading: boolean }>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
    loading: true, // Empezamos cargando
  });

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user'); // Recuperamos el objeto usuario

      if (token && savedUser) {
        try {
          setAuthState(prev => ({
            ...prev,
            user: JSON.parse(savedUser),
            isAuthenticated: true,
            loading: false
          }));
        } catch (e) {
          logout();
        }
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    };
    initAuth();
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', user.role);
    localStorage.setItem('user', JSON.stringify(user)); // Guardamos el usuario para persistencia
    
    setAuthState({ 
      user, 
      token, 
      isAuthenticated: true,
      loading: false 
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    localStorage.removeItem('user');
    setAuthState({ user: null, token: null, isAuthenticated: false, loading: false });
  };

  return (
    <AuthContext.Provider value={{ ...authState, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
};
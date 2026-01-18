import React, { createContext, useState, useEffect, ReactNode, useContext } from 'react';
import { User, AuthState } from '../types/auth.types';

interface AuthContextType extends AuthState {
  login: (token: string, user: User) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// frontend/src/context/AuthContext.tsx

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    token: localStorage.getItem('token'),
    isAuthenticated: !!localStorage.getItem('token'),
  });

  // ESTA ES LA FUNCIÓN QUE DEBES ACTUALIZAR O COLOCAR
  const login = (token: string, user: User) => {
    localStorage.setItem('token', token);
    localStorage.setItem('role', user.role); 
    
    setAuthState({ 
      user, 
      token, 
      isAuthenticated: true 
    });
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('role');
    setAuthState({ user: null, token: null, isAuthenticated: false });
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
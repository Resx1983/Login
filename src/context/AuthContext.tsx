import React, { createContext, useContext, useState } from 'react';
import { UsuarioSesion } from '../types';

type AuthContextType = {
  usuario: UsuarioSesion | null;
  setUsuario: (u: UsuarioSesion | null) => void;
  logout: () => void;
};

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  setUsuario: () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioSesion | null>(null);

  const logout = () => setUsuario(null);

  return (
    <AuthContext.Provider value={{ usuario, setUsuario, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}

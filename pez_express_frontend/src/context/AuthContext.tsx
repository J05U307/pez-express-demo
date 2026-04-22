import { createContext, useContext, useEffect, useState } from "react";
import type { ReactNode } from "react";
import { getMe } from "../services/authService";

interface Usuario {
  id: number;
  nombre: string;
  apellido: string;
  rol: string;
  passwordTemporal: boolean;
}

interface AuthContextType {
  usuario: Usuario | null;
  loading: boolean;
  refetch: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  usuario: null,
  loading: true,
  refetch: async () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<Usuario | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (!localStorage.getItem("hasSession")) {
      setLoading(false);
      return; // sin sesión previa → no hace el request
    }

    try {
      const data = await getMe();
      setUsuario(data);
    } catch {
      localStorage.removeItem("hasSession"); // token expiró → limpia
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchUser();

    const handleLogout = () => {
      localStorage.removeItem("hasSession"); // ← agrega esto
      setUsuario(null);
      setLoading(false);
    };

    window.addEventListener("auth:logout", handleLogout);
    return () => window.removeEventListener("auth:logout", handleLogout);
  }, []);

  return (
    <AuthContext.Provider value={{ usuario, loading, refetch: fetchUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);

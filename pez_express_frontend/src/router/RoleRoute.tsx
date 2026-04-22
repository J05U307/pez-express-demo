import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface Props {
  allowed: string[];
  children: React.ReactNode;
}

export default function RoleRoute({ allowed, children }: Props) {
  const { usuario, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!usuario) return <Navigate to="/login" replace />;
  if (!allowed.includes(usuario.rol)) return <Navigate to="/dashboard" replace />;

  return <>{children}</>;
}
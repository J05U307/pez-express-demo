import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";
import { login, getMe } from "../../services/authService";
import { useAuth } from "../../context/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { refetch } = useAuth();
  const [usuario, setUsuario] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Solo verifica sesión activa si el flag existe
    if (localStorage.getItem("hasSession")) {
      try {
        await getMe();
        navigate("/dashboard");
        return;
      } catch {
        localStorage.removeItem("hasSession");
      }
    }

    // Login normal
    try {
      await login(usuario, password);
      await refetch();
      navigate("/dashboard");
    } catch {
      setError("Usuario o contraseña incorrectos");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 bg-gray-100 relative overflow-hidden"
      style={{
        backgroundImage: `url('/hero.webp')`,
        backgroundSize: "cover",
        backgroundPosition: "center",
      }}
    >
      <div className="absolute inset-0 bg-black/30 backdrop-blur-md"></div>

      <div className="relative w-full max-w-md z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-[#14B5D9] via-[#3B7FD9] to-[#025E73] rounded-3xl shadow-xl
                        md:transform md:-rotate-3 md:scale-105 scale-100 z-0"></div>

        <div className="relative bg-white rounded-3xl shadow-2xl p-10 z-10 flex flex-col items-center">
          <img
            src="/logo.webp"
            alt="Logo Cevichería Pez Express"
            className="w-24 h-24 object-contain mb-4 shadow-md"
          />

          <h1 className="text-2xl md:text-3xl font-bold text-[#025E73] text-center mb-2">
            INICIAR SESIÓN
          </h1>
          <p className="text-center text-sm text-red-600 font-semibold mb-6">
            ⚠️ Solo personal autorizado
          </p>

          <form onSubmit={handleLogin} className="w-full space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700">Usuario</label>
              <input
                type="text"
                value={usuario}
                onChange={(e) => setUsuario(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#3B7FD9]"
                placeholder="Ingrese su usuario"
              />
            </div>

            <div className="relative">
              <label className="block text-sm font-medium text-gray-700">Contraseña</label>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="mt-1 block w-full rounded-xl border border-gray-300 px-4 py-2 pr-12 focus:outline-none focus:ring-2 focus:ring-[#3B7FD9]"
                placeholder="Ingrese su contraseña"
              />
              <button
                type="button"
                className="absolute right-3 top-9 text-gray-500"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            {error && (
              <p className="text-red-500 text-center mt-1">{error}</p>
            )}

            {/* ✅ Botón con estado loading */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#3B7FD9] hover:bg-[#14B5D9] text-white font-semibold py-2 rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Verificando..." : "Ingresar"}
            </button>
          </form>

          <p className="text-center text-gray-500 mt-4 text-sm">
            Si olvidó su contraseña, contacte con el administrador.
          </p>

          <div className="text-center mt-6">
            <a href="/" className="text-[#025E73] font-semibold hover:underline">
              ← Regresar al inicio
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Home } from "lucide-react";

export default function NotFound() {
  const navigate = useNavigate();

  const handleVolver = () => {
    // Si hay historial previo, vuelve atrás
    // Si no (acceso directo a una URL inválida), va al inicio
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate("/");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-cyan-100 rounded-full opacity-30 blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-orange-100 rounded-full opacity-30 blur-3xl" />
      </div>

      <div className="relative text-center max-w-md w-full">

        {/* Logo */}
        <div className="flex justify-center mb-6">
          <div className="relative">
            <div className="w-24 h-24 bg-white border-2 border-gray-200 rounded-3xl flex items-center justify-center shadow-sm overflow-hidden">
              <img src="/logo.webp" alt="Pez Express" className="w-16 h-16 object-contain" />
            </div>
            <div className="absolute -top-2 -right-2 w-9 h-9 bg-orange-500 rounded-xl flex items-center justify-center shadow-md">
              <span className="text-white font-black text-[10px] leading-none">404</span>
            </div>
          </div>
        </div>

        {/* Número grande decorativo */}
        <div className="mb-2">
          <span className="text-[120px] font-black text-gray-100 leading-none select-none tracking-tighter">
            404
          </span>
        </div>

        {/* Texto */}
        <h1 className="text-2xl font-black text-gray-900 mb-2 -mt-4">
          Página no encontrada
        </h1>
        <p className="text-gray-500 text-sm leading-relaxed mb-8">
          La página que buscas no existe o fue movida.
          <br />
          Vuelve al inicio para continuar.
        </p>

        {/* Botones */}
        <div className="flex items-center justify-center gap-3">
          <button
            onClick={handleVolver}
            className="inline-flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 active:bg-cyan-700 text-white font-bold px-6 py-3 rounded-2xl transition-colors duration-150 shadow-sm shadow-cyan-200"
          >
            <ArrowLeft size={16} />
            Volver atrás
          </button>

          <button
            onClick={() => navigate("/")}
            className="inline-flex items-center gap-2 bg-white hover:bg-gray-50 active:bg-gray-100 text-gray-600 font-bold px-6 py-3 rounded-2xl transition-colors duration-150 border border-gray-200 shadow-sm"
          >
            <Home size={16} />
            Inicio
          </button>
        </div>

        <p className="mt-8 text-[11px] text-gray-300 font-semibold tracking-widest uppercase">
          Pez Express
        </p>
      </div>
    </div>
  );
}
import { Outlet, useNavigate } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import { useEffect, useState } from "react";
import { useAuth } from "../context/AuthContext";
import { ShieldAlert, X, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

export default function DashboardLayout() {
  // ✅ Estado del sidebar móvil centralizado aquí
  const [mobileOpen, setMobileOpen] = useState(false);

  const [showToast, setShowToast] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);
  const navigate = useNavigate();
  const { usuario, loading } = useAuth();

  useEffect(() => {
    if (loading) return;
    if (!usuario) { navigate("/"); return; }
    if (usuario.passwordTemporal) {
      setShowToast(true);
      setTimeout(() => setToastVisible(true), 50);
      setTimeout(() => handleClose(), 6500);
    }
  }, [usuario, loading]);

  const handleClose = () => {
    setToastVisible(false);
    setTimeout(() => setShowToast(false), 400);
  };

  return (
    <div className="flex h-screen bg-soft">
      {/* Sidebar recibe el estado del móvil */}
      <Sidebar mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Navbar recibe el callback para abrir el sidebar */}
        <Navbar onMenuClick={() => setMobileOpen(true)} />

        <main className="flex-1 p-6 overflow-auto relative">
          <Outlet />

          {/* Toast contraseña temporal */}
          {showToast && (
            <div
              className={`fixed bottom-6 right-6 z-50 flex items-start gap-3 bg-[#0F253A] border border-amber-400/50 shadow-2xl shadow-amber-900/30 rounded-2xl px-5 py-4 max-w-sm w-full transition-all duration-400 ease-in-out ${
                toastVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6"
              }`}
              style={{ transition: "opacity 0.4s ease, transform 0.4s ease" }}
            >
              <div className="absolute bottom-0 left-0 h-1 bg-amber-400/30 rounded-b-2xl w-full overflow-hidden">
                <div
                  className="h-full bg-amber-400 rounded-b-2xl"
                  style={{ animation: toastVisible ? "shrink 6s linear forwards" : "none" }}
                />
              </div>

              <div className="w-9 h-9 rounded-xl bg-amber-400/15 border border-amber-400/30 flex items-center justify-center shrink-0 mt-0.5">
                <ShieldAlert size={18} className="text-amber-400" />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-white font-semibold text-sm">Contraseña temporal</p>
                <p className="text-gray-400 text-xs mt-0.5 leading-relaxed">
                  Estás usando tu DNI como contraseña. Cámbiala para mayor seguridad.
                </p>
                <Link
                  to="/dashboard/configuracion/perfil"
                  onClick={handleClose}
                  className="inline-flex items-center gap-1 text-amber-400 text-xs font-semibold mt-2 hover:text-amber-300 transition-colors"
                >
                  Cambiar ahora <ArrowRight size={12} />
                </Link>
              </div>

              <button
                onClick={handleClose}
                className="text-gray-500 hover:text-gray-300 transition-colors shrink-0 mt-0.5"
              >
                <X size={16} />
              </button>
            </div>
          )}

          <style>{`@keyframes shrink { from { width: 100%; } to { width: 0%; } }`}</style>
        </main>
      </div>
    </div>
  );
}
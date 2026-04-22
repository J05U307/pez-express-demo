import { LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { logout } from "../services/authService";

interface NavbarProps {
  onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const { usuario } = useAuth();

  const confirmLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.log("Error cerrando sesión");
    }
    navigate("/");
  };

  return (
    <>
      <header className="h-16 bg-[#0B1C2D] border-b border-cyan-500/30 flex items-center justify-between px-4 sm:px-6">
        
        {/* Botón hamburguesa — solo visible en móvil, dentro del header */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMenuClick}
            className="md:hidden bg-cyan-500/20 border border-cyan-400/40 p-2 rounded-lg text-cyan-300 hover:bg-cyan-500/30 transition-colors"
          >
            <Menu size={20} />
          </button>
        </div>

        {/* Usuario + logout */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-cyan-500/20 border border-cyan-400/40 flex items-center justify-center text-cyan-300 font-semibold">
              {usuario?.nombre?.charAt(0) ?? "?"}
            </div>
            <div className="text-left leading-tight">
              <p className="text-sm text-white font-medium">{usuario?.nombre ?? ""}</p>
              <p className="text-xs text-cyan-300">{usuario?.rol ?? ""}</p>
            </div>
          </div>

          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-3 py-2 rounded-xl border border-cyan-400/60 text-cyan-300 hover:bg-cyan-400 hover:text-[#0B1C2D] transition"
          >
            <LogOut size={16} />
            <span className="hidden sm:block">Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* Modal confirmar logout */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-[#0F253A] w-[90%] max-w-sm rounded-2xl shadow-2xl border border-cyan-500/30 p-6 animate-fadeIn">
            <h2 className="text-lg font-semibold text-white mb-2">Cerrar sesión</h2>
            <p className="text-sm text-gray-300 mb-6">¿Estás seguro que deseas salir del sistema?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 rounded-lg text-gray-300 hover:bg-white/10 transition"
              >
                Cancelar
              </button>
              <button
                onClick={confirmLogout}
                className="px-4 py-2 rounded-lg bg-cyan-500 text-[#0B1C2D] font-semibold hover:bg-cyan-400 transition"
              >
                Sí, salir
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
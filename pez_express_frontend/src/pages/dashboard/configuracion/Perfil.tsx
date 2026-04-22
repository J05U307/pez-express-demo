// src/pages/dashboard/configuracion/Perfil.tsx
import { useState, useEffect } from "react";
import { getMe } from "../../../services/authService";
import { cambiarPassword } from "../../../services/usuarioService";
import {
  UserCircle, Lock, CheckCircle, AlertCircle,
  Eye, EyeOff, Shield, ShieldAlert, ShieldCheck
} from "lucide-react";
import { PageHeader } from "../../../components/ui/pages/PageHeader";

interface UserMe {
  id: number;
  nombre: string;
  apellido: string;
  usuario: string;
  dni: string;
  rol: string;
  passwordTemporal: boolean;
}

/* ─── Sub-componente: campo de solo lectura ───────────────────── */
function ReadField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
        {label}
      </p>
      <p className="text-gray-800 font-medium bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm">
        {value}
      </p>
    </div>
  );
}

/* ─── Sub-componente: input de contraseña ─────────────────────── */
function PasswordInput({
  label, hint, value, show, onChange, onToggle, placeholder, disabled,
}: {
  label: string; hint?: string; value: string; show: boolean;
  onChange: (v: string) => void; onToggle: () => void;
  placeholder?: string; disabled?: boolean;
}) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <label className="text-sm font-medium text-gray-700">{label}</label>
        {hint && <span className="text-xs text-gray-400">{hint}</span>}
      </div>
      <input
        type={show ? "text" : "password"}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required
        disabled={disabled}
        className="w-full rounded-xl border border-gray-300 px-4 py-2 pr-12 text-sm
                   focus:outline-none focus:ring-2 focus:ring-cyan-400
                   disabled:bg-gray-50 disabled:text-gray-400"
      />
      <button
        type="button"
        onClick={onToggle}
        className="absolute right-3 top-8 text-gray-400 hover:text-gray-600 transition-colors"
      >
        {show ? <EyeOff size={17} /> : <Eye size={17} />}
      </button>
    </div>
  );
}

/* ─── Componente principal ────────────────────────────────────── */
export default function Perfil() {
  const [usuario, setUsuario] = useState<UserMe | null>(null);
  const [loadingUser, setLoadingUser] = useState(true);
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNuevo, setPasswordNuevo] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [showActual, setShowActual] = useState(false);
  const [showNuevo, setShowNuevo] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getMe()
      .then(setUsuario)
      .catch(console.error)
      .finally(() => setLoadingUser(false));
  }, []);

  const handleCambiarPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (passwordNuevo !== passwordConfirm) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    if (passwordNuevo.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres.");
      return;
    }
    if (!usuario) return;

    setLoading(true);
    try {
      await cambiarPassword({ idUsuario: usuario.id, passwordActual, passwordNuevo });
      setSuccess("¡Contraseña actualizada correctamente!");
      setPasswordActual("");
      setPasswordNuevo("");
      setPasswordConfirm("");
      const updated = await getMe();
      setUsuario(updated);
    } catch (err: any) {
      setError(
        err.response?.data?.message ||
        err.response?.data ||
        "Error al cambiar la contraseña."
      );
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="text-gray-800">

      <PageHeader
        icon={<UserCircle size={24} className="text-cyan-500" />}
        title="Mi Perfil"
        subtitle="Información de tu cuenta y seguridad"
        action={null} // ← agregar esto
      />



      {/* Alerta contraseña temporal */}
      {!loadingUser && usuario?.passwordTemporal && (
        <div className="flex items-start gap-3 bg-amber-50 border border-amber-300 rounded-2xl p-4 mb-6">
          <ShieldAlert size={18} className="text-amber-500 mt-0.5 shrink-0" />
          <div>
            <p className="text-amber-800 font-semibold text-sm">Contraseña temporal activa</p>
            <p className="text-amber-700 text-xs mt-0.5">
              Estás usando tu DNI como contraseña. Cámbiala ahora para mayor seguridad.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Datos personales ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm
                        hover:border-cyan-400 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-400/40
                            flex items-center justify-center shrink-0">
              <UserCircle size={18} className="text-cyan-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Datos personales</h2>
              <p className="text-xs text-gray-400">Tu información registrada en el sistema</p>
            </div>
          </div>

          {loadingUser ? (
            <div className="space-y-3">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-9 bg-gray-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : usuario ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <ReadField label="Nombre" value={usuario.nombre} />
              <ReadField label="Apellido" value={usuario.apellido} />
              <ReadField label="Usuario" value={`@${usuario.usuario}`} />
              <ReadField label="DNI" value={usuario.dni} />
              <ReadField label="Rol" value={usuario.rol} />
              <div>
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">
                  Contraseña
                </p>
                <div className={`flex items-center gap-2 rounded-xl px-4 py-2 text-sm border font-medium ${usuario.passwordTemporal
                    ? "bg-amber-50 border-amber-200 text-amber-700"
                    : "bg-green-50 border-green-200 text-green-700"
                  }`}>
                  {usuario.passwordTemporal
                    ? <><ShieldAlert size={14} /><span>Temporal (DNI)</span></>
                    : <><ShieldCheck size={14} /><span>Personalizada</span></>
                  }
                </div>
              </div>
            </div>
          ) : null}
        </div>

        {/* ── Cambiar contraseña ── */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm
                        hover:border-cyan-400 hover:shadow-md transition-all duration-200">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-10 h-10 rounded-full bg-cyan-500/15 border border-cyan-400/40
                            flex items-center justify-center shrink-0">
              <Lock size={18} className="text-cyan-500" />
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-800">Cambiar contraseña</h2>
              <p className="text-xs text-gray-400">
                {usuario?.passwordTemporal
                  ? "Usa tu DNI como contraseña actual"
                  : "Ingresa tu contraseña actual para confirmar"}
              </p>
            </div>
          </div>

          <form onSubmit={handleCambiarPassword} className="space-y-4">
            <PasswordInput
              label="Contraseña actual"
              hint={usuario?.passwordTemporal ? "tu DNI" : undefined}
              value={passwordActual}
              show={showActual}
              onChange={setPasswordActual}
              onToggle={() => setShowActual(!showActual)}
              placeholder={usuario?.passwordTemporal ? "Ingresa tu DNI" : "Contraseña actual"}
              disabled={loading}
            />
            <PasswordInput
              label="Nueva contraseña"
              hint="Mín. 6 caracteres"
              value={passwordNuevo}
              show={showNuevo}
              onChange={setPasswordNuevo}
              onToggle={() => setShowNuevo(!showNuevo)}
              placeholder="Nueva contraseña"
              disabled={loading}
            />
            <PasswordInput
              label="Confirmar contraseña"
              value={passwordConfirm}
              show={showConfirm}
              onChange={setPasswordConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              placeholder="Repite la nueva contraseña"
              disabled={loading}
            />

            {error && (
              <div className="flex items-center gap-2 text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2.5 text-sm">
                <AlertCircle size={15} className="shrink-0" />
                {error}
              </div>
            )}
            {success && (
              <div className="flex items-center gap-2 text-green-600 bg-green-50 border border-green-200 rounded-xl px-4 py-2.5 text-sm">
                <CheckCircle size={15} className="shrink-0" />
                {success}
              </div>
            )}

            <button
              type="submit"
              disabled={loading || loadingUser}
              className="w-full flex items-center justify-center gap-2
                         bg-cyan-500 hover:bg-cyan-600 disabled:bg-cyan-300
                         text-white font-semibold py-2.5 rounded-xl
                         transition-all duration-200 shadow-sm hover:shadow-md text-sm"
            >
              {loading ? (
                <>
                  <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Actualizando...
                </>
              ) : (
                <>
                  <Shield size={15} />
                  Actualizar contraseña
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
// src/components/ui/modal/BaseModal.tsx

import { useEffect } from "react";
import { X } from "lucide-react";

interface BaseModalProps {
  open: boolean;
  onClose: () => void;
  loading?: boolean;
  /** Ícono decorativo del header (nodo React, ej. <UserPlus />) */
  icon: React.ReactNode;
  title: string;
  subtitle?: string;
  /** Si true, muestra un badge de sparkle sobre el ícono (útil para "editar") */
  badge?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Shell reutilizable para modales de formulario.
 * Incluye: overlay, contenedor, drag handle mobile, header con ícono/título y
 * animación de entrada. Los hijos van dentro del `<form>` del modal específico.
 */
export function BaseModal({
  open,
  onClose,
  loading = false,
  icon,
  title,
  subtitle,
  badge,
  children,
}: BaseModalProps) {
  useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !loading) onClose();
    };
    if (open) window.addEventListener("keydown", handleEsc);

    return () => {
      window.removeEventListener("keydown", handleEsc);
      document.body.style.overflow = "";
    };
  }, [open, loading]);

  if (!open) return null;

  return (
    <>
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-slate-900/50 backdrop-blur-md z-40"
        onClick={() => !loading && onClose()}
      />

      {/* Wrapper */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-6">
        <div
          className="bg-white w-full sm:max-w-md rounded-t-[32px] sm:rounded-[28px] shadow-2xl max-h-[96dvh] overflow-y-auto overscroll-contain"
          style={{ animation: "modalSlide 0.32s cubic-bezier(0.22,1,0.36,1) both" }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Drag handle — solo mobile */}
          <div className="flex justify-center pt-3 pb-1 sm:hidden">
            <div className="w-9 h-1 rounded-full bg-slate-200" />
          </div>

          {/* Header */}
          <div className="relative px-6 pt-5 pb-5 sm:pt-7 sm:px-7">
            {/* Decoración fondo */}
            <div className="absolute top-0 right-0 w-40 h-32 rounded-bl-full opacity-[0.04] bg-cyan-500 pointer-events-none" />

            <div className="flex items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                {/* Ícono */}
                <div className="relative flex-shrink-0">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-cyan-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-cyan-500/25">
                    {icon}
                  </div>
                  {badge && (
                    <div className="absolute -top-1 -right-1">
                      {badge}
                    </div>
                  )}
                </div>

                {/* Título */}
                <div>
                  <h2 className="text-lg font-bold text-slate-900 leading-tight">
                    {title}
                  </h2>
                  {subtitle && (
                    <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>
                  )}
                </div>
              </div>

              {/* Botón cerrar */}
              <button
                type="button"
                onClick={() => !loading && onClose()}
                disabled={loading}
                aria-label="Cerrar"
                className="mt-0.5 w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 transition-colors flex-shrink-0 disabled:opacity-40"
              >
                <X size={16} />
              </button>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-slate-100 mx-6 sm:mx-7" />

          {/* Contenido (form del modal específico) */}
          <div className="px-6 py-6 sm:px-7">
            {children}
          </div>
        </div>
      </div>

      <style>{`
        @keyframes modalSlide {
          from { transform: translateY(48px); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
      `}</style>
    </>
  );
}
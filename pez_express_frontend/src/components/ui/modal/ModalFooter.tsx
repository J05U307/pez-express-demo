// src/components/ui/modal/ModalFooter.tsx

import { CheckCircle2 } from "lucide-react";

interface ModalFooterProps {
  onClose: () => void;
  loading: boolean;
  saved: boolean;
  labelSubmit?: string;
  labelCancel?: string;
}

/**
 * Footer reutilizable para modales de formulario.
 * Muestra botones de Cancelar y Guardar con estados de carga y éxito.
 */
export function ModalFooter({
  onClose,
  loading,
  saved,
  labelSubmit = "Guardar",
  labelCancel = "Cancelar",
}: ModalFooterProps) {
  return (
    <div className="flex gap-3 pt-1">
      <button
        type="button"
        onClick={() => !loading && onClose()}
        disabled={loading}
        className="flex-1 min-h-[50px] rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-600 font-semibold text-sm transition-colors disabled:opacity-50"
      >
        {labelCancel}
      </button>

      <button
        type="submit"
        disabled={loading || saved}
        className={`
          flex-[2] min-h-[50px] rounded-2xl font-semibold text-sm text-white
          flex items-center justify-center gap-2
          transition-all duration-200
          disabled:opacity-60 disabled:cursor-not-allowed
          ${
            saved
              ? "bg-emerald-500 shadow-lg shadow-emerald-500/25"
              : "bg-gradient-to-r from-cyan-500 to-cyan-600 shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 hover:-translate-y-0.5 active:translate-y-0"
          }
        `}
      >
        {saved ? (
          <>
            <CheckCircle2 size={17} />
            Guardado
          </>
        ) : loading ? (
          <>
            <span className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin block" />
            Guardando…
          </>
        ) : (
          labelSubmit
        )}
      </button>
    </div>
  );
}
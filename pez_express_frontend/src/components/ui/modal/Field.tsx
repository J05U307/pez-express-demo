// src/components/ui/modal/Field.tsx

import { AlertCircle } from "lucide-react";

interface FieldProps {
  label: string;
  icon: React.ReactNode;
  children: React.ReactNode;
  error?: string;
  hint?: string;
  className?: string;
}

/**
 * Wrapper reutilizable para campos de formulario dentro de modales.
 * Muestra label con ícono, el input (children), hint opcional y mensaje de error.
 */
export function Field({ label, icon, children, error, hint, className = "" }: FieldProps) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      <div className="flex items-center justify-between pl-0.5">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">{icon}</span>
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
            {label}
          </label>
        </div>
        {hint && !error && (
          <span className="text-[11px] text-slate-300 font-medium">{hint}</span>
        )}
      </div>

      {children}

      {error && (
        <div className="flex items-center gap-1.5">
          <AlertCircle size={11} className="text-rose-400 flex-shrink-0" />
          <p className="text-[11px] text-rose-500 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}

/** Clases base para inputs de texto dentro de modales */
export function inputCls(hasError: boolean): string {
  return `
    w-full px-4 py-3 min-h-[48px]
    rounded-2xl border-2 bg-slate-50/80
    text-sm font-medium text-slate-800
    placeholder:text-slate-300 placeholder:font-normal
    focus:outline-none focus:bg-white
    transition-all duration-200
    disabled:opacity-50 disabled:cursor-not-allowed
    ${
      hasError
        ? "border-rose-300 focus:border-rose-400 bg-rose-50/40"
        : "border-slate-200 focus:border-cyan-400"
    }
  `.trim();
}

/** Clases base para selects dentro de modales */
export function selectCls(hasError: boolean): string {
  return `
    w-full pl-4 pr-9 py-3 min-h-[48px]
    rounded-2xl border-2 bg-slate-50/80
    text-sm font-medium text-slate-800
    focus:outline-none focus:bg-white
    transition-all duration-200 appearance-none cursor-pointer
    disabled:opacity-50 disabled:cursor-not-allowed
    ${
      hasError
        ? "border-rose-300 focus:border-rose-400 bg-rose-50/40"
        : "border-slate-200 focus:border-cyan-400"
    }
  `.trim();
}
// src/pages/dashboard/components/InsumoModal.tsx

import { useState, useEffect } from "react";
import { Package, Layers, Hash, Sparkles, AlertCircle, ChevronDown } from "lucide-react";
import { BaseModal } from "../../../components/ui/modal/BaseModal";
import { Field, inputCls, selectCls } from "../../../components/ui/modal/Field";
import { ModalFooter } from "../../../components/ui/modal/ModalFooter";
import type { Estado, UnidadMedida } from "../../../types/common";

/* ─── DTO ─────────────────────────────────────────────────────── */

export interface InsumoFormData {
  nombre: string;
  unidadMedida: UnidadMedida;
  stockActual: number;
  estado: Estado;
}

/* ─── Props ───────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  /** Debe lanzar un error si falla — el modal lo captura y muestra */
  onSave: (data: InsumoFormData) => Promise<void>;
  initial?: InsumoFormData | null;
  isEditing?: boolean;
}

/* ─── Constantes ──────────────────────────────────────────────── */

const UNIDADES: UnidadMedida[] = ["UNIDAD", "KG", "LITRO", "PORCION"];

const EMPTY: InsumoFormData = {
  nombre: "",
  unidadMedida: "UNIDAD",
  stockActual: 0,
  estado: "ACTIVO",
};

/* ─── Validación ──────────────────────────────────────────────── */

type FormFields = keyof InsumoFormData;
type FieldErrors = Partial<Record<FormFields, string>>;

function validate(form: InsumoFormData): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
  else if (form.nombre.trim().length < 2) errors.nombre = "Mínimo 2 caracteres.";
  if (form.stockActual < 0) errors.stockActual = "El stock no puede ser negativo.";
  return errors;
}

function parseServerError(message: string): { field: FormFields | null; message: string } {
  if (message.toLowerCase().includes("nombre")) return { field: "nombre", message };
  return { field: null, message };
}

/* ─── Componente ──────────────────────────────────────────────── */

export default function InsumoModal({ open, onClose, onSave, initial, isEditing = false }: Props) {
  const [form, setForm] = useState<InsumoFormData>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FormFields, boolean>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [stockDisplay, setStockDisplay] = useState<string>("");

  useEffect(() => {
    if (open) {
      const data = initial ?? EMPTY;
      setForm(data);
      setStockDisplay(data.stockActual === 0 ? "" : String(data.stockActual));
      setErrors({});
      setTouched({});
      setServerError(null);
      setLoading(false);
      setSaved(false);
    }
  }, [open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;

    if (name === "stockActual") {
      const raw = value.replace(/^0+(\d)/, "$1");
      setStockDisplay(raw);
      const numeric = raw === "" ? 0 : Math.max(0, Number(raw));
      const updated = { ...form, stockActual: isNaN(numeric) ? 0 : numeric };
      setForm(updated);
      setServerError(null);
      if (touched.stockActual) {
        setErrors((prev) => ({ ...prev, stockActual: validate(updated).stockActual }));
      }
      return;
    }

    const updated = { ...form, [name]: value };
    setForm(updated);
    setServerError(null);
    if (touched[name as FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: validate(updated)[name as FormFields] }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(form)[name as FormFields] }));
    if (name === "stockActual" && stockDisplay === "") setStockDisplay("0");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const allTouched = Object.keys(form).reduce(
      (acc, k) => ({ ...acc, [k]: true }),
      {} as Record<FormFields, boolean>
    );
    setTouched(allTouched);
    const newErrors = validate(form);
    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setLoading(true);
      setServerError(null);
      await onSave(form);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 900);
    } catch (error: any) {
      const raw: string =
        error?.response?.data?.mensaje ||
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Ocurrió un error inesperado.";
      const parsed = parseServerError(raw);
      if (parsed.field) {
        setErrors((prev) => ({ ...prev, [parsed.field!]: parsed.message }));
        setTouched((prev) => ({ ...prev, [parsed.field!]: true }));
      } else {
        setServerError(raw);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      loading={loading}
      icon={<Package size={20} className="text-white" strokeWidth={2.2} />}
      title={isEditing ? "Editar Insumo" : "Nuevo Insumo"}
      subtitle={isEditing ? "Modifica los datos del insumo" : "Registra un nuevo insumo"}
      badge={
        isEditing ? (
          <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
            <Sparkles size={9} className="text-white" />
          </div>
        ) : undefined
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
        {serverError && (
          <div className="flex items-start gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span className="font-medium">{serverError}</span>
          </div>
        )}

        <Field
          label="Nombre"
          icon={<Package size={13} />}
          error={touched.nombre ? errors.nombre : undefined}
        >
          <input
            name="nombre"
            placeholder="Ej. Caballa, Harina…"
            value={form.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            autoFocus={false}
            disabled={loading}
            className={inputCls(Boolean(touched.nombre && errors.nombre))}
          />
        </Field>

        <div className="grid grid-cols-2 gap-4">
          <Field
            label="Unidad"
            icon={<Layers size={13} />}
            error={touched.unidadMedida ? errors.unidadMedida : undefined}
          >
            <div className="relative">
              <select
                name="unidadMedida"
                value={form.unidadMedida}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                className={selectCls(Boolean(touched.unidadMedida && errors.unidadMedida))}
              >
                {UNIDADES.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
              <ChevronDown
                size={14}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
              />
            </div>
          </Field>

          <Field
            label="Stock"
            icon={<Hash size={13} />}
            error={touched.stockActual ? errors.stockActual : undefined}
          >
            <input
              name="stockActual"
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="0"
              value={stockDisplay}
              onChange={handleChange}
              onBlur={handleBlur}
              autoComplete="off"
              disabled={loading}
              className={inputCls(Boolean(touched.stockActual && errors.stockActual))}
            />
          </Field>
        </div>

        {/* Estado toggle */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-0.5">
            Estado
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {(["ACTIVO", "INACTIVO"] as Estado[]).map((e) => {
              const active = form.estado === e;
              return (
                <button
                  key={e}
                  type="button"
                  disabled={loading}
                  onClick={() => setForm({ ...form, estado: e })}
                  className={`
                    py-3 text-sm font-semibold rounded-2xl border-2
                    transition-all duration-200
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${
                      active
                        ? e === "ACTIVO"
                          ? "bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/20"
                          : "bg-slate-700 text-white border-slate-700 shadow-md"
                        : "bg-transparent text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
                    }
                  `}
                >
                  {e === "ACTIVO" ? "✓ Activo" : "○ Inactivo"}
                </button>
              );
            })}
          </div>
        </div>

        <ModalFooter
          onClose={onClose}
          loading={loading}
          saved={saved}
          labelSubmit={isEditing ? "Guardar cambios" : "Crear insumo"}
        />
      </form>
    </BaseModal>
  );
}
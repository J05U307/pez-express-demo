// src/pages/dashboard/productos/components/ProductoModal.tsx

import { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  Type,
  AlignLeft,
  DollarSign,
  Tag,
  Sparkles,
  AlertCircle,
  ChevronDown,
  Hash,
  Printer,
  Layers,
} from "lucide-react";

import type { ProductoCreateDTO } from "../../../types/dtos/ProductoCreateDTO";
import { BaseModal } from "../../../components/ui/modal/BaseModal";
import { Field, inputCls, selectCls } from "../../../components/ui/modal/Field";
import { ModalFooter } from "../../../components/ui/modal/ModalFooter";
import type { Estado, TipoProducto } from "../../../types/common";

/* ─── Constantes ──────────────────────────────────────────────── */

const TIPOS: TipoProducto[] = ["PLATO", "BEBIDA_ENVASA", "BEBIDA_PREPARADA", "GUARNICION", "EXTRA"];

export const EMPTY: ProductoCreateDTO = {
  nombre: "",
  descripcion: "",
  precio: 0,
  manejoStock: false,
  imprimeCocina: true,
  tipoProducto: "PLATO",
  stockActual: undefined,
  estado: "ACTIVO",
};

/* ─── Validación ──────────────────────────────────────────────── */

type FormFields = keyof ProductoCreateDTO;
type FieldErrors = Partial<Record<FormFields, string>>;

function validate(form: ProductoCreateDTO): FieldErrors {
  const errors: FieldErrors = {};
  if (!form.nombre.trim()) errors.nombre = "El nombre es obligatorio.";
  else if (form.nombre.trim().length < 2) errors.nombre = "Mínimo 2 caracteres.";
  if (!form.descripcion.trim()) errors.descripcion = "La descripción es obligatoria.";
  if (form.precio <= 0) errors.precio = "El precio debe ser mayor a 0.";
  if (form.manejoStock && (form.stockActual === undefined || form.stockActual < 0)) {
    errors.stockActual = "El stock debe ser 0 o mayor.";
  }
  return errors;
}

function parseServerError(message: string): { field: FormFields | null; message: string } {
  if (message.toLowerCase().includes("nombre")) return { field: "nombre", message };
  return { field: null, message };
}

/* ─── Props ───────────────────────────────────────────────────── */

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (data: ProductoCreateDTO) => Promise<void>;
  initial?: ProductoCreateDTO | null;
  isEditing?: boolean;
}

/* ─── Componente ──────────────────────────────────────────────── */

export default function ProductoModal({ open, onClose, onSave, initial, isEditing = false }: Props) {
  const [form, setForm] = useState<ProductoCreateDTO>(EMPTY);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [touched, setTouched] = useState<Partial<Record<FormFields, boolean>>>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  // Displays separados para evitar "0" inicial en numéricos
  const [precioDisplay, setPrecioDisplay] = useState("");
  const [stockDisplay, setStockDisplay] = useState("");

  useEffect(() => {
    if (open) {
      const data = initial ?? EMPTY;
      setForm(data);
      setPrecioDisplay(data.precio === 0 ? "" : String(data.precio));
      setStockDisplay(data.stockActual === undefined || data.stockActual === 0 ? "" : String(data.stockActual));
      setErrors({});
      setTouched({});
      setServerError(null);
      setLoading(false);
      setSaved(false);
    }
  }, [open]);

  /* ── Handlers numéricos ── */

  const handleNumericChange = (
    field: "precio" | "stockActual",
    raw: string,
    setDisplay: (v: string) => void
  ) => {
    const clean = raw.replace(/^0+(\d)/, "$1").replace(/[^0-9.]/g, "");
    setDisplay(clean);
    const numeric = clean === "" ? 0 : parseFloat(clean);
    const updated = { ...form, [field]: isNaN(numeric) ? 0 : numeric };
    setForm(updated);
    setServerError(null);
    if (touched[field]) {
      setErrors((prev) => ({ ...prev, [field]: validate(updated)[field] }));
    }
  };

  const handleNumericBlur = (
    field: "precio" | "stockActual",
    display: string,
    setDisplay: (v: string) => void
  ) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    setErrors((prev) => ({ ...prev, [field]: validate(form)[field] }));
    if (display === "") setDisplay("0");
  };

  /* ── Handler general (texto / select) ── */

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    const updated = { ...form, [name]: value };
    setForm(updated);
    setServerError(null);
    if (touched[name as FormFields]) {
      setErrors((prev) => ({ ...prev, [name]: validate(updated)[name as FormFields] }));
    }
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
    setErrors((prev) => ({ ...prev, [name]: validate(form)[name as FormFields] }));
  };

  /* ── Toggle manejoStock: limpia stockActual si se desactiva ── */

  const handleManejoStockToggle = (value: boolean) => {
    setForm((prev) => ({
      ...prev,
      manejoStock: value,
      stockActual: value ? (prev.stockActual ?? 0) : undefined,
    }));
    if (!value) {
      setStockDisplay("");
      setErrors((prev) => ({ ...prev, stockActual: undefined }));
    }
  };

  /* ── Submit ── */

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

    // Si manejoStock es false, no enviamos stockActual
    const payload: ProductoCreateDTO = form.manejoStock
      ? form
      : { ...form, stockActual: undefined };

    try {
      setLoading(true);
      setServerError(null);
      await onSave(payload);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 900);
    } catch (error: any) {
      const raw: string =
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

  /* ── Toggle genérico reutilizable ── */
  const ToggleBtn = ({
    active,
    onClick,
    children,
    activeClass = "bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/20",
  }: {
    active: boolean;
    onClick: () => void;
    children: React.ReactNode;
    activeClass?: string;
  }) => (
    <button
      type="button"
      disabled={loading}
      onClick={onClick}
      className={`
        flex-1 py-2.5 text-sm font-semibold rounded-2xl border-2
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${active
          ? activeClass
          : "bg-transparent text-slate-500 border-slate-200 hover:border-slate-300 hover:bg-slate-50"
        }
      `}
    >
      {children}
    </button>
  );

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      loading={loading}
      icon={<UtensilsCrossed size={20} className="text-white" strokeWidth={2.2} />}
      title={isEditing ? "Editar Producto" : "Nuevo Producto"}
      subtitle={isEditing ? "Modifica los datos del producto" : "Registra un nuevo producto"}
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

        {/* Nombre */}
        <Field label="Nombre" icon={<Type size={13} />} error={touched.nombre ? errors.nombre : undefined}>
          <input
            name="nombre"
            placeholder="Ej. Ceviche de trucha"
            value={form.nombre}
            onChange={handleChange}
            onBlur={handleBlur}
            autoComplete="off"
            autoFocus={false}
            disabled={loading}
            className={inputCls(Boolean(touched.nombre && errors.nombre))}
          />
        </Field>

        {/* Descripción */}
        <Field label="Descripción" icon={<AlignLeft size={13} />} error={touched.descripcion ? errors.descripcion : undefined}>
          <textarea
            name="descripcion"
            placeholder="Ej. Ceviche fresco preparado al momento..."
            value={form.descripcion}
            onChange={handleChange}
            onBlur={handleBlur}
            disabled={loading}
            rows={2}
            className={`
              resize-none
              ${inputCls(Boolean(touched.descripcion && errors.descripcion))}
            `}
          />
        </Field>

        {/* Tipo + Precio */}
        <div className="grid grid-cols-2 gap-4">
          <Field label="Tipo" icon={<Tag size={13} />} error={touched.tipoProducto ? errors.tipoProducto : undefined}>
            <div className="relative">
              <select
                name="tipoProducto"
                value={form.tipoProducto}
                onChange={handleChange}
                onBlur={handleBlur}
                disabled={loading}
                className={selectCls(Boolean(touched.tipoProducto && errors.tipoProducto))}
              >
                {TIPOS.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            </div>
          </Field>

          <Field label="Precio (S/)" icon={<DollarSign size={13} />} error={touched.precio ? errors.precio : undefined}>
            <input
              name="precio"
              type="text"
              inputMode="decimal"
              pattern="[0-9]*\.?[0-9]*"
              placeholder="0.00"
              value={precioDisplay}
              onChange={(e) => handleNumericChange("precio", e.target.value, setPrecioDisplay)}
              onBlur={() => handleNumericBlur("precio", precioDisplay, setPrecioDisplay)}
              autoComplete="off"
              disabled={loading}
              className={inputCls(Boolean(touched.precio && errors.precio))}
            />
          </Field>
        </div>

        {/* Imprimir cocina */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 pl-0.5">
            <span className="text-slate-400"><Printer size={13} /></span>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Imprime en cocina
            </label>
          </div>
          <div className="flex gap-2.5">
            <ToggleBtn active={form.imprimeCocina} onClick={() => setForm({ ...form, imprimeCocina: true })}>
              ✓ Sí
            </ToggleBtn>
            <ToggleBtn
              active={!form.imprimeCocina}
              onClick={() => setForm({ ...form, imprimeCocina: false })}
              activeClass="bg-slate-700 text-white border-slate-700 shadow-md"
            >
              ○ No
            </ToggleBtn>
          </div>
        </div>

        {/* Manejo de stock */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 pl-0.5">
            <span className="text-slate-400"><Layers size={13} /></span>
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
              Manejo de stock
            </label>
            <span className="text-[11px] text-slate-400 font-normal ml-1">(bebidas, extras…)</span>
          </div>
          <div className="flex gap-2.5">
            <ToggleBtn active={form.manejoStock} onClick={() => handleManejoStockToggle(true)}>
              ✓ Sí
            </ToggleBtn>
            <ToggleBtn
              active={!form.manejoStock}
              onClick={() => handleManejoStockToggle(false)}
              activeClass="bg-slate-700 text-white border-slate-700 shadow-md"
            >
              ○ No
            </ToggleBtn>
          </div>
        </div>

        {/* Stock actual — solo si manejoStock */}
        {form.manejoStock && (
          <Field
            label="Stock actual"
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
              onChange={(e) => handleNumericChange("stockActual", e.target.value, setStockDisplay)}
              onBlur={() => handleNumericBlur("stockActual", stockDisplay, setStockDisplay)}
              autoComplete="off"
              disabled={loading}
              className={inputCls(Boolean(touched.stockActual && errors.stockActual))}
            />
          </Field>
        )}

        {/* Estado */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-0.5">
            Estado
          </label>
          <div className="grid grid-cols-2 gap-2.5">
            {(["ACTIVO", "INACTIVO"] as Estado[]).map((e) => (
              <ToggleBtn
                key={e}
                active={form.estado === e}
                onClick={() => setForm({ ...form, estado: e })}
                activeClass={
                  e === "ACTIVO"
                    ? "bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/20"
                    : "bg-slate-700 text-white border-slate-700 shadow-md"
                }
              >
                {e === "ACTIVO" ? "✓ Activo" : "○ Inactivo"}
              </ToggleBtn>
            ))}
          </div>
        </div>

        <ModalFooter
          onClose={onClose}
          loading={loading}
          saved={saved}
          labelSubmit={isEditing ? "Guardar cambios" : "Crear producto"}
        />
      </form>
    </BaseModal>
  );
}
// src/pages/dashboard/recetas/components/RecetaModal.tsx

import { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  Sparkles,
  AlertCircle,
  Plus,
  Trash2,
  FlaskConical,
  Search,
  X,
  ChevronDown,
} from "lucide-react";
import { BaseModal } from "../../../components/ui/modal/BaseModal";
import { ModalFooter } from "../../../components/ui/modal/ModalFooter";
import type { RecetaCreateDTO, RecetaDetalleDTO } from "../../../types/dtos/RecetaDetalleDTO";
import type { Insumo } from "../../../types/Insusmo";
import type { Producto } from "../../../types/Producto";

/* ════════════════════════════════════════════════════════════════
   Combobox
   ════════════════════════════════════════════════════════════════ */

interface ComboboxItem {
  id: number;
  label: string;
  sublabel?: string;
}

interface ComboboxProps {
  items: ComboboxItem[];
  value: number;
  onChange: (id: number) => void;
  placeholder?: string;
  disabled?: boolean;
  hasError?: boolean;
  disabledIds?: Set<number>;
}

function Combobox({
  items,
  value,
  onChange,
  placeholder = "Seleccionar...",
  disabled = false,
  hasError = false,
  disabledIds = new Set(),
}: ComboboxProps) {
  const [open, setOpen]   = useState(false);
  const [query, setQuery] = useState("");
  const containerRef      = useRef<HTMLDivElement>(null);
  const searchRef         = useRef<HTMLInputElement>(null);

  const selected = items.find((i) => i.id === value);

  // Cerrar al hacer clic fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false);
        setQuery("");
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // NO auto-focus al abrir — el usuario debe tocar el input manualmente
  // Esto evita que el teclado se abra en móvil al desplegar el dropdown

  const filtered = items.filter((i) =>
    i.label.toLowerCase().includes(query.toLowerCase()) ||
    (i.sublabel?.toLowerCase().includes(query.toLowerCase()) ?? false)
  );

  const handleSelect = (id: number) => {
    if (disabledIds.has(id)) return;
    onChange(id);
    setOpen(false);
    setQuery("");
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange(0);
    setQuery("");
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* ── Trigger ── */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => { if (!disabled) setOpen((o) => !o); }}
        className={`
          w-full flex items-center justify-between gap-2
          px-4 py-3 min-h-[48px] rounded-2xl border-2
          bg-slate-50/80 text-sm font-medium text-left
          focus:outline-none transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${hasError
            ? "border-rose-300"
            : open
            ? "border-cyan-400 bg-white"
            : "border-slate-200 hover:border-slate-300"
          }
        `}
      >
        <span className={`truncate ${selected ? "text-slate-800" : "text-slate-300"}`}>
          {selected ? selected.label : placeholder}
        </span>
        <div className="flex items-center gap-1 flex-shrink-0">
          {selected && !disabled && (
            <span
              onClick={handleClear}
              className="p-0.5 rounded-md hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors"
            >
              <X size={13} />
            </span>
          )}
          {selected?.sublabel && (
            <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-400 hidden sm:inline">
              {selected.sublabel}
            </span>
          )}
          <ChevronDown
            size={14}
            className={`text-slate-400 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          />
        </div>
      </button>

      {/* ── Dropdown ── */}
      {open && (
        <div className="absolute z-50 top-full mt-1.5 left-0 right-0 bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden">
          {/* Buscador — el usuario lo toca si quiere filtrar, no se abre el teclado solo */}
          <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
            <Search size={13} className="text-slate-400 flex-shrink-0" />
            <input
              ref={searchRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar..."
              autoFocus={false}          // ← no abre teclado automáticamente
              autoComplete="off"
              className="flex-1 text-sm text-slate-800 placeholder:text-slate-300 focus:outline-none bg-transparent min-w-0"
            />
            {query && (
              <button
                type="button"
                onMouseDown={(e) => e.preventDefault()} // evita cerrar el dropdown
                onClick={() => setQuery("")}
                className="text-slate-300 hover:text-slate-500 flex-shrink-0"
              >
                <X size={13} />
              </button>
            )}
          </div>

          {/* Lista de opciones */}
          <div className="max-h-52 overflow-y-auto overscroll-contain">
            {filtered.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-5">Sin resultados</p>
            ) : (
              filtered.map((item) => {
                const isDisabled = disabledIds.has(item.id);
                const isSelected = item.id === value;
                return (
                  <button
                    key={item.id}
                    type="button"
                    disabled={isDisabled}
                    onMouseDown={(e) => e.preventDefault()} // evita blur del modal
                    onClick={() => handleSelect(item.id)}
                    className={`
                      w-full text-left px-4 py-3 flex items-center justify-between gap-3
                      transition-colors text-sm border-b border-slate-50 last:border-0
                      ${isSelected
                        ? "bg-cyan-50 text-cyan-700 font-semibold"
                        : isDisabled
                        ? "text-slate-300 cursor-not-allowed bg-slate-50/50"
                        : "text-slate-700 hover:bg-slate-50 active:bg-slate-100"
                      }
                    `}
                  >
                    <span className="truncate">{item.label}</span>
                    {item.sublabel && (
                      <span className={`
                        text-[10px] font-semibold px-1.5 py-0.5 rounded-md flex-shrink-0
                        ${isSelected ? "bg-cyan-100 text-cyan-600" : "bg-slate-100 text-slate-400"}
                      `}>
                        {item.sublabel}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   FilaInsumo — una fila de insumo, layout adaptado para móvil
   ════════════════════════════════════════════════════════════════ */

interface FilaInsumoProps {
  index: number;
  fila: RecetaDetalleDTO;
  insumosItems: ComboboxItem[];
  usedIds: Set<number>;
  error?: string;
  loading: boolean;
  canRemove: boolean;
  onInsumoChange: (index: number, id: number) => void;
  onCantidadChange: (index: number, raw: string) => void;
  onRemove: (index: number) => void;
}

function FilaInsumo({
  index,
  fila,
  insumosItems,
  usedIds,
  error,
  loading,
  canRemove,
  onInsumoChange,
  onCantidadChange,
  onRemove,
}: FilaInsumoProps) {
  const insumoSeleccionado = insumosItems.find((i) => i.id === fila.idInsumo);

  return (
    <div className={`rounded-2xl border-2 p-3 transition-colors ${error ? "border-rose-200 bg-rose-50/30" : "border-slate-100 bg-slate-50/50"}`}>
      {/* Fila superior: número + nombre del insumo seleccionado (resumen en móvil) */}
      <div className="flex items-center gap-2 mb-2.5">
        <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-slate-400 text-[10px] font-bold flex items-center justify-center flex-shrink-0 shadow-sm">
          {index + 1}
        </span>
        {insumoSeleccionado ? (
          <span className="text-xs font-semibold text-slate-600 truncate flex-1">
            {insumoSeleccionado.label}
            {insumoSeleccionado.sublabel && (
              <span className="ml-1.5 text-[10px] font-medium text-slate-400">
                ({insumoSeleccionado.sublabel})
              </span>
            )}
          </span>
        ) : (
          <span className="text-xs text-slate-400 flex-1">Sin seleccionar</span>
        )}
        {/* Botón eliminar — siempre visible en la esquina */}
        <button
          type="button"
          disabled={loading || !canRemove}
          onClick={() => onRemove(index)}
          className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-300 hover:text-rose-400 hover:bg-rose-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed flex-shrink-0"
        >
          <Trash2 size={13} />
        </button>
      </div>

      {/* Fila inferior: combobox + cantidad */}
      <div className="flex items-center gap-2">
        {/* Combobox ocupa todo el espacio disponible */}
        <div className="flex-1 min-w-0">
          <Combobox
            items={insumosItems}
            value={fila.idInsumo}
            onChange={(id) => onInsumoChange(index, id)}
            placeholder="Seleccionar insumo..."
            disabled={loading}
            hasError={Boolean(error)}
            disabledIds={usedIds}
          />
        </div>

        {/* Cantidad — ancho fijo y compacto */}
        <div className="flex flex-col gap-1 flex-shrink-0">
          <input
            type="text"
            inputMode="decimal"
            pattern="[0-9]*\.?[0-9]*"
            placeholder="0"
            value={fila.cantidadUsada === 0 ? "" : fila.cantidadUsada}
            onChange={(e) => onCantidadChange(index, e.target.value)}
            disabled={loading}
            autoComplete="off"
            className={`
              w-16 sm:w-20 px-2 py-3 min-h-[48px]
              rounded-2xl border-2 bg-white
              text-sm font-bold text-slate-800 text-center
              focus:outline-none transition-all duration-200
              disabled:opacity-50
              ${error
                ? "border-rose-300 focus:border-rose-400"
                : "border-slate-200 focus:border-cyan-400"
              }
            `}
          />
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-1.5 mt-2">
          <AlertCircle size={11} className="text-rose-400 flex-shrink-0" />
          <p className="text-[11px] text-rose-500 font-medium">{error}</p>
        </div>
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   RecetaModal
   ════════════════════════════════════════════════════════════════ */

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (dto: RecetaCreateDTO) => Promise<void>;
  productos: Producto[];
  insumos: Insumo[];
  editingIdProducto?: number | null;
  initialDetalles?: RecetaDetalleDTO[];
}

const EMPTY_FILA: RecetaDetalleDTO = { idInsumo: 0, cantidadUsada: 1 };

export default function RecetaModal({
  open,
  onClose,
  onSave,
  productos,
  insumos,
  editingIdProducto,
  initialDetalles,
}: Props) {
  const isEditing = !!editingIdProducto;

  const [idProducto, setIdProducto]       = useState<number>(0);
  const [filas, setFilas]                 = useState<RecetaDetalleDTO[]>([{ ...EMPTY_FILA }]);
  const [serverError, setServerError]     = useState<string | null>(null);
  const [loading, setLoading]             = useState(false);
  const [saved, setSaved]                 = useState(false);
  const [filaErrors, setFilaErrors]       = useState<(string | undefined)[]>([]);
  const [productoError, setProductoError] = useState<string | undefined>();

  useEffect(() => {
    if (open) {
      setIdProducto(editingIdProducto ?? 0);
      setFilas(
        initialDetalles && initialDetalles.length > 0
          ? initialDetalles.map((d) => ({ ...d }))
          : [{ ...EMPTY_FILA }]
      );
      setFilaErrors([]);
      setProductoError(undefined);
      setServerError(null);
      setLoading(false);
      setSaved(false);
    }
  }, [open]);

  /* ── Validación ── */

  function validateAll(): boolean {
    let ok = true;

    if (!isEditing && idProducto === 0) {
      setProductoError("Debes seleccionar un producto.");
      ok = false;
    } else {
      setProductoError(undefined);
    }

    const newFilaErrors = filas.map((fila, i) => {
      if (fila.idInsumo === 0) return "Selecciona un insumo.";
      if (fila.cantidadUsada <= 0) return "La cantidad debe ser mayor a 0.";
      const dup = filas.findIndex((f, j) => j !== i && f.idInsumo === fila.idInsumo);
      if (dup !== -1) return "Insumo repetido.";
      return undefined;
    });
    setFilaErrors(newFilaErrors);
    if (newFilaErrors.some(Boolean)) ok = false;

    return ok;
  }

  /* ── Handlers ── */

  const handleInsumoChange = (index: number, idInsumo: number) => {
    setFilas((prev) => { const c = [...prev]; c[index] = { ...c[index], idInsumo }; return c; });
    setFilaErrors((prev) => { const c = [...prev]; c[index] = undefined; return c; });
    setServerError(null);
  };

  const handleCantidadChange = (index: number, raw: string) => {
    const clean = raw.replace(/[^0-9.]/g, "");
    const val   = clean === "" ? 0 : parseFloat(clean);
    setFilas((prev) => { const c = [...prev]; c[index] = { ...c[index], cantidadUsada: isNaN(val) ? 0 : val }; return c; });
    setFilaErrors((prev) => { const c = [...prev]; c[index] = undefined; return c; });
  };

  const addFila    = () => { setFilas((p) => [...p, { ...EMPTY_FILA }]); setFilaErrors((p) => [...p, undefined]); };
  const removeFila = (i: number) => {
    if (filas.length === 1) return;
    setFilas((p) => p.filter((_, j) => j !== i));
    setFilaErrors((p) => p.filter((_, j) => j !== i));
  };

  /* ── Submit ── */

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    const dto: RecetaCreateDTO = {
      idProducto: isEditing ? editingIdProducto! : idProducto,
      detalles: filas,
    };

    try {
      setLoading(true);
      setServerError(null);
      await onSave(dto);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 900);
    } catch (error: any) {
      const raw: string =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        error?.message ||
        "Ocurrió un error inesperado.";
      setServerError(raw);
    } finally {
      setLoading(false);
    }
  };

  /* ── Items para comboboxes ── */

  const productosItems: ComboboxItem[] = productos.map((p) => ({
    id: p.idProducto,
    label: p.nombre,
    sublabel: p.tipoProducto,
  }));

  const insumosItems: ComboboxItem[] = insumos.map((i) => ({
    id: i.idInsumo,
    label: i.nombre,
    sublabel: i.unidadMedida,
  }));

  const usedIds = (currentIndex: number) =>
    new Set(filas.map((f, i) => (i !== currentIndex ? f.idInsumo : 0)).filter(Boolean));

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      loading={loading}
      icon={<BookOpen size={20} className="text-white" strokeWidth={2.2} />}
      title={isEditing ? "Editar Receta" : "Nueva Receta"}
      subtitle={isEditing ? "Modifica los insumos de la receta" : "Asigna insumos a un producto"}
      badge={
        isEditing ? (
          <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
            <Sparkles size={9} className="text-white" />
          </div>
        ) : undefined
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">

        {/* Error servidor */}
        {serverError && (
          <div className="flex items-start gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600">
            <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
            <span className="font-medium">{serverError}</span>
          </div>
        )}

        {/* Selector de producto — solo en creación */}
        {!isEditing && (
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest pl-0.5">
              Producto
            </label>
            <Combobox
              items={productosItems}
              value={idProducto}
              onChange={(id) => { setIdProducto(id); setProductoError(undefined); setServerError(null); }}
              placeholder="Seleccionar producto..."
              disabled={loading}
              hasError={Boolean(productoError)}
            />
            {productoError && (
              <div className="flex items-center gap-1.5">
                <AlertCircle size={11} className="text-rose-400 flex-shrink-0" />
                <p className="text-[11px] text-rose-500 font-medium">{productoError}</p>
              </div>
            )}
          </div>
        )}

        {/* Filas de insumos */}
        <div className="flex flex-col gap-3">
          {/* Header filas */}
          <div className="flex items-center justify-between pl-0.5">
            <div className="flex items-center gap-2">
              <FlaskConical size={13} className="text-slate-400" />
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-widest">
                Insumos
              </label>
              <span className="text-[11px] text-slate-400">
                ({filas.length} {filas.length === 1 ? "ingrediente" : "ingredientes"})
              </span>
            </div>
            <button
              type="button"
              disabled={loading}
              onClick={addFila}
              className="flex items-center gap-1.5 text-xs font-semibold text-cyan-600 hover:text-cyan-700 bg-cyan-50 hover:bg-cyan-100 px-3 py-1.5 rounded-xl transition-colors disabled:opacity-50"
            >
              <Plus size={13} />
              Agregar
            </button>
          </div>

          {/* Lista de filas */}
          <div className="flex flex-col gap-2.5">
            {filas.map((fila, index) => (
              <FilaInsumo
                key={index}
                index={index}
                fila={fila}
                insumosItems={insumosItems}
                usedIds={usedIds(index)}
                error={filaErrors[index]}
                loading={loading}
                canRemove={filas.length > 1}
                onInsumoChange={handleInsumoChange}
                onCantidadChange={handleCantidadChange}
                onRemove={removeFila}
              />
            ))}
          </div>
        </div>

        <ModalFooter
          onClose={onClose}
          loading={loading}
          saved={saved}
          labelSubmit={isEditing ? "Guardar cambios" : "Crear receta"}
        />
      </form>
    </BaseModal>
  );
}
// src/pages/dashboard/pedidos/components/PedidoModal.tsx

import { useState, useEffect, useRef } from "react";
import {
  ShoppingBag,
  Sparkles,
  Plus,
  Minus,
  Trash2,
  Search,
  X,
  UtensilsCrossed,
  MessageSquare,
  CheckCircle2,
  Ban,
} from "lucide-react";
import { BaseModal } from "../../../components/ui/modal/BaseModal";
import { ModalFooter } from "../../../components/ui/modal/ModalFooter";
import type { PedidoCreateDTO, PedidoDetalleDTO } from "../../../types/dtos/Pedidodto";
import type { Producto } from "../../../types/Producto";
import type { Mesa } from "../../../types/Mesa";
import type { Pedido } from "../../../types/Pedido";

/* ─── Tipos internos ──────────────────────────────────────────── */

interface FilaProducto extends PedidoDetalleDTO {
  nombreProducto: string;
  precio: number;
}

const TIPO_COLOR: Record<string, { bg: string; text: string }> = {
  PLATO:             { bg: "bg-orange-100", text: "text-orange-700" },
  BEBIDA_ENVASADA:   { bg: "bg-blue-100",   text: "text-blue-700"   },
  BEBIDA_PREPARADA:  { bg: "bg-cyan-100",   text: "text-cyan-700"   },
  GUARNICION:        { bg: "bg-yellow-100", text: "text-yellow-700" },
  EXTRA:             { bg: "bg-pink-100",   text: "text-pink-700"   },
  OTRO:              { bg: "bg-gray-100",   text: "text-gray-600"   },
};

const FILA_COLOR: Record<string, string> = {
  PLATO:            "bg-orange-50  border-orange-100",
  BEBIDA_ENVASADA:  "bg-blue-50    border-blue-100",
  BEBIDA_PREPARADA: "bg-cyan-50    border-cyan-100",
  GUARNICION:       "bg-yellow-50  border-yellow-100",
  EXTRA:            "bg-pink-50    border-pink-100",
  OTRO:             "bg-gray-50    border-gray-100",
};

/* ════════════════════════════════════════════════════════════════
   ProductoDetalle — panel flotante con info del producto
   ════════════════════════════════════════════════════════════════ */

interface ProductoDetalleProps {
  producto: Producto | null;
  onClose: () => void;
}

function ProductoDetalle({ producto, onClose }: ProductoDetalleProps) {
  if (!producto) return null;

  const tc = TIPO_COLOR[producto.tipoProducto] ?? TIPO_COLOR.OTRO;

  return (
    <>
      {/* Overlay transparente para cerrar al hacer click afuera */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Panel de detalle */}
      <div className="
        absolute left-0 right-0 z-50
        top-full mt-2
        bg-white border border-slate-200 rounded-2xl shadow-2xl
        p-4 flex flex-col gap-3
      ">
        {/* Header */}
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full flex-shrink-0 ${tc.bg} ${tc.text}`}>
              {producto.tipoProducto}
            </span>
            <span className="text-sm font-bold text-slate-800 truncate">
              {producto.nombre}
            </span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center flex-shrink-0 transition-colors"
          >
            <X size={13} className="text-slate-500" />
          </button>
        </div>

        {/* Descripción */}
        {producto.descripcion && producto.descripcion.trim() !== "" && (
          <p className="text-xs text-slate-500 leading-relaxed">
            {producto.descripcion}
          </p>
        )}

        {/* Métricas */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 font-medium">Precio</span>
            <span className="text-sm font-bold text-slate-800">S/ {producto.precio.toFixed(2)}</span>
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 font-medium">Stock</span>
            {producto.manejoStock ? (
              <span className={`text-sm font-bold ${
                (producto.stockActual ?? 0) > 5
                  ? "text-green-600"
                  : (producto.stockActual ?? 0) > 0
                  ? "text-amber-500"
                  : "text-rose-500"
              }`}>
                {producto.stockActual ?? 0} und.
              </span>
            ) : (
              <span className="text-sm font-bold text-slate-400">—</span>
            )}
          </div>

          <div className="bg-slate-50 rounded-xl p-2.5 flex flex-col gap-0.5">
            <span className="text-[10px] text-slate-400 font-medium">Cocina</span>
            <span className={`text-sm font-bold ${producto.imprimeCocina ? "text-cyan-600" : "text-slate-400"}`}>
              {producto.imprimeCocina ? "Sí" : "No"}
            </span>
          </div>
        </div>
      </div>
    </>
  );
}

/* ════════════════════════════════════════════════════════════════
   BuscadorProductos
   ════════════════════════════════════════════════════════════════ */

interface BuscadorProductosProps {
  productos: Producto[];
  filasActuales: FilaProducto[];
  onAgregar: (producto: Producto) => void;
  disabled: boolean;
}

function BuscadorProductos({ productos, filasActuales, onAgregar, disabled }: BuscadorProductosProps) {
  const [query, setQuery]                     = useState("");
  const [filtroTipo, setFiltroTipo]           = useState<string | null>(null);
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const activos = productos.filter((p) => p.estado === "ACTIVO");
  const tipos   = Array.from(new Set(activos.map((p) => p.tipoProducto)));
  const idsAgregados = new Set(filasActuales.map((f) => f.idProducto));

  const filtered = activos
    .filter((p) => !filtroTipo || p.tipoProducto === filtroTipo)
    .filter((p) =>
      !query || `${p.nombre} ${p.tipoProducto}`.toLowerCase().includes(query.toLowerCase())
    );

  const toggleDetalle = (p: Producto) => {
    setProductoDetalle((prev) => (prev?.idProducto === p.idProducto ? null : p));
  };

  return (
    <div className="rounded-2xl bg-slate-50 border border-slate-200 relative" style={{ overflow: "visible" }}>

      {/* Barra de búsqueda */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-white border-b border-slate-200 rounded-t-2xl">
        <Search size={14} className="text-slate-400 flex-shrink-0" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Buscar producto..."
          autoComplete="off"
          disabled={disabled}
          className="flex-1 text-sm bg-transparent placeholder:text-slate-300 focus:outline-none text-slate-800 disabled:opacity-50"
        />
        {query && (
          <button type="button" onClick={() => setQuery("")} className="text-slate-300 hover:text-slate-500">
            <X size={13} />
          </button>
        )}
      </div>

      {/* Chips de categoría */}
      {tipos.length > 1 && (
        <div className="flex gap-1.5 px-3 py-2 bg-white border-b border-slate-100 overflow-x-auto scrollbar-none">
          <button
            type="button"
            onClick={() => setFiltroTipo(null)}
            className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
              !filtroTipo
                ? "bg-slate-800 text-white border-slate-800"
                : "bg-white text-slate-500 border-slate-200 hover:border-slate-400"
            }`}
          >
            Todos
          </button>
          {tipos.map((tipo) => {
            const tc = TIPO_COLOR[tipo] ?? TIPO_COLOR.OTRO;
            return (
              <button
                key={tipo}
                type="button"
                onClick={() => setFiltroTipo(filtroTipo === tipo ? null : tipo)}
                className={`flex-shrink-0 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all ${
                  filtroTipo === tipo
                    ? `${tc.bg} ${tc.text} border-transparent`
                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                }`}
              >
                {tipo}
              </button>
            );
          })}
        </div>
      )}

      {/* Lista de productos */}
      <div className="max-h-44 overflow-y-auto overscroll-contain rounded-b-2xl">
        {filtered.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-5">Sin resultados</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {filtered.map((p) => {
              const yaAgregado = idsAgregados.has(p.idProducto);
              const tc = TIPO_COLOR[p.tipoProducto] ?? TIPO_COLOR.OTRO;
              const esteAbierto = productoDetalle?.idProducto === p.idProducto;

              return (
                <div
                  key={p.idProducto}
                  className={`flex items-center gap-2 px-3 py-2.5 transition-colors ${
                    yaAgregado ? "bg-cyan-50" : "bg-white hover:bg-slate-50"
                  }`}
                >
                  {/* Zona clickeable para agregar */}
                  <button
                    type="button"
                    disabled={disabled || yaAgregado}
                    onClick={() => { if (!yaAgregado) onAgregar(p); }}
                    className="flex items-center gap-2.5 flex-1 min-w-0 text-left disabled:cursor-default"
                  >
                    <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md flex-shrink-0 ${tc.bg} ${tc.text}`}>
                      {p.tipoProducto}
                    </span>
                    <span className={`font-medium truncate text-sm ${yaAgregado ? "text-cyan-600" : "text-slate-700"}`}>
                      {p.nombre}
                    </span>
                  </button>

                  {/* Precio + botón info + botón agregar */}
                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <span className="text-xs font-bold text-slate-600">S/ {p.precio.toFixed(2)}</span>

                    {/* Botón de detalle */}
                    <button
                      type="button"
                      onClick={() => toggleDetalle(p)}
                      title="Ver detalle"
                      className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-bold leading-none transition-colors ${
                        esteAbierto
                          ? "bg-slate-800 border-slate-800 text-white"
                          : "bg-white border-slate-300 text-slate-400 hover:border-slate-500 hover:text-slate-600"
                      }`}
                    >
                      i
                    </button>

                    {/* Botón agregar / check */}
                    {yaAgregado ? (
                      <CheckCircle2 size={16} className="text-cyan-500" />
                    ) : (
                      <button
                        type="button"
                        disabled={disabled}
                        onClick={() => onAgregar(p)}
                        className="w-6 h-6 rounded-full bg-cyan-500 flex items-center justify-center shadow-sm shadow-cyan-500/30 disabled:opacity-50 transition-opacity"
                      >
                        <Plus size={12} className="text-white" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Panel de detalle flotante */}
      <ProductoDetalle
        producto={productoDetalle}
        onClose={() => setProductoDetalle(null)}
      />
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   FilaPedido
   ════════════════════════════════════════════════════════════════ */

interface FilaPedidoProps {
  fila: FilaProducto;
  tipoProducto?: string;
  onCantidadChange: (delta: number) => void;
  onObservacionChange: (val: string) => void;
  onRemove: () => void;
  disabled: boolean;
}

function FilaPedido({ fila, tipoProducto = "OTRO", onCantidadChange, onObservacionChange, onRemove, disabled }: FilaPedidoProps) {
  const [showObs, setShowObs] = useState(() => !!(fila.observacion && fila.observacion.trim() !== ""));
  const colorFila = FILA_COLOR[tipoProducto] ?? FILA_COLOR.OTRO;

  useEffect(() => {
    if (fila.observacion && fila.observacion.trim() !== "") {
      setShowObs(true);
    }
  }, [fila.observacion]);

  return (
    <div className={`rounded-2xl border p-3 flex flex-col gap-2 ${colorFila}`}>
      {/* Fila superior */}
      <div className="flex items-center justify-between gap-2">
        <span className="text-sm font-semibold text-slate-800 truncate flex-1">
          {fila.nombreProducto}
        </span>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="text-sm font-bold text-slate-700">
            S/ {(fila.precio * fila.cantidad).toFixed(2)}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={onRemove}
            className="w-6 h-6 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-100 flex items-center justify-center transition-colors disabled:opacity-30"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      {/* Fila inferior */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-0.5 bg-white rounded-xl border border-white/80 shadow-sm overflow-hidden">
          <button
            type="button"
            disabled={disabled || fila.cantidad <= 1}
            onClick={() => onCantidadChange(-1)}
            className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
          >
            <Minus size={13} />
          </button>
          <span className="w-8 text-center text-sm font-bold text-slate-800 tabular-nums select-none">
            {fila.cantidad}
          </span>
          <button
            type="button"
            disabled={disabled}
            onClick={() => onCantidadChange(+1)}
            className="w-9 h-9 flex items-center justify-center text-slate-500 hover:bg-slate-50 active:bg-slate-100 transition-colors disabled:opacity-30"
          >
            <Plus size={13} />
          </button>
        </div>

        <span className="text-xs text-slate-400 flex-1">
          S/ {fila.precio.toFixed(2)} c/u
        </span>

        <button
          type="button"
          disabled={disabled}
          onClick={() => setShowObs((v) => !v)}
          className={`flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg transition-colors disabled:opacity-50 font-medium ${
            showObs || (fila.observacion && fila.observacion.trim() !== "")
              ? "bg-amber-400 text-white shadow-sm shadow-amber-400/30"
              : "bg-white text-slate-400 hover:text-slate-600 border border-slate-200"
          }`}
        >
          <MessageSquare size={11} />
          {showObs ? "Nota ✓" : "Nota"}
        </button>
      </div>

      {showObs && (
        <input
          type="text"
          placeholder="Ej: Sin cebolla, extra limón..."
          value={fila.observacion ?? ""}
          onChange={(e) => onObservacionChange(e.target.value)}
          disabled={disabled}
          autoComplete="off"
          maxLength={100}
          className="w-full px-3 py-2 text-xs bg-white/80 border border-amber-200 rounded-xl focus:outline-none focus:border-amber-400 transition-all disabled:opacity-50 placeholder:text-slate-300"
        />
      )}
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   PedidoModal
   ════════════════════════════════════════════════════════════════ */

interface Props {
  open: boolean;
  onClose: () => void;
  onSave: (dto: PedidoCreateDTO) => Promise<void>;
  onCancelar?: (idPedido: number) => Promise<void>;
  onError?: (message: string) => void;
  productos: Producto[];
  mesas: Mesa[];
  idMesero: number;
  pedidoEditing?: Pedido | null;
  mesaInicial?: Mesa | null;
  llevarInicial?: boolean;
}

export default function PedidoModal({
  open,
  onClose,
  onSave,
  onCancelar,
  onError,
  productos,
  mesas,
  idMesero,
  pedidoEditing,
  mesaInicial,
  llevarInicial = false,
}: Props) {
  const isEditing = !!pedidoEditing;

  const [tipoPedido, setTipoPedido]                 = useState<"MESA" | "LLEVAR">("MESA");
  const [idMesaSeleccionada, setIdMesaSeleccionada] = useState<number | null>(null);
  const [filas, setFilas]                           = useState<FilaProducto[]>([]);
  const [loading, setLoading]                       = useState(false);
  const [saved, setSaved]                           = useState(false);
  const [confirmCancelar, setConfirmCancelar]       = useState(false);
  const [errors, setErrors]                         = useState<{ mesa?: string; productos?: string }>({});

  const pedidoBottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    setErrors({});
    setLoading(false);
    setSaved(false);
    setConfirmCancelar(false);

    if (isEditing && pedidoEditing) {
      setTipoPedido(pedidoEditing.tipoPedido);
      setIdMesaSeleccionada(pedidoEditing.idMesa ?? null);

      const filasEdicion: FilaProducto[] = pedidoEditing.detalles.map((d) => {
        const prod = productos.find(
          (p) => p.nombre.trim().toLowerCase() === d.nombreProducto.trim().toLowerCase()
        );
        return {
          idProducto:     prod?.idProducto ?? -1,
          cantidad:       d.cantidad,
          observacion:    d.observacion ?? "",
          nombreProducto: d.nombreProducto,
          precio:         d.precioUnitario,
        };
      });
      setFilas(filasEdicion);
    } else {
      setTipoPedido(llevarInicial ? "LLEVAR" : "MESA");
      setIdMesaSeleccionada(mesaInicial?.idMesa ?? null);
      setFilas([]);
    }
  }, [open]);

  useEffect(() => {
    if (filas.length > 0) {
      setTimeout(() => {
        pedidoBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 50);
    }
  }, [filas.length]);

  /* ── Mesas disponibles ── */
  const mesasDisponibles = mesas.filter(
    (m) =>
      m.estado === "ACTIVO" &&
      (m.disponibilidadEstado === "LIBRE" || m.idMesa === idMesaSeleccionada)
  );

  /* ── Total ── */
  const total = filas.reduce((acc, f) => acc + f.precio * f.cantidad, 0);

  /* ── Handlers ── */
  const agregarProducto = (p: Producto) => {
    setFilas((prev) => [
      ...prev,
      {
        idProducto:     p.idProducto,
        cantidad:       1,
        observacion:    "",
        nombreProducto: p.nombre,
        precio:         p.precio,
      },
    ]);
    setErrors((e) => ({ ...e, productos: undefined }));
  };

  const cambiarCantidad = (index: number, delta: number) => {
    setFilas((prev) => {
      const copy = [...prev];
      const nueva = copy[index].cantidad + delta;
      if (nueva < 1) return copy;
      copy[index] = { ...copy[index], cantidad: nueva };
      return copy;
    });
  };

  const cambiarObservacion = (index: number, val: string) => {
    setFilas((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], observacion: val };
      return copy;
    });
  };

  const eliminarFila = (index: number) => {
    setFilas((prev) => prev.filter((_, i) => i !== index));
  };

  /* ── Validación ── */
  function validateAll(): boolean {
    const e: typeof errors = {};
    if (tipoPedido === "MESA" && !idMesaSeleccionada) e.mesa = "Selecciona una mesa.";
    if (filas.length === 0) e.productos = "Agrega al menos un producto.";
    const invalidos = filas.filter((f) => f.idProducto <= 0);
    if (invalidos.length > 0) {
      e.productos = `No se encontró el producto: "${invalidos[0].nombreProducto}". Elimínalo y agrégalo de nuevo.`;
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  /* ── Submit ── */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAll()) return;

    const dto: PedidoCreateDTO = {
      idMesero,
      tipoPedido,
      ...(tipoPedido === "MESA" && idMesaSeleccionada ? { idMesa: idMesaSeleccionada } : {}),
      detalles: filas.map((f) => ({
        idProducto:  f.idProducto,
        cantidad:    f.cantidad,
        observacion: f.observacion ?? "",
      })),
    };

    try {
      setLoading(true);
      await onSave(dto);
      setSaved(true);
      setTimeout(() => { setSaved(false); onClose(); }, 900);
    } catch (error: any) {
      const raw: string =
        error?.response?.data?.mensaje ||
        error?.response?.data?.error  ||
        error?.response?.data?.message ||
        error?.message ||
        "Ocurrió un error inesperado.";
      onError?.(raw);
    } finally {
      setLoading(false);
    }
  };

  /* ── Cancelar pedido ── */
  const handleCancelar = async () => {
    if (!pedidoEditing || !onCancelar) return;
    try {
      setLoading(true);
      await onCancelar(pedidoEditing.idPedido);
      onClose();
    } catch (error: any) {
      const raw: string =
        error?.response?.data?.mensaje ||
        error?.response?.data?.error  ||
        error?.message ||
        "Error al cancelar el pedido.";
      onError?.(raw);
    } finally {
      setLoading(false);
      setConfirmCancelar(false);
    }
  };

  const mesaActual = mesas.find((m) => m.idMesa === idMesaSeleccionada);

  return (
    <BaseModal
      open={open}
      onClose={onClose}
      loading={loading}
      icon={
        tipoPedido === "LLEVAR"
          ? <ShoppingBag size={20} className="text-white" strokeWidth={2.2} />
          : <UtensilsCrossed size={20} className="text-white" strokeWidth={2.2} />
      }
      title={
        isEditing
          ? `Pedido #${pedidoEditing?.idPedido}`
          : tipoPedido === "LLEVAR"
          ? "Para llevar"
          : mesaActual
          ? `Mesa ${mesaActual.numeroMesa}`
          : "Nuevo Pedido"
      }
      subtitle={isEditing ? "Modifica los productos del pedido" : "Agrega los productos del pedido"}
      badge={
        isEditing ? (
          <div className="w-4 h-4 bg-amber-400 rounded-full flex items-center justify-center">
            <Sparkles size={9} className="text-white" />
          </div>
        ) : undefined
      }
    >
      <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">

        {/* ── Sección 1: Tipo de pedido ── */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Tipo
          </label>
          <div className="grid grid-cols-2 gap-2">
            {(["MESA", "LLEVAR"] as const).map((tipo) => (
              <button
                key={tipo}
                type="button"
                disabled={loading}
                onClick={() => {
                  setTipoPedido(tipo);
                  if (tipo === "LLEVAR") setIdMesaSeleccionada(null);
                  setErrors((e) => ({ ...e, mesa: undefined }));
                }}
                className={`
                  py-3 text-sm font-bold rounded-2xl border-2
                  transition-all duration-200 disabled:opacity-50
                  ${tipoPedido === tipo
                    ? tipo === "MESA"
                      ? "bg-cyan-500 text-white border-cyan-500 shadow-lg shadow-cyan-500/25"
                      : "bg-orange-500 text-white border-orange-500 shadow-lg shadow-orange-500/25"
                    : "bg-slate-50 text-slate-500 border-slate-200 hover:border-slate-300"
                  }
                `}
              >
                {tipo === "MESA" ? "🍽 Mesa" : "🛍 Para llevar"}
              </button>
            ))}
          </div>
        </div>

        {/* ── Sección 2: Selector de mesa ── */}
        {tipoPedido === "MESA" && (
          <div className="flex flex-col gap-2">
            <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
              Mesa
            </label>
            <div className="bg-slate-50 border border-slate-200 rounded-2xl p-3">
              {mesasDisponibles.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-2">No hay mesas libres.</p>
              ) : (
                <div className="grid grid-cols-5 sm:grid-cols-6 gap-2">
                  {mesasDisponibles.map((mesa) => (
                    <button
                      key={mesa.idMesa}
                      type="button"
                      disabled={loading}
                      onClick={() => {
                        setIdMesaSeleccionada(mesa.idMesa);
                        setErrors((e) => ({ ...e, mesa: undefined }));
                      }}
                      className={`
                        aspect-square rounded-xl border-2 flex flex-col items-center justify-center
                        transition-all duration-150 disabled:opacity-50
                        ${idMesaSeleccionada === mesa.idMesa
                          ? "bg-cyan-500 text-white border-cyan-500 shadow-md shadow-cyan-500/30"
                          : "bg-white text-slate-600 border-slate-200 hover:border-cyan-300 hover:bg-cyan-50"
                        }
                      `}
                    >
                      <span className="text-[9px] font-medium opacity-60 leading-none">Mesa</span>
                      <span className="text-base font-black leading-tight">{mesa.numeroMesa}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
            {errors.mesa && (
              <div className="flex items-center gap-1.5 pl-1">
                <span className="text-[11px] text-rose-500 font-medium">⚠ {errors.mesa}</span>
              </div>
            )}
          </div>
        )}

        {/* ── Sección 3: Catálogo de productos ── */}
        <div className="flex flex-col gap-2">
          <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
            Agregar productos
          </label>
          <BuscadorProductos
            productos={productos}
            filasActuales={filas}
            onAgregar={agregarProducto}
            disabled={loading}
          />
        </div>

        {/* ── Sección 4: Resumen del pedido ── */}
        {filas.length > 0 ? (
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between bg-slate-800 rounded-t-2xl px-4 py-2.5">
              <label className="text-[11px] font-bold text-slate-300 uppercase tracking-widest">
                Pedido · {filas.length} {filas.length === 1 ? "ítem" : "ítems"}
              </label>
              <span className="text-sm font-black text-white">
                S/ {total.toFixed(2)}
              </span>
            </div>

            <div className="flex flex-col gap-2 max-h-60 overflow-y-auto overscroll-contain px-0.5 pb-0.5">
              {filas.map((fila, index) => {
                const prod = productos.find((p) => p.idProducto === fila.idProducto);
                return (
                  <FilaPedido
                    key={`${fila.idProducto}-${index}`}
                    fila={fila}
                    tipoProducto={prod?.tipoProducto ?? "OTRO"}
                    onCantidadChange={(delta) => cambiarCantidad(index, delta)}
                    onObservacionChange={(val) => cambiarObservacion(index, val)}
                    onRemove={() => eliminarFila(index)}
                    disabled={loading}
                  />
                );
              })}
              <div ref={pedidoBottomRef} />
            </div>
          </div>
        ) : (
          <div className={`
            flex flex-col items-center justify-center gap-2 py-6
            rounded-2xl border-2 border-dashed transition-colors
            ${errors.productos ? "border-rose-300 bg-rose-50/50" : "border-slate-200 bg-slate-50/50"}
          `}>
            <UtensilsCrossed size={22} className={errors.productos ? "text-rose-300" : "text-slate-300"} />
            <p className={`text-xs font-medium ${errors.productos ? "text-rose-400" : "text-slate-400"}`}>
              {errors.productos ?? "Aún no hay productos en el pedido"}
            </p>
          </div>
        )}

        {/* ── Botón cancelar pedido (solo en edición) ── */}
        {isEditing && onCancelar && (
          <div className="pt-1">
            {!confirmCancelar ? (
              <button
                type="button"
                disabled={loading}
                onClick={() => setConfirmCancelar(true)}
                className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-rose-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl border border-dashed border-rose-200 hover:border-rose-300 transition-all disabled:opacity-40"
              >
                <Ban size={13} />
                Cancelar pedido
              </button>
            ) : (
              <div className="flex flex-col gap-2 bg-rose-50 border border-rose-200 rounded-2xl p-3">
                <p className="text-xs text-rose-600 font-semibold text-center">
                  ¿Confirmas cancelar el pedido #{pedidoEditing?.idPedido}?
                </p>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => setConfirmCancelar(false)}
                    className="flex-1 py-2 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors"
                  >
                    No, volver
                  </button>
                  <button
                    type="button"
                    disabled={loading}
                    onClick={handleCancelar}
                    className="flex-1 py-2 text-xs font-bold text-white bg-rose-500 rounded-xl hover:bg-rose-600 transition-colors disabled:opacity-50 flex items-center justify-center gap-1"
                  >
                    {loading ? "Cancelando..." : "Sí, cancelar"}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        <ModalFooter
          onClose={onClose}
          loading={loading}
          saved={saved}
          labelSubmit={isEditing ? "Guardar cambios" : "Confirmar pedido"}
        />
      </form>
    </BaseModal>
  );
}
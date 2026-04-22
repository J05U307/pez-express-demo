// src/pages/dashboard/Pedidos.tsx

import { useEffect, useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  Plus,
  Pencil,
  UtensilsCrossed,
  Clock,
  Receipt,
  DollarSign,
  X,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Info,
} from "lucide-react";
import { getMesas } from "../../services/mesaService";
import { useAuth } from "../../context/AuthContext";
import { getPedidosAbiertosHoy, createPedido, updatePedido, cancelarPedido } from "../../services/pedidoService";
import { getProductos } from "../../services/productoService";
import type { Mesa } from "../../types/Mesa";
import type { Pedido } from "../../types/Pedido";
import type { Producto } from "../../types/Producto";
import type { PedidoCreateDTO } from "../../types/dtos/Pedidodto";
import PedidoModal from "./components/PedidoModal";
import { PageContent } from "../../components/ui/pages/Pagecontent";

/* ─── Toast system ────────────────────────────────────────────── */

type ToastType = "error" | "success" | "warning" | "info";

interface Toast {
  id: number;
  message: string;
  title?: string;
  type: ToastType;
}

let _toastId = 0;

const TOAST_CONFIG: Record<ToastType, {
  bg: string; border: string; text: string; sub: string; iconClass: string;
  Icon: React.FC<{ size?: number; className?: string }>;
}> = {
  error:   { bg: "#FEF2F2", border: "#FECACA", text: "#7F1D1D", sub: "#991B1B", iconClass: "#EF4444", Icon: AlertCircle    },
  success: { bg: "#F0FDF4", border: "#86EFAC", text: "#14532D", sub: "#166534", iconClass: "#22C55E", Icon: CheckCircle2   },
  warning: { bg: "#FFFBEB", border: "#FCD34D", text: "#78350F", sub: "#92400E", iconClass: "#F59E0B", Icon: AlertTriangle  },
  info:    { bg: "#EFF6FF", border: "#93C5FD", text: "#1E3A8A", sub: "#1D4ED8", iconClass: "#3B82F6", Icon: Info           },
};

function ToastContainer({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: number) => void }) {
  if (toasts.length === 0) return null;
  return (
    <>
      <style>{`
        @keyframes toastIn {
          0%   { opacity: 0; transform: translateY(-18px) scale(0.93); }
          65%  { opacity: 1; transform: translateY(3px)   scale(1.01); }
          100% { opacity: 1; transform: translateY(0)     scale(1);    }
        }
        @keyframes toastOut {
          0%   { opacity: 1; transform: translateY(0)     scale(1);    max-height: 80px; margin-bottom: 0; }
          100% { opacity: 0; transform: translateY(-12px) scale(0.94); max-height: 0;   margin-bottom: -10px; }
        }
        @keyframes toastBar {
          from { width: 100%; }
          to   { width: 0%; }
        }
        .toast-in  { animation: toastIn  0.42s cubic-bezier(0.22,1,0.36,1) forwards; }
        .toast-out { animation: toastOut 0.30s cubic-bezier(0.4,0,1,1)     forwards; }
        .toast-bar { animation: toastBar 5s linear forwards; }
        .toast-x:hover { opacity: 1 !important; transform: scale(1.2) rotate(90deg) !important; }
        .toast-x { transition: opacity 0.15s, transform 0.2s !important; }
      `}</style>

      <div style={{
        position: "fixed",
        top: "1.25rem",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        gap: "10px",
        width: "min(440px, calc(100vw - 2rem))",
        pointerEvents: "none",
      }}>
        {toasts.map((t) => {
          const c = TOAST_CONFIG[t.type];
          const Icon = c.Icon;
          return (
            <div
              key={t.id}
              className="toast-in"
              style={{
                position: "relative",
                width: "100%",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 14px 15px 14px",
                borderRadius: "18px",
                border: `1.5px solid ${c.border}`,
                background: c.bg,
                boxShadow: `0 12px 40px rgba(0,0,0,0.13), 0 2px 8px rgba(0,0,0,0.07)`,
                pointerEvents: "auto",
                overflow: "hidden",
              }}
            >
              {/* Icono con fondo */}
              <div style={{
                flexShrink: 0,
                width: "36px",
                height: "36px",
                borderRadius: "11px",
                background: `${c.iconClass}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}>
                <span style={{ color: c.iconClass, display: "flex" }}>
                  <Icon size={17} />
                </span>
              </div>

              {/* Texto */}
              <div style={{ flex: 1, minWidth: 0 }}>
                {t.title && (
                  <p style={{
                    fontSize: "13px",
                    fontWeight: 700,
                    color: c.text,
                    margin: "0 0 1px",
                    letterSpacing: "-0.01em",
                  }}>
                    {t.title}
                  </p>
                )}
                <p style={{
                  fontSize: "12px",
                  color: c.sub,
                  margin: 0,
                  lineHeight: 1.5,
                }}>
                  {t.message}
                </p>
              </div>

              {/* Botón cerrar */}
              <button
                onClick={() => onRemove(t.id)}
                className="toast-x"
                style={{
                  flexShrink: 0,
                  background: `${c.iconClass}18`,
                  border: "none",
                  cursor: "pointer",
                  color: c.iconClass,
                  width: "26px",
                  height: "26px",
                  borderRadius: "8px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  opacity: 0.7,
                  padding: 0,
                }}
              >
                <X size={13} />
              </button>

              {/* Barra de progreso */}
              <div
                className="toast-bar"
                style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  height: "3px",
                  borderRadius: "0 0 18px 18px",
                  background: `${c.iconClass}80`,
                }}
              />
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────── */

function formatHora(fechaStr: string) {
  return new Date(fechaStr).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

/* ─── Componente ──────────────────────────────────────────────── */

export default function Pedidos() {
  const navigate = useNavigate();
  const { usuario } = useAuth();

  const idMesero = usuario?.id ?? 0;

  const [mesas, setMesas]           = useState<Mesa[]>([]);
  const [pedidos, setPedidos]       = useState<Pedido[]>([]);
  const [productos, setProductos]   = useState<Producto[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const [modalOpen, setModalOpen]         = useState(false);
  const [mesaInicial, setMesaInicial]     = useState<Mesa | null>(null);
  const [llevarInicial, setLlevarInicial] = useState(false);
  const [pedidoEditing, setPedidoEditing] = useState<Pedido | null>(null);

  /* ── Toast state ── */
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((message: string, type: ToastType = "error", title?: string) => {
    const id = ++_toastId;
    setToasts((prev) => [...prev, { id, message, type, title }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5000);
  }, []);

  const removeToast = useCallback((id: number) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  /* ── Carga inicial ── */
  const fetchAll = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const [m, p, prods] = await Promise.all([
        getMesas(),
        getPedidosAbiertosHoy(),
        getProductos(),
      ]);
      setMesas(m);
      setPedidos(p);
      setProductos(prods);
    } catch {
      setFetchError("No se pudieron cargar los datos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  const refetchPedidosYMesas = async () => {
    const [m, p] = await Promise.all([getMesas(), getPedidosAbiertosHoy()]);
    setMesas(m);
    setPedidos(p);
  };

  useEffect(() => { fetchAll(); }, []);

  /* ── Abrir modal ── */
  const abrirParaMesa = (mesa: Mesa) => {
    setPedidoEditing(null);
    setMesaInicial(mesa);
    setLlevarInicial(false);
    setModalOpen(true);
  };

  const abrirParaLlevar = () => {
    setPedidoEditing(null);
    setMesaInicial(null);
    setLlevarInicial(true);
    setModalOpen(true);
  };

  const abrirEditar = (pedido: Pedido) => {
    setPedidoEditing(pedido);
    setMesaInicial(null);
    setLlevarInicial(false);
    setModalOpen(true);
  };

  /* ── Ir a cobrar ── */
  const irACobrar = (pedido: Pedido) => {
    navigate("/dashboard/pagos", { state: { pedido } });
  };

  /* ── Guardar ── */
  const handleSave = async (dto: PedidoCreateDTO): Promise<void> => {
    if (pedidoEditing) {
      await updatePedido(pedidoEditing.idPedido, dto);
      addToast("Los cambios del pedido fueron guardados.", "success", "Pedido actualizado");
    } else {
      await createPedido(dto);
      addToast("El pedido fue registrado correctamente.", "success", "Pedido creado");
    }
    await refetchPedidosYMesas();
  };

  /* ── Cancelar ── */
  const handleCancelar = async (idPedido: number): Promise<void> => {
    await cancelarPedido(idPedido);
    await refetchPedidosYMesas();
    addToast(`El pedido #${idPedido} fue cancelado.`, "warning", "Pedido cancelado");
  };

  /* ── Toast de error desde el modal ── */
  const handleModalError = useCallback((message: string) => {
    addToast(message, "error", "Error");
  }, [addToast]);

  /* ── Derived ── */
  const mesasActivas    = mesas.filter((m) => m.estado === "ACTIVO");
  const pedidosAbiertos = pedidos.filter((p) => p.estadoPedido === "ABIERTO");
  const pedidosLlevar   = pedidosAbiertos.filter((p) => p.tipoPedido === "LLEVAR");

  const pedidoPorMesa = new Map<number, Pedido>(
    pedidosAbiertos
      .filter((p) => p.idMesa !== null)
      .map((p) => [p.idMesa!, p])
  );

  return (
    <div className="text-gray-800 pb-8">

      {/* ── Header ── */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Receipt size={24} className="text-cyan-500" />
            Pedidos
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestiona los pedidos de Pez Express
          </p>
        </div>
        <button
          onClick={abrirParaLlevar}
          className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
        >
          <ShoppingBag size={16} />
          <span className="hidden sm:inline">Para llevar</span>
          <span className="sm:hidden">Llevar</span>
        </button>
      </div>

      <PageContent
        loading={loading}
        error={fetchError}
        empty={false}
        emptyMessage=""
        onRetry={fetchAll}
      >
        <>
          {/* ── Grid de mesas ── */}
          <div className="mb-6">
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
              <UtensilsCrossed size={14} className="text-cyan-500" />
              Mesas
            </h2>
            <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 gap-3">
              {mesasActivas.map((mesa) => {
                const pedido = pedidoPorMesa.get(mesa.idMesa);
                const libre  = mesa.disponibilidadEstado === "LIBRE";

                return (
                  <div key={mesa.idMesa} className="flex flex-col gap-1">
                    <button
                      onClick={() => libre ? abrirParaMesa(mesa) : abrirEditar(pedido!)}
                      className={`
                        relative rounded-2xl border-2 p-3 flex flex-col items-center justify-center gap-1
                        min-h-[90px] w-full transition-all duration-200 active:scale-95
                        ${libre
                          ? "bg-white border-gray-200 hover:border-cyan-400 hover:bg-cyan-50 hover:shadow-md text-gray-700"
                          : "bg-orange-50 border-orange-300 hover:border-orange-400 hover:shadow-md text-orange-700"
                        }
                      `}
                    >
                      <span className={`absolute top-2 right-2 w-2 h-2 rounded-full ${libre ? "bg-green-400" : "bg-orange-400"}`} />

                      <span className="text-[10px] font-medium opacity-50">Mesa</span>
                      <span className="text-2xl font-black leading-none">{mesa.numeroMesa}</span>

                      {libre ? (
                        <span className="text-[10px] text-green-600 font-semibold mt-0.5">LIBRE</span>
                      ) : pedido ? (
                        <div className="flex flex-col items-center gap-0.5 mt-0.5">
                          <span className="text-[10px] font-bold text-orange-600">
                            S/ {pedido.total.toFixed(2)}
                          </span>
                          <span className="text-[9px] text-orange-400 flex items-center gap-0.5">
                            <Clock size={8} />
                            {formatHora(pedido.fechaApertura)}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[10px] text-orange-600 font-semibold mt-0.5">OCUPADO</span>
                      )}

                      {libre ? (
                        <Plus size={12} className="text-slate-300 mt-0.5" />
                      ) : (
                        <Pencil size={11} className="text-orange-300 mt-0.5" />
                      )}
                    </button>

                    {!libre && pedido && (
                      <button
                        onClick={() => irACobrar(pedido)}
                        className="w-full flex items-center justify-center gap-1 py-1.5 text-[10px] font-bold text-white bg-cyan-500 hover:bg-cyan-600 active:scale-95 rounded-xl transition-all shadow-sm"
                      >
                        <DollarSign size={10} />
                        Cobrar
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* ── Pedidos para llevar abiertos ── */}
          {pedidosLlevar.length > 0 && (
            <div>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <ShoppingBag size={14} className="text-orange-500" />
                Para llevar ({pedidosLlevar.length})
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {pedidosLlevar.map((pedido) => (
                  <div
                    key={pedido.idPedido}
                    className="bg-white border border-orange-200 rounded-2xl p-4 hover:border-orange-300 hover:shadow-md transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-xl bg-orange-100 flex items-center justify-center">
                          <ShoppingBag size={14} className="text-orange-500" />
                        </div>
                        <div>
                          <p className="text-sm font-bold text-gray-900">Pedido #{pedido.idPedido}</p>
                          <p className="text-[11px] text-gray-400 flex items-center gap-1">
                            <Clock size={9} />
                            {formatHora(pedido.fechaApertura)}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-orange-600">S/ {pedido.total.toFixed(2)}</span>
                        <button
                          onClick={() => abrirEditar(pedido)}
                          className="p-1.5 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition-colors"
                        >
                          <Pencil size={13} />
                        </button>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1">
                      {pedido.detalles.map((d, i) => (
                        <div key={i} className="flex items-center justify-between text-xs text-gray-600 bg-slate-50 px-2.5 py-1.5 rounded-lg">
                          <div className="flex flex-col min-w-0">
                            <span className="font-medium truncate">{d.nombreProducto}</span>
                            {d.observacion && d.observacion.trim() !== "" && (
                              <span className="text-[10px] text-amber-500 truncate">
                                📝 {d.observacion}
                              </span>
                            )}
                          </div>
                          <span className="text-gray-400 flex-shrink-0 ml-2">×{d.cantidad}</span>
                        </div>
                      ))}
                    </div>

                    <button
                      onClick={() => irACobrar(pedido)}
                      className="mt-3 w-full flex items-center justify-center gap-1.5 py-2 text-xs font-bold text-white bg-cyan-500 hover:bg-cyan-600 active:scale-95 rounded-xl transition-all shadow-sm"
                    >
                      <DollarSign size={12} />
                      Cobrar
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      </PageContent>

      <PedidoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        onCancelar={handleCancelar}
        onError={handleModalError}
        productos={productos}
        mesas={mesas}
        idMesero={idMesero}
        pedidoEditing={pedidoEditing}
        mesaInicial={mesaInicial}
        llevarInicial={llevarInicial}
      />

      {/* ── Toasts flotantes ── */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  );
}
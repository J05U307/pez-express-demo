// src/pages/dashboard/Reportes.tsx

import { useEffect, useState, useCallback } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";
import {
  TrendingUp, ShoppingBag, DollarSign, ChevronLeft,
  ChevronRight, Calendar, Package, UtensilsCrossed,
  Receipt, CreditCard, Banknote, RefreshCw, Eye, X,
} from "lucide-react";
import api from "../../services/axios";

/* ─── Types ───────────────────────────────────────────────────── */

interface DetallePedido {
  nombreProducto: string;
  cantidad: number;
  precioUnitario: number;
  subtotal: number;
  observacion: string;
}

interface Pedido {
  idPedido: number;
  fechaApertura: string;
  tipoPedido: "MESA" | "LLEVAR";
  total: number;
  estadoPedido: "ABIERTO" | "PAGADO" | "CANCELADO";
  idMesa: number | null;
  detalles: DetallePedido[];
}

interface DetallePago {
  metodoPago: "EFECTIVO" | "TARJETA" | "YAPE" | "PLIN";
  monto: number;
}

interface Pago {
  idPago: number;
  idPedido: number;
  idUsuarioCobro: number;
  nombreUsuarioCobro: string;
  fechaHora: string;
  total: number;
  detallePago: DetallePago[];
}

/* ─── Helpers ─────────────────────────────────────────────────── */

function toLocalDateStr(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

function formatFechaLabel(dateStr: string): string {
  const [y, m, d] = dateStr.split("-");
  return `${d}/${m}/${y}`;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T12:00:00");
  d.setDate(d.getDate() + days);
  return toLocalDateStr(d);
}

const METODO_COLOR: Record<string, string> = {
  EFECTIVO: "#06b6d4",
  TARJETA:  "#8b5cf6",
  YAPE:     "#f59e0b",
  PLIN:     "#22c55e",
};

const METODO_ICON: Record<string, React.ReactNode> = {
  EFECTIVO: <Banknote size={13} />,
  TARJETA:  <CreditCard size={13} />,
  YAPE:     <span style={{ fontSize: 11, fontWeight: 800 }}>Y</span>,
  PLIN:     <span style={{ fontSize: 11, fontWeight: 800 }}>P</span>,
};

const BAR_COLORS = ["#06b6d4", "#0ea5e9", "#38bdf8", "#7dd3fc", "#bae6fd", "#93c5fd"];

/* ─── Modal detalle pedido ────────────────────────────────────── */

function ModalDetallePedido({
  pago, numero, pedido, onClose,
}: {
  pago: Pago; numero: number; pedido: Pedido | null; onClose: () => void;
}) {
  return (
    <div
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.55)",
        display: "flex", alignItems: "center", justifyContent: "center",
        padding: 16,
      }}
    >
      <div style={{
        background: "#fff", borderRadius: 22, width: "100%", maxWidth: 400,
        boxShadow: "0 24px 60px rgba(0,0,0,0.2)", overflow: "hidden",
      }}>
        {/* Header */}
        <div style={{
          background: "#0f172a", padding: "16px 20px",
          display: "flex", alignItems: "center", justifyContent: "space-between",
        }}>
          <div>
            <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>
              {new Date(pago.fechaHora).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
              {" · "}{pago.nombreUsuarioCobro}
            </p>
            <p style={{ fontSize: 16, fontWeight: 800, color: "#fff", margin: "2px 0 0" }}>
              Cobro #{numero}
            </p>
          </div>
          <button
            onClick={onClose}
            style={{
              width: 32, height: 32, borderRadius: 10,
              background: "rgba(255,255,255,0.1)", border: "none",
              cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              color: "#fff",
            }}
          >
            <X size={15} />
          </button>
        </div>

        <div style={{ padding: "18px 20px", display: "flex", flexDirection: "column", gap: 14 }}>

          {/* Info pedido */}
          <div style={{
            background: "#f8fafc", borderRadius: 14, padding: "12px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between",
          }}>
            <div>
              <p style={{ fontSize: 11, color: "#94a3b8", margin: 0 }}>Pedido #{pago.idPedido}</p>
              {pedido && (
                <p style={{ fontSize: 12, color: "#475569", margin: "2px 0 0", fontWeight: 600 }}>
                  {pedido.tipoPedido === "LLEVAR" ? "🛍 Para llevar" : `🍽 Mesa ${pedido.idMesa}`}
                </p>
              )}
            </div>
            <p style={{ fontSize: 18, fontWeight: 800, color: "#06b6d4", margin: 0 }}>
              S/ {pago.total.toFixed(2)}
            </p>
          </div>

          {/* Productos */}
          {pedido && pedido.detalles.length > 0 && (
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                Productos
              </p>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {pedido.detalles.map((d, i) => (
                  <div key={i} style={{
                    display: "flex", alignItems: "center", justifyContent: "space-between",
                    background: "#f8fafc", borderRadius: 10, padding: "9px 12px",
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 12, fontWeight: 600, color: "#0f172a", margin: 0, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                        {d.nombreProducto}
                      </p>
                      {d.observacion && d.observacion.trim() !== "" && (
                        <p style={{ fontSize: 10, color: "#f59e0b", margin: "2px 0 0" }}>📝 {d.observacion}</p>
                      )}
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, flexShrink: 0, marginLeft: 10 }}>
                      <span style={{ fontSize: 11, color: "#94a3b8" }}>×{d.cantidad}</span>
                      <span style={{ fontSize: 12, fontWeight: 700, color: "#0f172a" }}>S/ {d.subtotal.toFixed(2)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Sin detalles */}
          {(!pedido || pedido.detalles.length === 0) && (
            <p style={{ fontSize: 12, color: "#94a3b8", textAlign: "center", padding: "12px 0" }}>
              No hay detalle de productos disponible
            </p>
          )}

          {/* Métodos de pago */}
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#94a3b8", margin: "0 0 8px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Métodos de pago
            </p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {pago.detallePago.map((d, i) => (
                <div key={i} style={{
                  display: "flex", alignItems: "center", gap: 5,
                  background: `${METODO_COLOR[d.metodoPago] ?? "#94a3b8"}12`,
                  border: `1.5px solid ${METODO_COLOR[d.metodoPago] ?? "#94a3b8"}40`,
                  borderRadius: 10, padding: "6px 12px",
                  color: METODO_COLOR[d.metodoPago] ?? "#94a3b8",
                }}>
                  {METODO_ICON[d.metodoPago]}
                  <span style={{ fontSize: 12, fontWeight: 700 }}>{d.metodoPago}</span>
                  <span style={{ fontSize: 12, color: "#64748b" }}>S/ {d.monto.toFixed(2)}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Stat Card ───────────────────────────────────────────────── */

function StatCard({ label, value, sub, icon, color }: {
  label: string; value: string; sub?: string;
  icon: React.ReactNode; color: string;
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: 18, border: "1.5px solid #f1f5f9",
      padding: "16px 18px", display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    }}>
      <div style={{
        width: 42, height: 42, borderRadius: 13, background: `${color}18`,
        display: "flex", alignItems: "center", justifyContent: "center",
        color, flexShrink: 0,
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontSize: 11, color: "#94a3b8", margin: 0, fontWeight: 500 }}>{label}</p>
        <p style={{ fontSize: 20, fontWeight: 800, color: "#0f172a", margin: "1px 0 0", lineHeight: 1 }}>{value}</p>
        {sub && <p style={{ fontSize: 10, color: "#94a3b8", margin: "3px 0 0", lineHeight: 1.3 }}>{sub}</p>}
      </div>
    </div>
  );
}

/* ─── Chart Card ──────────────────────────────────────────────── */

function ChartCard({ title, icon, color, children }: {
  title: string; icon: React.ReactNode; color: string; children: React.ReactNode;
}) {
  return (
    <div style={{
      background: "#fff", borderRadius: 20, border: "1.5px solid #f1f5f9",
      padding: "18px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)",
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <span style={{ color }}>{icon}</span>
        <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>{title}</h3>
      </div>
      {children}
    </div>
  );
}

function EmptyChart() {
  return (
    <p style={{ color: "#94a3b8", fontSize: 13, textAlign: "center", padding: "28px 0", margin: 0 }}>
      Sin datos para esta fecha
    </p>
  );
}

/* ─── Componente principal ────────────────────────────────────── */

export default function Reportes() {
  const [fecha, setFecha]     = useState<string>(toLocalDateStr(new Date()));
  const [pedidos, setPedidos] = useState<Pedido[]>([]);
  const [pagos, setPagos]     = useState<Pago[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  // Modal detalle
  const [pagoSeleccionado, setPagoSeleccionado] = useState<{ pago: Pago; numero: number } | null>(null);

  const fetchData = useCallback(async (f: string) => {
    try {
      setLoading(true);
      setError(null);
      const [resPedidos, resPagos] = await Promise.all([
        api.get(`/api/pedidos/por-fecha?fecha=${f}`),
        api.get(`/api/pagos/dia?fecha=${f}`),
      ]);
      setPedidos(resPedidos.data);
      setPagos(resPagos.data);
    } catch {
      setError("No se pudieron cargar los datos.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(fecha); }, [fecha, fetchData]);

  const irAyer   = () => setFecha((f) => addDays(f, -1));
  const irMañana = () => setFecha((f) => addDays(f, 1));
  const irHoy    = () => setFecha(toLocalDateStr(new Date()));
  const esHoy    = fecha === toLocalDateStr(new Date());

  /* ── Métricas ── */
  const pedidosPagados    = pedidos.filter((p) => p.estadoPedido === "PAGADO");
  const pedidosCancelados = pedidos.filter((p) => p.estadoPedido === "CANCELADO");
  const totalIngresos     = pagos.reduce((acc, p) => acc + p.total, 0);
  const ticketPromedio    = pagos.length > 0 ? totalIngresos / pagos.length : 0;

  /* ── Productos más vendidos ── */
  const productosMap = new Map<string, number>();
  pedidos.forEach((p) => p.detalles.forEach((d) => {
    productosMap.set(d.nombreProducto, (productosMap.get(d.nombreProducto) ?? 0) + d.cantidad);
  }));
  const topProductos = Array.from(productosMap.entries())
    .map(([nombre, cantidad]) => ({ nombre, cantidad }))
    .sort((a, b) => b.cantidad - a.cantidad)
    .slice(0, 6);

  /* ── Ingresos por mesa ── */
  const mesaMap = new Map<string, number>();
  pedidos.filter((p) => p.estadoPedido === "PAGADO" && p.idMesa !== null)
    .forEach((p) => {
      const key = `M${p.idMesa}`;
      mesaMap.set(key, (mesaMap.get(key) ?? 0) + p.total);
    });
  const ingresosPorMesa = Array.from(mesaMap.entries())
    .map(([mesa, total]) => ({ mesa, total }))
    .sort((a, b) => b.total - a.total);

  /* ── Métodos de pago ── */
  const metodosMap = new Map<string, number>();
  pagos.forEach((pago) => pago.detallePago.forEach((d) => {
    metodosMap.set(d.metodoPago, (metodosMap.get(d.metodoPago) ?? 0) + d.monto);
  }));
  const metodosPago = Array.from(metodosMap.entries())
    .map(([metodo, monto]) => ({ metodo, monto }));

  /* ── Pedidos por hora ── */
  const horasMap = new Map<number, number>();
  pedidos.forEach((p) => {
    const hora = new Date(p.fechaApertura).getHours();
    horasMap.set(hora, (horasMap.get(hora) ?? 0) + 1);
  });
  const pedidosPorHora = Array.from({ length: 24 }, (_, h) => ({
    hora: `${String(h).padStart(2, "0")}h`,
    cantidad: horasMap.get(h) ?? 0,
  })).filter((h) => h.cantidad > 0);

  /* ── Buscar pedido por idPedido ── */
  const getPedidoByIdPedido = (idPedido: number): Pedido | null =>
    pedidos.find((p) => p.idPedido === idPedido) ?? null;

  return (
    <>
      <style>{`
        .rpt-stats {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 12px;
          margin-bottom: 14px;
        }
        .rpt-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 14px;
          margin-bottom: 14px;
        }
        @media (max-width: 640px) {
          .rpt-stats { grid-template-columns: 1fr 1fr; }
          .rpt-grid  { grid-template-columns: 1fr; }
        }
      `}</style>

      {/* Modal detalle */}
      {pagoSeleccionado && (
        <ModalDetallePedido
          pago={pagoSeleccionado.pago}
          numero={pagoSeleccionado.numero}
          pedido={getPedidoByIdPedido(pagoSeleccionado.pago.idPedido)}
          onClose={() => setPagoSeleccionado(null)}
        />
      )}

      <div style={{ color: "#1e293b", paddingBottom: 40 }}>

        {/* ── Header ── */}
        <div style={{ marginBottom: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, marginBottom: 14 }}>
            <div>
              <h1 style={{ fontSize: 21, fontWeight: 800, color: "#0f172a", margin: 0, display: "flex", alignItems: "center", gap: 8 }}>
                <TrendingUp size={21} color="#06b6d4" />
                Reportes
              </h1>
              <p style={{ color: "#94a3b8", fontSize: 12, margin: "3px 0 0" }}>
                Resumen de ventas y pedidos
              </p>
            </div>
            <button
              onClick={() => fetchData(fecha)}
              style={{ width: 36, height: 36, borderRadius: 10, border: "1.5px solid #e2e8f0", background: "#fff", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", flexShrink: 0 }}
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            </button>
          </div>

          {/* Selector fecha */}
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
            <div style={{
              display: "flex", alignItems: "center",
              background: "#fff", border: "1.5px solid #e2e8f0",
              borderRadius: 14, overflow: "hidden",
              boxShadow: "0 2px 8px rgba(0,0,0,0.06)",
            }}>
              <button onClick={irAyer} style={{ padding: "9px 11px", border: "none", background: "transparent", cursor: "pointer", color: "#64748b", display: "flex", alignItems: "center" }}>
                <ChevronLeft size={16} />
              </button>
              <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "0 2px" }}>
                <Calendar size={12} color="#06b6d4" />
                <input
                  type="date"
                  value={fecha}
                  onChange={(e) => e.target.value && setFecha(e.target.value)}
                  style={{ border: "none", outline: "none", fontSize: 13, fontWeight: 700, color: "#0f172a", background: "transparent", cursor: "pointer", width: 128 }}
                />
              </div>
              <button onClick={irMañana} disabled={esHoy} style={{ padding: "9px 11px", border: "none", background: "transparent", cursor: esHoy ? "not-allowed" : "pointer", color: esHoy ? "#cbd5e1" : "#64748b", display: "flex", alignItems: "center" }}>
                <ChevronRight size={16} />
              </button>
            </div>

            {esHoy ? (
              <span style={{ background: "#ecfeff", color: "#06b6d4", border: "1px solid #a5f3fc", borderRadius: 8, padding: "5px 10px", fontSize: 11, fontWeight: 700 }}>
                HOY · {formatFechaLabel(fecha)}
              </span>
            ) : (
              <>
                <span style={{ fontSize: 12, color: "#94a3b8" }}>{formatFechaLabel(fecha)}</span>
                <button onClick={irHoy} style={{ fontSize: 12, fontWeight: 700, color: "#06b6d4", background: "#ecfeff", border: "1.5px solid #a5f3fc", borderRadius: 10, padding: "6px 12px", cursor: "pointer" }}>
                  Ir a hoy
                </button>
              </>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div style={{ background: "#fef2f2", border: "1.5px solid #fecaca", borderRadius: 14, padding: "12px 16px", color: "#991b1b", fontSize: 13, marginBottom: 14 }}>
            {error}
          </div>
        )}

        {/* Loading */}
        {loading && (
          <div style={{ textAlign: "center", padding: "60px 0", color: "#94a3b8", fontSize: 14 }}>
            Cargando datos...
          </div>
        )}

        {!loading && !error && (
          <>
            {/* ── Stats ── */}
            <div className="rpt-stats">
              <StatCard label="Ingresos del día"  value={`S/ ${totalIngresos.toFixed(2)}`}   sub={`${pagos.length} cobros`}                                                                    icon={<DollarSign size={19} />}  color="#06b6d4" />
              <StatCard label="Pedidos totales"   value={String(pedidos.length)}              sub={`${pedidosPagados.length} pag · ${pedidosCancelados.length} can`}                           icon={<Receipt size={19} />}     color="#8b5cf6" />
              <StatCard label="Ticket promedio"   value={`S/ ${ticketPromedio.toFixed(2)}`}  sub="por cobro"                                                                                   icon={<TrendingUp size={19} />}  color="#f59e0b" />
              <StatCard label="Para llevar"       value={String(pedidos.filter((p) => p.tipoPedido === "LLEVAR").length)} sub={`${pedidos.filter((p) => p.tipoPedido === "MESA").length} en mesa`} icon={<ShoppingBag size={19} />} color="#22c55e" />
            </div>

            {/* ── Gráficos fila 1 ── */}
            <div className="rpt-grid">
              <ChartCard title="Productos más vendidos" icon={<Package size={15} />} color="#06b6d4">
                {topProductos.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={topProductos} layout="vertical" margin={{ left: 4, right: 20, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                      <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <YAxis type="category" dataKey="nombre" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={95} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div style={{ background: "#0f172a", borderRadius: 10, padding: "8px 12px" }}>
                            <p style={{ color: "#94a3b8", fontSize: 11, margin: "0 0 2px" }}>{label}</p>
                            <p style={{ color: "#06b6d4", fontSize: 13, fontWeight: 700, margin: 0 }}>{payload[0].value} unid.</p>
                          </div>
                        );
                      }} />
                      <Bar dataKey="cantidad" radius={[0, 6, 6, 0]}>
                        {topProductos.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Ingresos por mesa" icon={<UtensilsCrossed size={15} />} color="#8b5cf6">
                {ingresosPorMesa.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={ingresosPorMesa} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="mesa" tick={{ fontSize: 11, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={(v) => `S/${v}`} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div style={{ background: "#0f172a", borderRadius: 10, padding: "8px 12px" }}>
                            <p style={{ color: "#94a3b8", fontSize: 11, margin: "0 0 2px" }}>{label}</p>
                            <p style={{ color: "#8b5cf6", fontSize: 13, fontWeight: 700, margin: 0 }}>S/ {Number(payload[0].value).toFixed(2)}</p>
                          </div>
                        );
                      }} />
                      <Bar dataKey="total" radius={[6, 6, 0, 0]}>
                        {ingresosPorMesa.map((_, i) => <Cell key={i} fill={BAR_COLORS[i % BAR_COLORS.length]} />)}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>
            </div>

            {/* ── Gráficos fila 2 ── */}
            <div className="rpt-grid">
              <ChartCard title="Pedidos por hora" icon={<Receipt size={15} />} color="#f59e0b">
                {pedidosPorHora.length === 0 ? <EmptyChart /> : (
                  <ResponsiveContainer width="100%" height={180}>
                    <BarChart data={pedidosPorHora} margin={{ left: 0, right: 8, top: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis dataKey="hora" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} />
                      <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                      <Tooltip content={({ active, payload, label }) => {
                        if (!active || !payload?.length) return null;
                        return (
                          <div style={{ background: "#0f172a", borderRadius: 10, padding: "8px 12px" }}>
                            <p style={{ color: "#94a3b8", fontSize: 11, margin: "0 0 2px" }}>{label}</p>
                            <p style={{ color: "#f59e0b", fontSize: 13, fontWeight: 700, margin: 0 }}>{payload[0].value} pedidos</p>
                          </div>
                        );
                      }} />
                      <Bar dataKey="cantidad" fill="#f59e0b" radius={[6, 6, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </ChartCard>

              <ChartCard title="Métodos de pago" icon={<CreditCard size={15} />} color="#22c55e">
                {metodosPago.length === 0 ? <EmptyChart /> : (
                  <>
                    <ResponsiveContainer width="100%" height={150}>
                      <PieChart>
                        <Pie data={metodosPago} dataKey="monto" nameKey="metodo" cx="50%" cy="50%" innerRadius={42} outerRadius={65} paddingAngle={3}>
                          {metodosPago.map((entry, i) => <Cell key={i} fill={METODO_COLOR[entry.metodo] ?? "#94a3b8"} />)}
                        </Pie>
                        <Tooltip formatter={(value) => [`S/ ${Number(value).toFixed(2)}`, ""]} />
                      </PieChart>
                    </ResponsiveContainer>
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 7, marginTop: 10 }}>
                      {metodosPago.map((m) => (
                        <div key={m.metodo} style={{
                          display: "flex", alignItems: "center", gap: 5,
                          background: `${METODO_COLOR[m.metodo] ?? "#94a3b8"}12`,
                          border: `1.5px solid ${METODO_COLOR[m.metodo] ?? "#94a3b8"}40`,
                          borderRadius: 10, padding: "5px 10px",
                          color: METODO_COLOR[m.metodo] ?? "#94a3b8",
                        }}>
                          {METODO_ICON[m.metodo]}
                          <span style={{ fontSize: 11, fontWeight: 700 }}>{m.metodo}</span>
                          <span style={{ fontSize: 11, color: "#64748b" }}>S/ {m.monto.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </ChartCard>
            </div>

            {/* ── Cobros del día ── */}
            <div style={{ background: "#fff", borderRadius: 20, border: "1.5px solid #f1f5f9", padding: "18px 16px", boxShadow: "0 2px 12px rgba(0,0,0,0.05)" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <DollarSign size={15} color="#06b6d4" />
                  <h3 style={{ fontSize: 13, fontWeight: 700, color: "#0f172a", margin: 0 }}>Cobros del día</h3>
                </div>
                <span style={{ fontSize: 11, fontWeight: 700, color: "#06b6d4", background: "#ecfeff", border: "1px solid #a5f3fc", borderRadius: 8, padding: "3px 9px" }}>
                  {pagos.length} cobros
                </span>
              </div>

              {pagos.length === 0 ? <EmptyChart /> : (
                <>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {pagos.map((pago, index) => (
                      <div
                        key={pago.idPago}
                        style={{
                          display: "flex", alignItems: "center", gap: 10,
                          background: "#f8fafc", borderRadius: 14,
                          padding: "11px 13px", flexWrap: "wrap",
                        }}
                      >
                        {/* Número correlativo */}
                        <div style={{
                          width: 32, height: 32, borderRadius: 10,
                          background: "#e0f2fe", flexShrink: 0,
                          display: "flex", alignItems: "center", justifyContent: "center",
                        }}>
                          <span style={{ fontSize: 13, fontWeight: 800, color: "#0284c7" }}>
                            {index + 1}
                          </span>
                        </div>

                        {/* Cajero + hora */}
                        <div style={{ flex: 1, minWidth: 70 }}>
                          <p style={{ fontSize: 11, fontWeight: 600, color: "#475569", margin: 0 }}>{pago.nombreUsuarioCobro}</p>
                          <p style={{ fontSize: 10, color: "#94a3b8", margin: "2px 0 0" }}>
                            {new Date(pago.fechaHora).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}
                          </p>
                        </div>

                        {/* Métodos */}
                        <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                          {pago.detallePago.map((d, i) => (
                            <span key={i} style={{
                              fontSize: 10, fontWeight: 700,
                              color: METODO_COLOR[d.metodoPago] ?? "#64748b",
                              background: `${METODO_COLOR[d.metodoPago] ?? "#94a3b8"}15`,
                              border: `1px solid ${METODO_COLOR[d.metodoPago] ?? "#94a3b8"}30`,
                              borderRadius: 6, padding: "2px 7px",
                            }}>
                              {d.metodoPago}
                            </span>
                          ))}
                        </div>

                        {/* Total */}
                        <p style={{ fontSize: 15, fontWeight: 800, color: "#0f172a", margin: 0 }}>
                          S/ {pago.total.toFixed(2)}
                        </p>

                        {/* Botón ver detalle */}
                        <button
                          onClick={() => setPagoSeleccionado({ pago, numero: index + 1 })}
                          style={{
                            width: 30, height: 30, borderRadius: 9,
                            background: "#ecfeff", border: "1.5px solid #a5f3fc",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            color: "#06b6d4", flexShrink: 0,
                          }}
                        >
                          <Eye size={13} />
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Total final */}
                  <div style={{ marginTop: 12, paddingTop: 12, borderTop: "2px solid #f1f5f9", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#64748b" }}>TOTAL DEL DÍA</span>
                    <span style={{ fontSize: 18, fontWeight: 800, color: "#06b6d4" }}>S/ {totalIngresos.toFixed(2)}</span>
                  </div>
                </>
              )}
            </div>
          </>
        )}
      </div>
    </>
  );
}
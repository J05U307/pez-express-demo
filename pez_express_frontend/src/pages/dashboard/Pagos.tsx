// src/pages/dashboard/Pagos.tsx

import { useEffect, useState, useMemo, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  CreditCard,
  Banknote,
  Smartphone,
  CheckCircle2,
  AlertCircle,
  Plus,
  Trash2,
  ArrowLeft,
  Clock,
  Receipt,
  TrendingUp,
  ChevronDown,
  QrCode,
  X,
} from "lucide-react";
import { createPago, getPagosPorDia } from "../../services/pagoService";
import { getConfiguracionGeneral } from "../../services/configuracionGeneralService";
import { useAuth } from "../../context/AuthContext";
import type { Pago } from "../../services/pagoService";
import type { Pedido } from "../../types/Pedido";
import { PageContent } from "../../components/ui/pages/Pagecontent";

/* ─── Modal QR Yape ───────────────────────────────────────────── */

function ModalQrYape({ onClose, qrUrl }: { onClose: () => void; qrUrl: string | null }) {
  const overlayRef = useRef<HTMLDivElement>(null);

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === overlayRef.current) onClose();
  };

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
    >
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-xs flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 bg-purple-600">
          <div className="flex items-center gap-2">
            <QrCode size={18} className="text-white" />
            <span className="text-sm font-bold text-white">QR Yape</span>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center transition-colors"
          >
            <X size={14} className="text-white" />
          </button>
        </div>
        <div className="p-5 flex flex-col items-center gap-4">
          {qrUrl ? (
            <img
              src={qrUrl}
              alt="QR Yape"
              className="w-80 h-80 object-contain rounded-2xl border border-slate-100 bg-white p-2 shadow-sm"
            />
          ) : (
            <div className="w-80 h-48 flex flex-col items-center justify-center gap-3 rounded-2xl border border-slate-200 bg-slate-50">
              <QrCode size={36} className="text-slate-300" />
              <p className="text-xs text-slate-400 text-center">
                No hay QR configurado.{"\n"}Configúralo en Ajustes → General.
              </p>
            </div>
          )}
          <p className="text-xs text-slate-400 text-center">
            El cliente escanea este QR con Yape para pagar
          </p>
        </div>
      </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────────────── */

const METODOS = ["EFECTIVO", "YAPE", "PLIN"] as const;
type MetodoPago = (typeof METODOS)[number];

const METODO_META: Record<MetodoPago, { label: string; icon: React.ReactNode; color: string; bg: string; border: string }> = {
  EFECTIVO: {
    label: "Efectivo",
    icon: <Banknote size={16} />,
    color: "text-emerald-700",
    bg: "bg-emerald-50",
    border: "border-emerald-300",
  },
  YAPE: {
    label: "Yape",
    icon: <Smartphone size={16} />,
    color: "text-purple-700",
    bg: "bg-purple-50",
    border: "border-purple-300",
  },
  PLIN: {
    label: "Plin",
    icon: <Smartphone size={16} />,
    color: "text-sky-700",
    bg: "bg-sky-50",
    border: "border-sky-300",
  },
};

function hoy(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatHora(fechaStr: string) {
  return new Date(fechaStr).toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" });
}

function formatFecha(fechaStr: string) {
  return new Date(fechaStr).toLocaleDateString("es-PE", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function getIniciales(nombre: string): string {
  return nombre
    .trim()
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase() ?? "")
    .join("");
}

/* ─── Sub-componente: Formulario de cobro ──────────────────────── */

interface FormCobroProps {
  pedido: Pedido;
  idUsuario: number;
  onExito: (pago: Pago) => void;
}

function FormCobro({ pedido, idUsuario, onExito }: FormCobroProps) {
  const navigate = useNavigate();

  const [lineas, setLineas] = useState<{ metodo: MetodoPago; monto: string }[]>([
    { metodo: "EFECTIVO", monto: pedido.total.toFixed(2) },
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);
  const [saved, setSaved]     = useState(false);

  const totalIngresado = lineas.reduce((acc, l) => acc + (parseFloat(l.monto) || 0), 0);
  const diferencia     = totalIngresado - pedido.total;
  const vuelto         = diferencia > 0 ? diferencia : 0;
  const falta          = diferencia < 0 ? Math.abs(diferencia) : 0;

  const metodosUsados      = new Set(lineas.map((l) => l.metodo));
  const metodosDisponibles = METODOS.filter((m) => !metodosUsados.has(m));

  const agregarLinea = () => {
    if (metodosDisponibles.length === 0) return;
    setLineas((prev) => [...prev, { metodo: metodosDisponibles[0], monto: "" }]);
  };

  const cambiarMetodo = (index: number, metodo: MetodoPago) => {
    setLineas((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], metodo };
      return copy;
    });
  };

  const cambiarMonto = (index: number, val: string) => {
    if (val !== "" && !/^\d*\.?\d{0,2}$/.test(val)) return;
    setLineas((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], monto: val };
      return copy;
    });
  };

  const eliminarLinea = (index: number) => {
    if (lineas.length === 1) return;
    setLineas((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    setError(null);
    for (const l of lineas) {
      if (!l.monto || parseFloat(l.monto) <= 0) {
        setError("Todos los montos deben ser mayores a 0.");
        return;
      }
    }
    if (falta > 0.009) {
      setError(`Falta S/ ${falta.toFixed(2)} para completar el pago.`);
      return;
    }

    const dto = {
      idPedido: pedido.idPedido,
      idUsuarioCobro: idUsuario,
      detallePagos: lineas.map((l) => ({
        metodoPago: l.metodo,
        monto: parseFloat(l.monto),
      })),
    };

    try {
      setLoading(true);
      const pago = await createPago(dto);
      setSaved(true);
      setTimeout(() => onExito(pago), 1000);
    } catch (err: any) {
      const msg =
        err?.response?.data?.mensaje ||
        err?.response?.data?.error ||
        err?.message ||
        "Error al registrar el pago.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  if (saved) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-16">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <p className="text-lg font-bold text-gray-900">¡Pago registrado!</p>
        <p className="text-sm text-gray-500">Redirigiendo...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">

      {/* Resumen del pedido */}
      <div className="bg-slate-800 rounded-2xl p-4 flex flex-col gap-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 font-medium">
              {pedido.tipoPedido === "LLEVAR" ? "🛍 Para llevar" : `🍽 Mesa ${pedido.idMesa ?? "—"}`}
            </p>
            <p className="text-sm font-bold text-white mt-0.5">Pedido #{pedido.idPedido}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-slate-400">Total a cobrar</p>
            <p className="text-2xl font-black text-cyan-400">S/ {pedido.total.toFixed(2)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-slate-700 pt-3">
          {pedido.detalles.map((d, i) => (
            <div key={i} className="flex items-center justify-between text-xs text-slate-300">
              <span className="truncate flex-1">{d.nombreProducto}</span>
              <span className="text-slate-400 mx-2">×{d.cantidad}</span>
              <span className="font-semibold">S/ {(d.precioUnitario * d.cantidad).toFixed(2)}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-start gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600">
          <AlertCircle size={15} className="flex-shrink-0 mt-0.5" />
          <span className="font-medium">{error}</span>
        </div>
      )}

      {/* Líneas de pago */}
      <div className="flex flex-col gap-2">
        <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest pl-1">
          Métodos de pago
        </label>

        {lineas.map((linea, index) => {
          const meta = METODO_META[linea.metodo];
          return (
            <div
              key={index}
              className={`flex items-center gap-3 p-3 rounded-2xl border-2 ${meta.bg} ${meta.border}`}
            >
              <div className="relative flex-shrink-0">
                <select
                  value={linea.metodo}
                  onChange={(e) => cambiarMetodo(index, e.target.value as MetodoPago)}
                  disabled={loading}
                  className={`appearance-none pl-3 pr-7 py-2 text-xs font-bold rounded-xl border-0 bg-white shadow-sm cursor-pointer focus:outline-none focus:ring-2 focus:ring-cyan-300 ${meta.color}`}
                >
                  <option value={linea.metodo}>{METODO_META[linea.metodo].label}</option>
                  {METODOS.filter(
                    (m) => m !== linea.metodo && !lineas.some((l, i2) => i2 !== index && l.metodo === m)
                  ).map((m) => (
                    <option key={m} value={m}>{METODO_META[m].label}</option>
                  ))}
                </select>
                <ChevronDown size={11} className={`absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none ${meta.color}`} />
              </div>

              <div className="flex-1 flex items-center gap-1">
                <span className={`text-sm font-bold ${meta.color}`}>S/</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={linea.monto}
                  onChange={(e) => cambiarMonto(index, e.target.value)}
                  disabled={loading}
                  placeholder="0.00"
                  className="flex-1 bg-white/80 border border-white rounded-xl px-3 py-2 text-sm font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-cyan-300 min-w-0"
                />
              </div>

              {lineas.length > 1 && (
                <button
                  type="button"
                  onClick={() => eliminarLinea(index)}
                  disabled={loading}
                  className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-100 transition-colors flex-shrink-0"
                >
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          );
        })}

        {metodosDisponibles.length > 0 && (
          <button
            type="button"
            onClick={agregarLinea}
            disabled={loading}
            className="flex items-center justify-center gap-2 py-2.5 text-xs font-semibold text-slate-500 hover:text-cyan-600 hover:bg-cyan-50 rounded-2xl border border-dashed border-slate-300 hover:border-cyan-300 transition-all"
          >
            <Plus size={13} />
            Agregar método de pago
          </button>
        )}
      </div>

      {/* Resumen de montos */}
      <div className="bg-slate-50 rounded-2xl border border-slate-200 p-4 flex flex-col gap-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Total pedido</span>
          <span className="font-bold text-slate-800">S/ {pedido.total.toFixed(2)}</span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Total ingresado</span>
          <span className={`font-bold ${falta > 0.009 ? "text-rose-500" : "text-emerald-600"}`}>
            S/ {totalIngresado.toFixed(2)}
          </span>
        </div>
        {falta > 0.009 && (
          <div className="flex items-center justify-between text-sm border-t border-slate-200 pt-2">
            <span className="text-rose-500 font-semibold">Falta</span>
            <span className="font-black text-rose-500">S/ {falta.toFixed(2)}</span>
          </div>
        )}
        {vuelto > 0.009 && (
          <div className="flex items-center justify-between text-sm border-t border-slate-200 pt-2">
            <span className="text-emerald-600 font-semibold">Vuelto</span>
            <span className="font-black text-emerald-600">S/ {vuelto.toFixed(2)}</span>
          </div>
        )}
      </div>

      {/* Botones */}
      <div className="flex gap-3">
        <button
          type="button"
          onClick={() => navigate(-1)}
          disabled={loading}
          className="flex-1 py-3 text-sm font-bold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-2xl transition-colors disabled:opacity-40"
        >
          Volver
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading || falta > 0.009}
          className="flex-2 flex-grow-[2] py-3 text-sm font-bold text-white bg-cyan-500 hover:bg-cyan-600 rounded-2xl transition-colors shadow-lg shadow-cyan-500/25 disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <CreditCard size={15} />
          {loading ? "Registrando..." : "Confirmar pago"}
        </button>
      </div>
    </div>
  );
}

/* ─── Página principal Pagos ───────────────────────────────────── */

export default function Pagos() {
  const location = useLocation();
  const navigate = useNavigate();

  const { usuario } = useAuth();
  const idUsuario = usuario?.id ?? 0;

  const pedidoInicial = (location.state as { pedido?: Pedido } | null)?.pedido ?? null;

  const [pagoExitoso, setPagoExitoso]   = useState<Pago | null>(null);
  const [pedidoActual, setPedidoActual] = useState<Pedido | null>(pedidoInicial);
  const [modalQr, setModalQr]           = useState(false);
  const [qrYapeUrl, setQrYapeUrl]       = useState<string | null>(null); // ← URL dinámica

  const [pagosHoy, setPagosHoy]               = useState<Pago[]>([]);
  const [loadingHistorial, setLoadingHistorial] = useState(true);
  const [errorHistorial, setErrorHistorial]     = useState<string | null>(null);

  // Limpia el state del navegador al montar para que F5 no recargue el pedido
  useEffect(() => {
    if (pedidoInicial) {
      navigate(location.pathname, { replace: true, state: null });
    }
  }, []);

  const fetchHistorial = async () => {
    try {
      setLoadingHistorial(true);
      setErrorHistorial(null);
      const pagos = await getPagosPorDia(hoy());
      //setPagosHoy(pagos);
      setPagosHoy(Array.isArray(pagos) ? pagos : []);
    } catch {
      setErrorHistorial("No se pudo cargar el historial de hoy.");
    } finally {
      setLoadingHistorial(false);
    }
  };

  // Carga historial + QR al montar
  useEffect(() => {
    fetchHistorial();
    getConfiguracionGeneral()
      .then((config) => setQrYapeUrl(config.qrYapeUrl))
      .catch(() => {}); // si falla el QR, no importa
  }, []);

  const handlePagoExitoso = async (pago: Pago) => {
    setPagoExitoso(pago);
    setPedidoActual(null);
    await fetchHistorial();
    setTimeout(() => setPagoExitoso(null), 2000);
  };

  const resumenPorMetodo = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const pago of pagosHoy) {
      for (const d of (pago.detallePago ?? [])) {  // ← el ?? [] protege si viene undefined
        mapa[d.metodoPago] = (mapa[d.metodoPago] ?? 0) + d.monto;
      }
    }
    return mapa;
  }, [pagosHoy]);



  //const totalDia = pagosHoy.reduce((acc, p) => acc + p.total, 0);
  const totalDia = pagosHoy.reduce((acc, p) => acc + p.total, 0);

  return (
    <div className="text-gray-800 pb-8">

      {/* Header */}
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          {pedidoActual && (
            <button
              onClick={() => setPedidoActual(null)}
              className="w-9 h-9 flex items-center justify-center rounded-xl bg-slate-100 hover:bg-slate-200 transition-colors text-slate-600"
            >
              <ArrowLeft size={16} />
            </button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <CreditCard size={24} className="text-cyan-500" />
              Pagos
            </h1>
            <p className="text-gray-500 text-sm mt-1">
              {pedidoActual
                ? `Cobrando pedido #${pedidoActual.idPedido}`
                : `Historial de hoy · ${formatFecha(new Date().toISOString())}`}
            </p>
          </div>
        </div>
        <button
          onClick={() => setModalQr(true)}
          className="flex items-center gap-2 bg-purple-500 hover:bg-purple-600 text-white text-sm font-bold px-4 py-2.5 rounded-xl transition-all shadow-sm hover:shadow-md whitespace-nowrap"
        >
          <QrCode size={16} />
          <span className="hidden sm:inline">QR Yape</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* ── Columna izquierda ── */}
        <div>
          {pedidoActual ? (
            <FormCobro
              pedido={pedidoActual}
              idUsuario={idUsuario}
              onExito={handlePagoExitoso}
            />
          ) : pagoExitoso ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex flex-col items-center gap-3 text-center animate-pulse">
              <div className="w-14 h-14 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 size={28} className="text-emerald-500" />
              </div>
              <p className="font-bold text-emerald-800">¡Pago registrado!</p>
              <p className="text-sm text-emerald-600">
                Total cobrado: <span className="font-black">S/ {pagoExitoso.total.toFixed(2)}</span>
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center gap-3 py-14 rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50/50">
              <CreditCard size={28} className="text-slate-300" />
              <p className="text-sm text-slate-400 font-medium">No hay pedido seleccionado</p>
              <button
                onClick={() => navigate("/dashboard/pedidos")}
                className="text-xs text-cyan-600 font-semibold hover:underline flex items-center gap-1"
              >
                <ArrowLeft size={11} />
                Ir a Pedidos para cobrar
              </button>
            </div>
          )}
        </div>

        {/* ── Columna derecha ── */}
        <div className="flex flex-col gap-4">

          {/* Resumen por método */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <TrendingUp size={13} className="text-cyan-500" />
              Resumen de hoy
            </h2>
            <div className="grid grid-cols-3 gap-2">
              {METODOS.map((m) => {
                const meta  = METODO_META[m];
                const monto = resumenPorMetodo[m] ?? 0;
                return (
                  <div key={m} className={`rounded-2xl border p-3 flex flex-col gap-1 ${meta.bg} ${meta.border}`}>
                    <div className={`flex items-center gap-1.5 ${meta.color}`}>
                      {meta.icon}
                      <span className="text-[11px] font-bold">{meta.label}</span>
                    </div>
                    <p className={`text-lg font-black ${meta.color}`}>S/ {monto.toFixed(2)}</p>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 bg-slate-800 rounded-2xl px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Receipt size={14} className="text-slate-400" />
                <span className="text-xs font-bold text-slate-300">Total del día</span>
              </div>
              <span className="text-lg font-black text-cyan-400">S/ {totalDia.toFixed(2)}</span>
            </div>
          </div>

          {/* Historial */}
          <div>
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <Clock size={13} className="text-cyan-500" />
              Pagos de hoy ({pagosHoy.length})
            </h2>

            <PageContent
              loading={loadingHistorial}
              error={errorHistorial}
              empty={pagosHoy.length === 0 && !loadingHistorial}
              emptyMessage="Aún no hay pagos registrados hoy."
              onRetry={fetchHistorial}
            >
              <div className="flex flex-col gap-2 max-h-[420px] overflow-y-auto overscroll-contain pr-0.5">
                {[...pagosHoy].reverse().map((pago, index) => (
                  <div
                    key={pago.idPago}
                    className="bg-white border border-slate-200 rounded-2xl p-3 hover:border-slate-300 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                          <Receipt size={12} className="text-cyan-500" />
                        </div>
                        <div>
                          <p className="text-xs font-bold text-gray-900">Cobro #{pagosHoy.length - index}</p>
                          <p className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                            <Clock size={8} />
                            {formatHora(pago.fechaHora)}
                          </p>
                        </div>
                      </div>
                      <span className="text-sm font-black text-slate-800 flex-shrink-0">
                        S/ {pago.total.toFixed(2)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex flex-wrap gap-1.5">
                        {(pago.detallePago ?? []).map((d, i) => {
                          const meta = METODO_META[d.metodoPago as MetodoPago] ?? METODO_META.EFECTIVO;
                          return (
                            <span key={i} className={`text-[10px] font-bold px-2 py-1 rounded-lg ${meta.bg} ${meta.color}`}>
                              {meta.label} S/ {d.monto.toFixed(2)}
                            </span>
                          );
                        })}
                      </div>
                      <div className="flex items-center gap-1.5 flex-shrink-0">
                        <div className="w-5 h-5 rounded-full bg-slate-200 flex items-center justify-center">
                          <span className="text-[9px] font-black text-slate-600 leading-none">
                            {getIniciales(pago.nombreUsuarioCobro)}
                          </span>
                        </div>
                        <span className="text-[10px] font-semibold text-slate-500">
                          {pago.nombreUsuarioCobro}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </PageContent>
          </div>
        </div>
      </div>

      {/* Modal QR Yape — recibe la URL dinámica */}
      {modalQr && <ModalQrYape onClose={() => setModalQr(false)} qrUrl={qrYapeUrl} />}
    </div>
  );
}
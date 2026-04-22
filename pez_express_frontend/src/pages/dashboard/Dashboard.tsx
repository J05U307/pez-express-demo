// src/pages/dashboard/Dashboard.tsx

import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  ShoppingBag,
  UtensilsCrossed,
  CreditCard,
  Package,
  Users,
  ChefHat,
  Settings,
  Clock,
  TrendingUp,
  DollarSign,
  Receipt,
  ArrowRight,
  Layers,
  AlertCircle,
  RefreshCw,
  Banknote,
  Smartphone,
  CheckCircle2,
  Table2,
  BookOpen,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { getPedidosPorFecha } from "../../services/pedidoService";
import { getPagosPorDia } from "../../services/pagoService";
import { getProductos } from "../../services/productoService";
import { getUsuarios } from "../../services/usuarioService";
import { getMesas } from "../../services/mesaService";
import type { Pedido } from "../../types/Pedido";
import type { Pago } from "../../services/pagoService";
import type { Producto } from "../../types/Producto";
import type { Usuario } from "../../types/Usuario";
import type { Mesa } from "../../types/Mesa";

/* ─── Helpers ─────────────────────────────────────────────────── */

function hoy(): string {
  const d = new Date();
  const yyyy = d.getFullYear();
  const mm   = String(d.getMonth() + 1).padStart(2, "0");
  const dd   = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

function formatHora(fechaStr: string) {
  return new Date(fechaStr).toLocaleTimeString("es-PE", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getSaludo(): string {
  const h = new Date().getHours();
  if (h < 12) return "Buenos días";
  if (h < 19) return "Buenas tardes";
  return "Buenas noches";
}

/* ─── Componente: Stat Card ───────────────────────────────────── */

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  iconBg: string;
  to?: string;
  sub?: string;
  subColor?: string;
}

function StatCard({ label, value, icon, iconBg, to, sub, subColor = "text-slate-400" }: StatCardProps) {
  const inner = (
    <div className="bg-white border border-slate-200 rounded-2xl p-4 flex flex-col gap-3 hover:border-cyan-300 hover:shadow-md transition-all duration-200 h-full">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
        {to && (
          <ArrowRight size={14} className="text-slate-300 group-hover:text-cyan-400 transition-colors" />
        )}
      </div>
      <div>
        <p className="text-xs text-slate-400 font-medium">{label}</p>
        <p className="text-2xl font-black text-slate-900 mt-0.5 tabular-nums">{value}</p>
        {sub && <p className={`text-[11px] font-medium mt-1 ${subColor}`}>{sub}</p>}
      </div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="group">
        {inner}
      </Link>
    );
  }
  return inner;
}

/* ─── Componente: Acceso rápido ───────────────────────────────── */

interface AccesoProps {
  label: string;
  to: string;
  icon: React.ReactNode;
  color: string;
  bg: string;
  desc: string;
}

function AccesoCard({ label, to, icon, color, bg, desc }: AccesoProps) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 bg-white border border-slate-200 rounded-2xl px-4 py-3.5 hover:border-slate-300 hover:shadow-md transition-all duration-200"
    >
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${bg} transition-transform group-hover:scale-110 duration-200`}>
        <span className={color}>{icon}</span>
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-bold text-slate-800">{label}</p>
        <p className="text-[11px] text-slate-400 truncate">{desc}</p>
      </div>
      <ArrowRight size={13} className="text-slate-300 group-hover:text-slate-500 flex-shrink-0 transition-colors" />
    </Link>
  );
}

/* ─── Componente: Fila de pedido reciente ─────────────────────── */

function PedidoFila({ pedido }: { pedido: Pedido }) {
  const navigate = useNavigate();
  const abierto = pedido.estadoPedido === "ABIERTO";

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-slate-100 last:border-0">
      <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${
        abierto ? "bg-orange-100" : "bg-slate-100"
      }`}>
        {pedido.tipoPedido === "LLEVAR"
          ? <ShoppingBag size={13} className={abierto ? "text-orange-500" : "text-slate-400"} />
          : <UtensilsCrossed size={13} className={abierto ? "text-orange-500" : "text-slate-400"} />
        }
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-bold text-slate-800">
          Pedido #{pedido.idPedido}
          {pedido.tipoPedido === "MESA" && pedido.idMesa && (
            <span className="ml-1.5 text-slate-400 font-normal">· Mesa {pedido.idMesa}</span>
          )}
          {pedido.tipoPedido === "LLEVAR" && (
            <span className="ml-1.5 text-slate-400 font-normal">· Para llevar</span>
          )}
        </p>
        <p className="text-[10px] text-slate-400 flex items-center gap-1 mt-0.5">
          <Clock size={8} />
          {formatHora(pedido.fechaApertura)}
          <span className="mx-1">·</span>
          {pedido.detalles.length} ítem{pedido.detalles.length !== 1 ? "s" : ""}
        </p>
      </div>
      <div className="flex items-center gap-2 flex-shrink-0">
        <span className="text-xs font-black text-slate-700">S/ {pedido.total.toFixed(2)}</span>
        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full ${
          abierto
            ? "bg-orange-100 text-orange-600"
            : "bg-emerald-100 text-emerald-600"
        }`}>
          {abierto ? "ABIERTO" : "CERRADO"}
        </span>
        {abierto && (
          <button
            onClick={() => navigate("/dashboard/pagos", { state: { pedido } })}
            className="text-[10px] font-bold text-white bg-cyan-500 hover:bg-cyan-600 px-2.5 py-1 rounded-lg transition-colors"
          >
            Cobrar
          </button>
        )}
      </div>
    </div>
  );
}

/* ─── Dashboard MESERO ────────────────────────────────────────── */

interface DashboardMeseroProps {
  usuario: { nombre: string; apellido: string };
  pedidosHoy: Pedido[];
  pagosHoy: Pago[];
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function DashboardMesero({ usuario, pedidosHoy, pagosHoy, loading, error, onRetry }: DashboardMeseroProps) {
  const pedidosAbiertos  = pedidosHoy.filter((p) => p.estadoPedido === "ABIERTO");
  const pedidosCerrados  = pedidosHoy.filter((p) => p.estadoPedido !== "ABIERTO");
  const totalVentasHoy   = pagosHoy.reduce((acc, p) => acc + p.total, 0);
  const ventasEfectivo   = pagosHoy.flatMap((p) => p.detallePago).filter((d) => d.metodoPago === "EFECTIVO").reduce((a, d) => a + d.monto, 0);
  const ventasDigital    = pagosHoy.flatMap((p) => p.detallePago).filter((d) => d.metodoPago !== "EFECTIVO").reduce((a, d) => a + d.monto, 0);

  const accesos: AccesoProps[] = [
    { label: "Pedidos",  to: "/dashboard/pedidos", icon: <UtensilsCrossed size={16} />, color: "text-cyan-600",    bg: "bg-cyan-50",    desc: "Gestionar mesas y pedidos" },
    { label: "Pagos",    to: "/dashboard/pagos",   icon: <CreditCard size={16} />,      color: "text-emerald-600", bg: "bg-emerald-50", desc: "Registrar cobros" },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Saludo */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{getSaludo()}</p>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">
            {usuario.nombre} {usuario.apellido}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Aquí está el resumen de tu turno de hoy</p>
        </div>
        <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-cyan-500 flex items-center justify-center shadow-lg shadow-cyan-500/30">
          <ChefHat size={20} className="text-white" />
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span className="flex-1 font-medium">{error}</span>
          <button onClick={onRetry} className="flex items-center gap-1 text-xs font-bold hover:underline">
            <RefreshCw size={11} /> Reintentar
          </button>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Pedidos hoy"
          value={loading ? "—" : pedidosHoy.length}
          icon={<Receipt size={18} className="text-cyan-600" />}
          iconBg="bg-cyan-50"
          sub={loading ? "" : `${pedidosAbiertos.length} abiertos`}
          subColor={pedidosAbiertos.length > 0 ? "text-orange-500" : "text-slate-400"}
        />
        <StatCard
          label="Pedidos abiertos"
          value={loading ? "—" : pedidosAbiertos.length}
          icon={<UtensilsCrossed size={18} className="text-orange-500" />}
          iconBg="bg-orange-50"
          to="/dashboard/pedidos"
        />
        <StatCard
          label="Ventas del día"
          value={loading ? "—" : `S/ ${totalVentasHoy.toFixed(2)}`}
          icon={<TrendingUp size={18} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          sub={loading ? "" : `${pagosHoy.length} cobros`}
        />
        <StatCard
          label="Pedidos cerrados"
          value={loading ? "—" : pedidosCerrados.length}
          icon={<CheckCircle2 size={18} className="text-slate-500" />}
          iconBg="bg-slate-100"
        />
      </div>

      {/* Resumen ventas por método */}
      {!loading && pagosHoy.length > 0 && (
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
              <Banknote size={16} className="text-emerald-600" />
            </div>
            <div>
              <p className="text-[11px] text-emerald-600 font-semibold">Efectivo</p>
              <p className="text-lg font-black text-emerald-700">S/ {ventasEfectivo.toFixed(2)}</p>
            </div>
          </div>
          <div className="bg-purple-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white flex items-center justify-center flex-shrink-0">
              <Smartphone size={16} className="text-purple-600" />
            </div>
            <div>
              <p className="text-[11px] text-purple-600 font-semibold">Digital (Yape/Plin)</p>
              <p className="text-lg font-black text-purple-700">S/ {ventasDigital.toFixed(2)}</p>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        {/* Accesos rápidos */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Accesos rápidos</h2>
          <div className="flex flex-col gap-2">
            {accesos.map((a) => <AccesoCard key={a.to} {...a} />)}
          </div>
        </div>

        {/* Pedidos abiertos */}
        <div className="flex flex-col gap-3">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
            Pedidos abiertos
            {pedidosAbiertos.length > 0 && (
              <Link to="/dashboard/pedidos" className="text-cyan-500 hover:text-cyan-600 font-bold normal-case text-[11px] flex items-center gap-1">
                Ver todos <ArrowRight size={10} />
              </Link>
            )}
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 min-h-[100px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : pedidosAbiertos.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 gap-2">
                <UtensilsCrossed size={20} className="text-slate-300" />
                <p className="text-xs text-slate-400">No hay pedidos abiertos</p>
              </div>
            ) : (
              pedidosAbiertos.slice(0, 5).map((p) => <PedidoFila key={p.idPedido} pedido={p} />)
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Dashboard ADMINISTRADOR ─────────────────────────────────── */

interface DashboardAdminProps {
  usuario: { nombre: string; apellido: string };
  pedidosHoy: Pedido[];
  pagosHoy: Pago[];
  totalProductos: number;
  totalUsuarios: number;
  totalMesas: number;
  mesasOcupadas: number;
  loading: boolean;
  error: string | null;
  onRetry: () => void;
}

function DashboardAdmin({
  usuario,
  pedidosHoy,
  pagosHoy,
  totalProductos,
  totalUsuarios,
  totalMesas,
  mesasOcupadas,
  loading,
  error,
  onRetry,
}: DashboardAdminProps) {
  const pedidosAbiertos = pedidosHoy.filter((p) => p.estadoPedido === "ABIERTO");
  const totalVentasHoy  = pagosHoy.reduce((acc, p) => acc + p.total, 0);

  const resumenMetodos = useMemo(() => {
    const mapa: Record<string, number> = {};
    for (const pago of pagosHoy) {
      for (const d of pago.detallePago) {
        mapa[d.metodoPago] = (mapa[d.metodoPago] ?? 0) + d.monto;
      }
    }
    return mapa;
  }, [pagosHoy]);

  const accesos: AccesoProps[] = [
    { label: "Pedidos",    to: "/dashboard/pedidos",              icon: <UtensilsCrossed size={16} />, color: "text-cyan-600",    bg: "bg-cyan-50",    desc: "Gestionar mesas y pedidos" },
    { label: "Pagos",      to: "/dashboard/pagos",                icon: <CreditCard size={16} />,      color: "text-emerald-600", bg: "bg-emerald-50", desc: "Historial y cobros del día" },
    { label: "Productos",  to: "/dashboard/productos",            icon: <Package size={16} />,         color: "text-orange-600",  bg: "bg-orange-50",  desc: "Catálogo del menú" },
    { label: "Usuarios",   to: "/dashboard/usuarios",             icon: <Users size={16} />,           color: "text-violet-600",  bg: "bg-violet-50",  desc: "Equipo y accesos" },
    { label: "Cocina",     to: "/dashboard/cocina",               icon: <ChefHat size={16} />,         color: "text-rose-600",    bg: "bg-rose-50",    desc: "Comandas en tiempo real" },
    { label: "Insumos",    to: "/dashboard/insumos",              icon: <Layers size={16} />,          color: "text-amber-600",   bg: "bg-amber-50",   desc: "Control de inventario" },
    { label: "Recetas",    to: "/dashboard/recetas",              icon: <BookOpen size={16} />,          color: "text-teal-600",    bg: "bg-teal-50",    desc: "Configurar mesas" },
    { label: "Ajustes",    to: "/dashboard/configuracion/general",icon: <Settings size={16} />,        color: "text-slate-600",   bg: "bg-slate-100",  desc: "Configuración general" },
  ];

  return (
    <div className="flex flex-col gap-6">

      {/* Saludo */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest">{getSaludo()}</p>
          <h1 className="text-2xl font-black text-slate-900 mt-0.5">
            {usuario.nombre} {usuario.apellido}
          </h1>
          <p className="text-sm text-slate-500 mt-1">Panel de administración · Pez Express</p>
        </div>
        <div className="flex-shrink-0 w-11 h-11 rounded-2xl bg-slate-800 flex items-center justify-center shadow-lg shadow-slate-800/20">
          <TrendingUp size={20} className="text-cyan-400" />
        </div>
      </div>

      {/* Error global */}
      {error && (
        <div className="flex items-center gap-3 px-4 py-3 bg-rose-50 border border-rose-200 rounded-2xl text-sm text-rose-600">
          <AlertCircle size={15} className="flex-shrink-0" />
          <span className="flex-1 font-medium">{error}</span>
          <button onClick={onRetry} className="flex items-center gap-1 text-xs font-bold hover:underline">
            <RefreshCw size={11} /> Reintentar
          </button>
        </div>
      )}

      {/* Stats principales */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <StatCard
          label="Ventas hoy"
          value={loading ? "—" : `S/ ${totalVentasHoy.toFixed(2)}`}
          icon={<DollarSign size={18} className="text-emerald-600" />}
          iconBg="bg-emerald-50"
          sub={loading ? "" : `${pagosHoy.length} cobros`}
          subColor="text-emerald-500"
          to="/dashboard/pagos"
        />
        <StatCard
          label="Pedidos hoy"
          value={loading ? "—" : pedidosHoy.length}
          icon={<Receipt size={18} className="text-cyan-600" />}
          iconBg="bg-cyan-50"
          sub={loading ? "" : `${pedidosAbiertos.length} abiertos`}
          subColor={pedidosAbiertos.length > 0 ? "text-orange-500" : "text-slate-400"}
          to="/dashboard/pedidos"
        />
        <StatCard
          label="Mesas ocupadas"
          value={loading ? "—" : `${mesasOcupadas}/${totalMesas}`}
          icon={<Table2 size={18} className="text-orange-500" />}
          iconBg="bg-orange-50"
          to="/dashboard/pedidos"
        />
        <StatCard
          label="Productos activos"
          value={loading ? "—" : totalProductos}
          icon={<Package size={18} className="text-violet-500" />}
          iconBg="bg-violet-50"
          to="/dashboard/productos"
        />
      </div>

      {/* Fila secundaria stats */}
      <div className="grid grid-cols-3 gap-3">
        {(["EFECTIVO", "YAPE", "PLIN"] as const).map((m) => {
          const monto = resumenMetodos[m] ?? 0;
          const meta = {
            EFECTIVO: { label: "Efectivo",  icon: <Banknote size={15} />,   bg: "bg-emerald-50", border: "border-emerald-200", color: "text-emerald-700" },
            YAPE:     { label: "Yape",      icon: <Smartphone size={15} />, bg: "bg-purple-50",  border: "border-purple-200",  color: "text-purple-700"  },
            PLIN:     { label: "Plin",      icon: <Smartphone size={15} />, bg: "bg-sky-50",     border: "border-sky-200",     color: "text-sky-700"     },
          }[m];
          return (
            <div key={m} className={`rounded-2xl border p-3 flex flex-col gap-1 ${meta.bg} ${meta.border}`}>
              <div className={`flex items-center gap-1.5 ${meta.color}`}>
                {meta.icon}
                <span className="text-[11px] font-bold">{meta.label}</span>
              </div>
              <p className={`text-base font-black ${meta.color}`}>
                {loading ? "—" : `S/ ${monto.toFixed(2)}`}
              </p>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Accesos rápidos — ocupa 2 columnas */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Accesos rápidos</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {accesos.map((a) => <AccesoCard key={a.to} {...a} />)}
          </div>
        </div>

        {/* Columna derecha: pedidos + usuarios */}
        <div className="flex flex-col gap-4">

          {/* Pedidos recientes del día */}
          <div className="flex flex-col gap-3">
            <h2 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest flex items-center justify-between">
              Pedidos del día
              <Link to="/dashboard/reportes" className="text-cyan-500 hover:text-cyan-600 font-bold normal-case text-[11px] flex items-center gap-1">
                Ver <ArrowRight size={10} />
              </Link>
            </h2>
            <div className="bg-white border border-slate-200 rounded-2xl px-4 py-2 min-h-[120px]">
              {loading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="w-5 h-5 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
                </div>
              ) : pedidosHoy.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-8 gap-2">
                  <Receipt size={20} className="text-slate-300" />
                  <p className="text-xs text-slate-400">Sin pedidos hoy</p>
                </div>
              ) : (
                [...pedidosHoy]
                  .reverse()
                  .slice(0, 4)
                  .map((p) => <PedidoFila key={p.idPedido} pedido={p} />)
              )}
            </div>
          </div>

          {/* Mini stat: usuarios y mesas */}
          <div className="grid grid-cols-2 gap-3">
            <Link to="/dashboard/usuarios" className="group bg-white border border-slate-200 rounded-2xl p-3 hover:border-violet-300 hover:shadow-sm transition-all">
              <div className="w-8 h-8 rounded-xl bg-violet-50 flex items-center justify-center mb-2">
                <Users size={15} className="text-violet-500" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Usuarios</p>
              <p className="text-xl font-black text-slate-800">{loading ? "—" : totalUsuarios}</p>
            </Link>
            <Link to="/dashboard/configuracion/mesas" className="group bg-white border border-slate-200 rounded-2xl p-3 hover:border-teal-300 hover:shadow-sm transition-all">
              <div className="w-8 h-8 rounded-xl bg-teal-50 flex items-center justify-center mb-2">
                <Table2 size={15} className="text-teal-500" />
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Mesas total</p>
              <p className="text-xl font-black text-slate-800">{loading ? "—" : totalMesas}</p>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Página principal Dashboard ──────────────────────────────── */

export default function Dashboard() {
  const { usuario } = useAuth();
  const esAdmin = usuario?.rol === "ADMINISTRADOR";

  const [pedidosHoy,    setPedidosHoy]    = useState<Pedido[]>([]);
  const [pagosHoy,      setPagosHoy]      = useState<Pago[]>([]);
  const [productos,     setProductos]     = useState<Producto[]>([]);
  const [usuarios,      setUsuarios]      = useState<Usuario[]>([]);
  const [mesas,         setMesas]         = useState<Mesa[]>([]);
  const [loading,       setLoading]       = useState(true);
  const [error,         setError]         = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);

      if (esAdmin) {
        const [p, pa, prods, users, ms] = await Promise.all([
          getPedidosPorFecha(hoy()),
          getPagosPorDia(hoy()),
          getProductos(),
          getUsuarios(),
          getMesas(),
        ]);
        setPedidosHoy(p);
        setPagosHoy(pa);
        setProductos(prods);
        setUsuarios(users);
        setMesas(ms);
      } else {
        const [p, pa] = await Promise.all([
          getPedidosPorFecha(hoy()),
          getPagosPorDia(hoy()),
        ]);
        setPedidosHoy(p);
        setPagosHoy(pa);
      }
    } catch {
      setError("No se pudieron cargar los datos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  if (!usuario) return null;

  const mesasActivas  = mesas.filter((m) => m.estado === "ACTIVO");
  const mesasOcupadas = mesasActivas.filter((m) => m.disponibilidadEstado === "OCUPADO").length;
  const productosActivos = productos.filter((p) => p.estado === "ACTIVO").length;
  const usuariosActivos  = usuarios.filter((u) => (u as any).estado === "ACTIVO").length || usuarios.length;

  if (esAdmin) {
    return (
      <DashboardAdmin
        usuario={usuario}
        pedidosHoy={pedidosHoy}
        pagosHoy={pagosHoy}
        totalProductos={productosActivos}
        totalUsuarios={usuariosActivos}
        totalMesas={mesasActivas.length}
        mesasOcupadas={mesasOcupadas}
        loading={loading}
        error={error}
        onRetry={fetchData}
      />
    );
  }

  return (
    <DashboardMesero
      usuario={usuario}
      pedidosHoy={pedidosHoy}
      pagosHoy={pagosHoy}
      loading={loading}
      error={error}
      onRetry={fetchData}
    />
  );
}
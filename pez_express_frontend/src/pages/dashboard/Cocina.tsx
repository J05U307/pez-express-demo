// src/pages/dashboard/Cocina.tsx

import {
  ChefHat, Clock, Flame, AlertTriangle,
  UtensilsCrossed, MessageSquare,
  ShoppingBag, Ban, Wifi, WifiOff,
} from "lucide-react";
import { useCocinaSocket } from "../../hooks/useWebSocket";
import type { Comanda } from "../../types/Comanda";

/* ─── Helpers ──────────────────────────────────────────────────── */

function formatHora(fechaStr: string) {
  return new Date(fechaStr).toLocaleTimeString("es-PE", {
    hour: "2-digit", minute: "2-digit",
  });
}

function minutosDesde(fechaStr: string): number {
  return Math.floor((Date.now() - new Date(fechaStr).getTime()) / 60_000);
}

/* ─── Tipos agrupados ──────────────────────────────────────────── */

interface GrupoPedido {
  idPedido:   number;
  idMesa:     number | null;
  comandas:   Comanda[];
  horaMin:    string;
  minutosMax: number;
}

function agruparPorPedido(comandas: Comanda[]): GrupoPedido[] {
  const map = new Map<number, Comanda[]>();
  for (const c of comandas) {
    if (!map.has(c.idPedido)) map.set(c.idPedido, []);
    map.get(c.idPedido)!.push(c);
  }
  return Array.from(map.entries())
    .map(([idPedido, items]) => {
      const horaMin    = items.reduce((a, b) => a.fechaHora < b.fechaHora ? a : b).fechaHora;
      // El tiempo urgente se calcula sobre la comanda NUEVO más antigua
      const nuevos     = items.filter(c => c.tipo === "NUEVO");
      const minutosMax = nuevos.length > 0
        ? Math.max(...nuevos.map(c => minutosDesde(c.fechaHora)))
        : 0;
      return { idPedido, idMesa: items[0].idMesa, comandas: items, horaMin, minutosMax };
    })
    // Más urgentes primero (más tiempo esperando)
    .sort((a, b) => b.minutosMax - a.minutosMax);
}

/* ════════════════════════════════════════════════════════════════
   FilaComanda
   ════════════════════════════════════════════════════════════════ */

function FilaComanda({ comanda }: { comanda: Comanda }) {
  const esCancelado = comanda.tipo === "CANCELADO";
  const mins        = minutosDesde(comanda.fechaHora);

  if (esCancelado) {
    return (
      <div className="flex items-center gap-3 bg-red-50 border border-red-200 rounded-2xl px-3 py-2.5">
        <div className="w-7 h-7 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
          <Ban size={13} className="text-red-400" />
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-sm font-bold text-red-400 line-through truncate block">
            {comanda.cantidad}× {comanda.nombreProducto}
          </span>
          {comanda.observacion?.trim() && (
            <span className="text-[11px] text-red-400 flex items-center gap-1 mt-0.5">
              <MessageSquare size={9} />
              {comanda.observacion}
            </span>
          )}
        </div>
        <span className="text-[10px] font-black text-red-400 bg-red-100 px-2 py-0.5 rounded-full flex-shrink-0">
          CANCELADO
        </span>
      </div>
    );
  }

  // NUEVO — sin lógica de estado, solo urgencia por tiempo
  return (
    <div className="flex items-center gap-3 bg-white border border-gray-200 rounded-2xl px-3 py-2.5">
      <div className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0 font-black text-sm text-gray-700">
        {comanda.cantidad}
      </div>
      <div className="flex-1 min-w-0">
        <span className="text-sm font-bold text-gray-900 truncate block">
          {comanda.nombreProducto}
        </span>
        {comanda.observacion?.trim() && (
          <span className="text-[11px] text-amber-600 flex items-center gap-1 mt-0.5 font-medium">
            <MessageSquare size={9} />
            {comanda.observacion}
          </span>
        )}
      </div>
      <span className={`
        text-[11px] font-bold tabular-nums flex-shrink-0
        ${mins >= 15 ? "text-red-500" : mins >= 8 ? "text-amber-500" : "text-gray-400"}
      `}>
        {mins}m
      </span>
      <div className="w-7 h-7 rounded-xl bg-gray-100 flex items-center justify-center flex-shrink-0">
        <Clock size={14} className={mins >= 15 ? "text-red-400" : mins >= 8 ? "text-amber-400" : "text-gray-400"} />
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   TicketPedido
   ════════════════════════════════════════════════════════════════ */

function TicketPedido({ grupo }: { grupo: GrupoPedido }) {
  const mins        = grupo.minutosMax;
  const urgente     = mins >= 15;
  const advertencia = mins >= 8 && !urgente;
  const nuevos      = grupo.comandas.filter(c => c.tipo === "NUEVO");
  const cancelados  = grupo.comandas.filter(c => c.tipo === "CANCELADO");

  const accentBorder = urgente     ? "border-t-red-400"
                     : advertencia ? "border-t-amber-400"
                                   : "border-t-cyan-400";

  return (
    <div className={`
      bg-white rounded-2xl border border-gray-200 border-t-4 overflow-hidden
      transition-all duration-200 hover:shadow-md shadow-sm
      ${accentBorder}
      ${urgente ? "shadow-md shadow-red-100" : ""}
    `}>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          {urgente && (
            <span className="relative flex h-2.5 w-2.5 flex-shrink-0">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
          )}
          <div className={`
            w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0
            ${grupo.idMesa ? "bg-cyan-100" : "bg-orange-100"}
          `}>
            {grupo.idMesa
              ? <UtensilsCrossed size={15} className="text-cyan-600" />
              : <ShoppingBag    size={15} className="text-orange-500" />
            }
          </div>
          <div>
            <p className="text-sm font-black text-gray-900 leading-none">
              Pedido #{grupo.idPedido}
            </p>
            <p className="text-[11px] font-medium mt-0.5">
              {grupo.idMesa
                ? <span className="text-gray-400 flex items-center gap-1">
                    <UtensilsCrossed size={9} /> Mesa {grupo.idMesa}
                  </span>
                : <span className="text-orange-500">Para llevar</span>
              }
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Badge cantidad de ítems activos */}
          <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded-xl">
            {nuevos.length} {nuevos.length === 1 ? "ítem" : "ítems"}
          </span>

          {/* Badge tiempo */}
          <div className={`
            flex items-center gap-1 px-2 py-1 rounded-xl
            ${urgente     ? "bg-red-100   text-red-600"
            : advertencia ? "bg-amber-100 text-amber-600"
                          : "bg-gray-100  text-gray-500"}
          `}>
            <Clock size={11} />
            <span className="text-xs font-black tabular-nums">{mins}m</span>
          </div>
        </div>
      </div>

      {/* Sub-header */}
      <div className="flex items-center justify-between px-4 py-1.5 bg-gray-50 border-b border-gray-100">
        <span className="text-[11px] text-gray-400 font-mono">
          Ingresó: {formatHora(grupo.horaMin)}
        </span>
        {cancelados.length > 0 && (
          <span className="text-[11px] text-red-400 font-semibold flex items-center gap-1">
            <Ban size={9} />
            {cancelados.length} cancelado{cancelados.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {/* Filas — primero NUEVO, luego CANCELADO al final */}
      <div className="flex flex-col gap-2 p-3">
        {nuevos.map(c => <FilaComanda key={c.idComanda} comanda={c} />)}
        {cancelados.map(c => <FilaComanda key={c.idComanda} comanda={c} />)}
      </div>
    </div>
  );
}

/* ════════════════════════════════════════════════════════════════
   Cocina — página principal
   ════════════════════════════════════════════════════════════════ */

export default function Cocina() {
  const { comandas, conectado } = useCocinaSocket();
  const grupos = agruparPorPedido(comandas);

  const totalNuevos    = comandas.filter(c => c.tipo === "NUEVO").length;
  const totalCancelados = comandas.filter(c => c.tipo === "CANCELADO").length;

  return (
    <div className="text-gray-800 pb-8">

      {/* Header */}
      <div className="mb-6 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <ChefHat size={24} className="text-cyan-500" />
            Cocina
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Comandas en tiempo real · Pez Express
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Contador ítems activos */}
          {totalNuevos > 0 && (
            <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-2 rounded-xl border border-gray-200">
              <Flame size={12} className="text-gray-500" />
              <span className="text-xs font-bold text-gray-600 tabular-nums">{totalNuevos}</span>
              <span className="text-[10px] text-gray-400 hidden sm:inline">pendientes</span>
            </div>
          )}

          {/* Contador cancelados */}
          {totalCancelados > 0 && (
            <div className="flex items-center gap-1.5 bg-red-50 px-3 py-2 rounded-xl border border-red-200">
              <Ban size={12} className="text-red-400" />
              <span className="text-xs font-bold text-red-500 tabular-nums">{totalCancelados}</span>
              <span className="text-[10px] text-red-400 hidden sm:inline">cancelados</span>
            </div>
          )}

          {/* Badge conexión */}
          <div className={`
            flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition-all duration-300
            ${conectado
              ? "bg-green-50 border-green-200 text-green-600"
              : "bg-red-50   border-red-200   text-red-500"}
          `}>
            {conectado ? (
              <>
                <Wifi size={13} />
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                En vivo
              </>
            ) : (
              <>
                <WifiOff size={13} />
                Reconectando...
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sin conexión */}
      {!conectado && comandas.length === 0 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 mb-6">
          <AlertTriangle size={16} className="text-amber-400 flex-shrink-0" />
          <span className="text-sm text-amber-600 font-medium">
            Conectando con el servidor... las comandas aparecerán automáticamente.
          </span>
        </div>
      )}

      {/* Sin comandas */}
      {conectado && grupos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <div className="w-16 h-16 rounded-2xl bg-gray-100 border border-gray-200 flex items-center justify-center">
            <ChefHat size={28} className="text-gray-300" />
          </div>
          <p className="text-gray-500 font-semibold">Sin comandas pendientes</p>
          <p className="text-gray-400 text-sm">Todo al día 🎉</p>
        </div>
      )}

      {/* Grid de pedidos */}
      {grupos.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {grupos.map(grupo => (
            <TicketPedido key={grupo.idPedido} grupo={grupo} />
          ))}
        </div>
      )}
    </div>
  );
}
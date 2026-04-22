// src/pages/dashboard/Mesas.tsx

import { useEffect, useState } from "react";
import { LayoutGrid, Plus, Utensils, AlertCircle } from "lucide-react";
import { getMesas, createMesa } from "../../../services/mesaService";
import type { Mesa } from "../../../types/Mesa";
import { PageHeader } from "../../../components/ui/pages/PageHeader";
import { StatCards } from "../../../components/ui/pages/StatCards";
import type { Stat } from "../../../components/ui/pages/StatCards";
import { SearchBar } from "../../../components/ui/pages/SearchBar";
import { PageContent } from "../../../components/ui/pages/Pagecontent";

/* ─── Componente ──────────────────────────────────────────────── */

export default function Mesas() {
  const [mesas, setMesas]           = useState<Mesa[]>([]);
  const [loading, setLoading]       = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch]         = useState("");
  const [creating, setCreating]     = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const fetchMesas = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      setMesas(await getMesas());
    } catch {
      setFetchError("No se pudieron cargar las mesas. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchMesas(); }, []);

  const handleCrearMesa = async () => {
    try {
      setCreating(true);
      const nueva = await createMesa();
      setMesas((prev) => [...prev, nueva]);
    } catch {
      setFetchError("No se pudo crear la mesa. Intenta de nuevo.");
    } finally {
      setCreating(false);
    }
  };

  const filtered = mesas.filter((m) =>
    `mesa ${m.numeroMesa} ${m.disponibilidadEstado}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const stats: Stat[] = [
    { label: "Total",    value: mesas.length,                                                     accent: "text-gray-900"   },
    { label: "Libres",   value: mesas.filter((m) => m.disponibilidadEstado === "LIBRE").length,   accent: "text-cyan-600"   },
    { label: "Ocupadas", value: mesas.filter((m) => m.disponibilidadEstado === "OCUPADO").length, accent: "text-orange-500" },
  ];

  const estadoConfig: Record<string, { bg: string; text: string; border: string; dot: string; label: string }> = {
    LIBRE: {
      bg: "bg-cyan-50",
      text: "text-cyan-600",
      border: "border-cyan-200",
      dot: "bg-cyan-500",
      label: "Libre",
    },
    OCUPADO: {
      bg: "bg-orange-50",
      text: "text-orange-500",
      border: "border-orange-200",
      dot: "bg-orange-500",
      label: "Ocupada",
    },
  };

  return (
    <div className="text-gray-800">
      <PageHeader
        icon={<LayoutGrid size={24} className="text-cyan-500" />}
        title="Mesas"
        subtitle="Administra las mesas del restaurante"
        action={
          <button
            onClick={() => setConfirmOpen(true)}
            disabled={creating}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">
              {creating ? "Creando..." : "Nueva Mesa"}
            </span>
            <span className="sm:hidden">
              {creating ? "..." : "Nueva"}
            </span>
          </button>
        }
      />

      <StatCards stats={stats} loading={loading} />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por número o estado..."
      />

      <PageContent
        loading={loading}
        error={fetchError}
        empty={filtered.length === 0}
        emptyMessage={
          search
            ? `No se encontraron mesas para "${search}".`
            : "No hay mesas registradas aún."
        }
        onRetry={fetchMesas}
      >
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
          {filtered.map((mesa, index) => {
            const config = estadoConfig[mesa.disponibilidadEstado] ?? estadoConfig["LIBRE"];

            return (
              <div
                key={mesa.idMesa}
                className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-cyan-400 hover:shadow-md transition-all duration-200 flex flex-col items-center gap-3"
              >
                {/* Número correlativo */}
                <div className="text-xs text-gray-400 self-start">#{index + 1}</div>

                {/* Icono mesa */}
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${config.bg} ${config.text}`}>
                  <Utensils size={28} />
                </div>

                {/* Número de mesa */}
                <div className="text-center">
                  <h3 className="font-bold text-gray-900 text-lg leading-tight">
                    Mesa {mesa.numeroMesa}
                  </h3>
                </div>

                {/* Estado disponibilidad */}
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${config.bg} ${config.text} ${config.border}`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${config.dot}`} />
                  {config.label}
                </span>
              </div>
            );
          })}
        </div>
      </PageContent>

      {/* ── Modal de confirmación ── */}
      {confirmOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm mx-4 flex flex-col gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-cyan-50 flex items-center justify-center text-cyan-500 flex-shrink-0">
                <AlertCircle size={22} />
              </div>
              <div>
                <h2 className="font-bold text-gray-900 text-base">¿Crear nueva mesa?</h2>
                <p className="text-sm text-gray-500 mt-0.5">Se agregará una nueva mesa al sistema.</p>
              </div>
            </div>

            <div className="flex gap-3 pt-1">
              <button
                onClick={() => setConfirmOpen(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={async () => {
                  setConfirmOpen(false);
                  await handleCrearMesa();
                }}
                disabled={creating}
                className="flex-1 px-4 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {creating ? "Creando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
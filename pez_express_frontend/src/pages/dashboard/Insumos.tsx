// src/pages/dashboard/Insumos.tsx

import { useEffect, useState } from "react";
import { Plus, Pencil, AlertTriangle, ShoppingBasket} from "lucide-react";
import InsumoModal from "./components/InsumoModal";
import type { InsumoFormData } from "./components/InsumoModal";
import { getInsumos, createInsumo, updateInsumo } from "../../services/insumoService";
import type { Insumo } from "../../types/Insusmo";
import type { UnidadMedida } from "../../types/common";
import { PageHeader } from "../../components/ui/pages/PageHeader";
import { StatCards } from "../../components/ui/pages/StatCards";
import type { Stat } from "../../components/ui/pages/StatCards";
import { SearchBar } from "../../components/ui/pages/SearchBar";
import { PageContent } from "../../components/ui/pages/Pagecontent";

/* ─── Helpers ─────────────────────────────────────────────────── */

const UNIT_COLOR: Record<string, string> = {
  UNIDAD:  "bg-blue-50 text-blue-600",
  KG:      "bg-orange-50 text-orange-600",
  LITRO:   "bg-teal-50 text-teal-600",
  PORCION: "bg-yellow-50 text-yellow-600",
};

function toFormData(insumo: Insumo): InsumoFormData {
  return {
    nombre:       insumo.nombre,
    unidadMedida: insumo.unidadMedida as UnidadMedida,
    stockActual:  insumo.stockActual,
    estado:       insumo.estado as "ACTIVO" | "INACTIVO",
  };
}

/* ─── Componente ──────────────────────────────────────────────── */

export default function Insumos() {
  const [insumos, setInsumos]           = useState<Insumo[]>([]);
  const [loading, setLoading]           = useState(true);
  const [fetchError, setFetchError]     = useState<string | null>(null);
  const [search, setSearch]             = useState("");
  const [modalOpen, setModalOpen]       = useState(false);
  const [editingInsumo, setEditingInsumo] = useState<Insumo | null>(null);

  const fetchInsumos = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      setInsumos(await getInsumos());
    } catch {
      setFetchError("No se pudieron cargar los insumos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInsumos(); }, []);

  const openCreate = () => { setEditingInsumo(null); setModalOpen(true); };
  const openEdit   = (insumo: Insumo) => { setEditingInsumo(insumo); setModalOpen(true); };

  const handleSave = async (data: InsumoFormData): Promise<void> => {
    if (editingInsumo) {
      const updated = await updateInsumo(editingInsumo.idInsumo, data);
      setInsumos((prev) => prev.map((i) => (i.idInsumo === editingInsumo.idInsumo ? updated : i)));
    } else {
      const created = await createInsumo(data);
      setInsumos((prev) => [created, ...prev]);
    }
  };

  const filtered = insumos.filter((i) =>
    i.nombre.toLowerCase().includes(search.toLowerCase())
  );

  const stats: Stat[] = [
    { label: "Total",     value: insumos.length,                                        accent: "text-gray-900" },
    { label: "Activos",   value: insumos.filter((i) => i.estado === "ACTIVO").length,   accent: "text-cyan-600" },
    { label: "Inactivos", value: insumos.filter((i) => i.estado === "INACTIVO").length, accent: "text-gray-400" },
    { label: "Sin stock", value: insumos.filter((i) => i.stockActual === 0).length,     accent: "text-red-500"  },
  ];

  return (
    <div className="text-gray-800">
      <PageHeader
        icon={<ShoppingBasket size={24} className="text-cyan-500" />}
        title="Insumos"
        subtitle="Gestiona los insumos de Pez Express"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Insumo</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        }
      />

      <StatCards stats={stats} loading={loading} />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar insumo..."
      />

      <PageContent
        loading={loading}
        error={fetchError}
        empty={filtered.length === 0}
        emptyMessage={
          search
            ? `No se encontraron insumos para "${search}".`
            : "No hay insumos registrados aún."
        }
        onRetry={fetchInsumos}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((insumo) => {
            const sinStock   = insumo.stockActual === 0;
            const stockBajo  = insumo.stockActual > 0 && insumo.stockActual < 5;


            return (
              <div
                key={insumo.idInsumo}
                className={`
                  bg-white border rounded-2xl p-5
                  hover:border-cyan-400 hover:shadow-md
                  transition-all duration-200
                  ${sinStock ? "border-red-200" : "border-gray-200"}
                `}
              >
                {/* Top */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                      {insumo.nombre}
                    </h3>
                    <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${UNIT_COLOR[insumo.unidadMedida] ?? "bg-gray-100 text-gray-500"}`}>
                        {insumo.unidadMedida}
                      </span>
                      <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${insumo.estado === "ACTIVO" ? "bg-cyan-50 text-cyan-600 border-cyan-200" : "bg-gray-100 text-gray-400 border-gray-200"}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${insumo.estado === "ACTIVO" ? "bg-cyan-500" : "bg-gray-400"}`} />
                        {insumo.estado}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={() => openEdit(insumo)} className="p-2 text-gray-400 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors">
                      <Pencil size={15} />
                    </button>
                  </div>
                </div>

                {/* Stock bar */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs text-gray-400">Stock actual</span>
                    {sinStock && (
                      <span className="flex items-center gap-1 text-xs text-red-500 font-medium">
                        <AlertTriangle size={11} /> Sin stock
                      </span>
                    )}
                    {stockBajo && (
                      <span className="flex items-center gap-1 text-xs text-amber-500 font-medium">
                        <AlertTriangle size={11} /> Stock bajo
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${sinStock ? "bg-red-400" : stockBajo ? "bg-amber-400" : "bg-cyan-500"}`}
                        style={{ width: `${Math.min(100, (insumo.stockActual / 20) * 100)}%` }}
                      />
                    </div>
                    <span className={`text-lg font-bold w-8 text-right ${sinStock ? "text-red-500" : stockBajo ? "text-amber-500" : "text-gray-900"}`}>
                      {insumo.stockActual}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PageContent>

      <InsumoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editingInsumo ? toFormData(editingInsumo) : null}
        isEditing={!!editingInsumo}
      />
    </div>
  );
}
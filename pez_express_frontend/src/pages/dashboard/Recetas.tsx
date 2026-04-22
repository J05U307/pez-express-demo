// src/pages/dashboard/Recetas.tsx

import { useEffect, useState } from "react";
import { BookOpen, Plus, Pencil, FlaskConical, Package } from "lucide-react";
import { getRecetas, createReceta, updateReceta } from "../../services/recetaService";
import { getProductos } from "../../services/productoService";
import { getInsumos } from "../../services/insumoService";
import type { Receta } from "../../types/Receta";
import type { Producto } from "../../types/Producto";
import type { Insumo } from "../../types/Insusmo";
import type { RecetaCreateDTO, RecetaDetalleDTO } from "../../types/dtos/RecetaDetalleDTO";
import RecetaModal from "./components/RecetaModal";
import { PageHeader } from "../../components/ui/pages/PageHeader";
import { StatCards } from "../../components/ui/pages/StatCards";
import type { Stat } from "../../components/ui/pages/StatCards";
import { SearchBar } from "../../components/ui/pages/SearchBar";
import { PageContent } from "../../components/ui/pages/Pagecontent";

/* ─── Helpers ─────────────────────────────────────────────────── */

const UNIDAD_COLOR: Record<string, string> = {
  UNIDAD: "bg-blue-50 text-blue-600",
  KG: "bg-orange-50 text-orange-600",
  LITRO: "bg-teal-50 text-teal-600",
  PORCION: "bg-yellow-50 text-yellow-700",
};

/* ─── Componente ──────────────────────────────────────────────── */

export default function Recetas() {
  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [insumos, setInsumos] = useState<Insumo[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);



  // null = crear, number = idProducto a editar
  const [editingIdProducto, setEditingIdProducto] = useState<number | null>(null);

  /* ── Carga de datos ── */
  const fetchAll = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      const [r, p, i] = await Promise.all([getRecetas(), getProductos(), getInsumos()]);
      setRecetas(Array.isArray(r) ? r : []);
      setProductos(Array.isArray(p) ? p : []);
      setInsumos(Array.isArray(i) ? i : []);
    } catch {
      setFetchError("No se pudieron cargar los datos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  // Solo recarga recetas (más ligero, para después de crear/editar)
  const refetchRecetas = async () => {
    try {
      const r = await getRecetas();
      setRecetas(Array.isArray(r) ? r : []);
    } catch {
      // silencioso
    }
  };

  useEffect(() => { fetchAll(); }, []);

  /* ── Abrir modal ── */
  const openCreate = () => { setEditingIdProducto(null); setModalOpen(true); };
  const openEdit = (idProducto: number) => { setEditingIdProducto(idProducto); setModalOpen(true); };

  /* ── Guardar — siempre recarga tras éxito ── */
  const handleSave = async (dto: RecetaCreateDTO): Promise<void> => {
    if (editingIdProducto) {
      await updateReceta(dto);
    } else {
      await createReceta(dto);
    }
    // El backend no devuelve el objeto creado/actualizado,
    // así que recargamos la lista desde el servidor.
    await refetchRecetas();
  };


  const productosConReceta = new Set(recetas.map((r) => r.idProducto));
  const productosParaReceta = productos.filter((p) => p.manejoStock === false);          // ← solo los que NO manejan stock
  const productosSinReceta = productosParaReceta.filter((p) => !productosConReceta.has(p.idProducto));


  const editingDetalles: RecetaDetalleDTO[] | undefined = editingIdProducto
    ? recetas
      .find((r) => r.idProducto === editingIdProducto)
      ?.receta.map((d) => ({ idInsumo: d.IdInsumo, cantidadUsada: d.cantidadUsada }))
    : undefined;

  const filtered = recetas.filter((r) =>
    r.nombreProducto.toLowerCase().includes(search.toLowerCase())
  );

  const stats: Stat[] = [
    { label: "Recetas", value: recetas.length, accent: "text-gray-900" },
    { label: "Productos", value: productosParaReceta.length, accent: "text-cyan-600" },  // ← solo los relevantes
    { label: "Sin receta", value: productosSinReceta.length, accent: "text-amber-500" },
    { label: "Insumos", value: insumos.length, accent: "text-purple-500" },
  ];

  return (
    <div className="text-gray-800">
      <PageHeader
        icon={<BookOpen size={24} className="text-cyan-500" />}
        title="Recetas"
        subtitle="Define los insumos de cada producto"
        action={
          <button
            onClick={openCreate}
            disabled={productosSinReceta.length === 0 && !loading}
            title={productosSinReceta.length === 0 ? "Todos los productos ya tienen receta" : ""}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nueva Receta</span>
            <span className="sm:hidden">Nueva</span>
          </button>
        }
      />

      <StatCards stats={stats} loading={loading} />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre de producto..."
      />

      <PageContent
        loading={loading}
        error={fetchError}
        empty={filtered.length === 0}
        emptyMessage={
          search
            ? `No se encontraron recetas para "${search}".`
            : "No hay recetas registradas aún."
        }
        onRetry={fetchAll}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((receta) => (
            <div
              key={receta.idProducto}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-cyan-400 hover:shadow-md transition-all duration-200"
            >
              {/* Header */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-9 h-9 rounded-xl bg-cyan-50 flex items-center justify-center flex-shrink-0">
                    <FlaskConical size={16} className="text-cyan-500" />
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-semibold text-gray-900 text-sm leading-tight truncate">
                      {receta.nombreProducto}
                    </h3>
                    <p className="text-[11px] text-gray-400 mt-0.5">
                      {receta.receta.length} {receta.receta.length === 1 ? "insumo" : "insumos"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => openEdit(receta.idProducto)}
                  className="p-2 text-gray-400 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors flex-shrink-0"
                  title="Editar receta"
                >
                  <Pencil size={15} />
                </button>
              </div>

              {/* Insumos */}
              <div className="flex flex-col gap-2">
                {receta.receta.map((detalle, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-2 px-3 py-2 bg-slate-50 rounded-xl"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Package size={12} className="text-slate-400 flex-shrink-0" />
                      <span className="text-sm text-gray-700 font-medium truncate">
                        {detalle.nombreInsumo}
                      </span>
                    </div>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <span className="text-sm font-bold text-gray-900">
                        {detalle.cantidadUsada % 1 === 0
                          ? detalle.cantidadUsada
                          : detalle.cantidadUsada.toFixed(2)}
                      </span>
                      <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${UNIDAD_COLOR[detalle.unidadMedida] ?? "bg-gray-100 text-gray-500"}`}>
                        {detalle.unidadMedida}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </PageContent>

      <RecetaModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        productos={productosSinReceta}
        insumos={insumos}
        editingIdProducto={editingIdProducto}
        initialDetalles={editingDetalles}
      />
    </div>
  );
}
// src/pages/dashboard/Productos.tsx

import { useEffect, useState } from "react";
import {
  Plus,
  Pencil,
  Layers,
  Printer,
  PrinterCheck,
  Package
} from "lucide-react";
import ProductoModal from "./components/ProductoModal";
import {
  getProductos,
  createProducto,
  updateProducto,
} from "../../services/productoService";
import type { Producto, TipoProducto } from "../../types/Producto";
import type { ProductoCreateDTO } from "../../types/dtos/ProductoCreateDTO";
import { PageHeader } from "../../components/ui/pages/PageHeader";
import { StatCards } from "../../components/ui/pages/StatCards";
import type { Stat } from "../../components/ui/pages/StatCards";
import { SearchBar } from "../../components/ui/pages/SearchBar";
import { PageContent } from "../../components/ui/pages/Pagecontent";

/* ─── Helpers ─────────────────────────────────────────────────── */

const TIPO_COLOR: Record<TipoProducto, string> = {
  PLATO:   "bg-orange-50 text-orange-600",
  BEBIDA_ENVASA:  "bg-blue-50 text-blue-600",
  BEBIDA_PREPARADA: "bg-yellow-50 text-yellow-700",
  GUARNICION:  "bg-pink-50 text-pink-600",
  EXTRA:    "bg-gray-100 text-gray-500",
};

function toDTO(p: Producto): ProductoCreateDTO {
  return {
    nombre:        p.nombre,
    descripcion:   p.descripcion,
    precio:        p.precio,
    manejoStock:   p.manejoStock,
    imprimeCocina: p.imprimeCocina,
    tipoProducto:  p.tipoProducto,
    stockActual:   p.stockActual ?? undefined,
    estado:        p.estado,
  };
}

/* ─── Componente ──────────────────────────────────────────────── */

export default function Productos() {
  const [productos, setProductos]         = useState<Producto[]>([]);
  const [loading, setLoading]             = useState(true);
  const [fetchError, setFetchError]       = useState<string | null>(null);
  const [search, setSearch]               = useState("");
  const [modalOpen, setModalOpen]         = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | null>(null);

  const fetchProductos = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      setProductos(await getProductos());
    } catch {
      setFetchError("No se pudieron cargar los productos. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchProductos(); }, []);

  const openCreate = () => { setEditingProducto(null); setModalOpen(true); };
  const openEdit   = (p: Producto) => { setEditingProducto(p); setModalOpen(true); };

  const handleSave = async (data: ProductoCreateDTO): Promise<void> => {
    if (editingProducto) {
      const updated = await updateProducto(editingProducto.idProducto, data);
      setProductos((prev) =>
        prev.map((p) => (p.idProducto === editingProducto.idProducto ? updated : p))
      );
    } else {
      const created = await createProducto(data);
      setProductos((prev) => [created, ...prev]);
    }
  };


  const filtered = productos.filter((p) =>
    `${p.nombre} ${p.tipoProducto}`.toLowerCase().includes(search.toLowerCase())
  );

  const stats: Stat[] = [
    { label: "Total",       value: productos.length,                                          accent: "text-gray-900"   },
    { label: "Activos",     value: productos.filter((p) => p.estado === "ACTIVO").length,     accent: "text-cyan-600"   },
    { label: "Con stock",   value: productos.filter((p) => p.manejoStock).length,             accent: "text-blue-500"   },
    { label: "Inactivos",   value: productos.filter((p) => p.estado === "INACTIVO").length,   accent: "text-gray-400"   },
  ];

  return (
    <div className="text-gray-800">
      <PageHeader
        icon={<Package size={24} className="text-cyan-500" />}
        title="Productos"
        subtitle="Gestiona la carta de Pez Express"
        action={
          <button
            onClick={openCreate}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Producto</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        }
      />

      <StatCards stats={stats} loading={loading} />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre o tipo..."
      />

      <PageContent
        loading={loading}
        error={fetchError}
        empty={filtered.length === 0}
        emptyMessage={
          search
            ? `No se encontraron productos para "${search}".`
            : "No hay productos registrados aún."
        }
        onRetry={fetchProductos}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((producto) => {

            const sinStock    = producto.manejoStock && producto.stockActual === 0;
            const stockBajo   = producto.manejoStock && (producto.stockActual ?? 0) > 0 && (producto.stockActual ?? 0) < 5;

            return (
              <div
                key={producto.idProducto}
                className={`
                  bg-white border rounded-2xl p-5
                  hover:border-cyan-400 hover:shadow-md
                  transition-all duration-200
                  ${sinStock ? "border-red-200" : "border-gray-200"}
                `}
              >
                {/* Top: nombre + acciones */}
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 text-base leading-tight truncate">
                      {producto.nombre}
                    </h3>
                    <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-relaxed">
                      {producto.descripcion}
                    </p>
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => openEdit(producto)}
                      className="p-2 text-gray-400 hover:text-cyan-500 hover:bg-cyan-50 rounded-lg transition-colors"
                    >
                      <Pencil size={15} />
                    </button>
                    
                  </div>
                </div>

                {/* Badges: tipo + estado */}
                <div className="flex items-center gap-2 flex-wrap mb-4">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-lg ${TIPO_COLOR[producto.tipoProducto] ?? "bg-gray-100 text-gray-500"}`}>
                    {producto.tipoProducto}
                  </span>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border ${
                    producto.estado === "ACTIVO"
                      ? "bg-cyan-50 text-cyan-600 border-cyan-200"
                      : "bg-gray-100 text-gray-400 border-gray-200"
                  }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${producto.estado === "ACTIVO" ? "bg-cyan-500" : "bg-gray-400"}`} />
                    {producto.estado}
                  </span>
                </div>

                {/* Footer: precio + indicadores */}
                <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                  {/* Precio */}
                  <span className="text-lg font-bold text-gray-900">
                    S/ {producto.precio.toFixed(2)}
                  </span>

                  {/* Indicadores */}
                  <div className="flex items-center gap-2">
                    {/* Imprime cocina */}
                    <span
                      title={producto.imprimeCocina ? "Imprime en cocina" : "No imprime en cocina"}
                      className={`p-1.5 rounded-lg ${producto.imprimeCocina ? "bg-cyan-50 text-cyan-500" : "bg-gray-100 text-gray-300"}`}
                    >
                      {producto.imprimeCocina ? <PrinterCheck size={14} /> : <Printer size={14} />}
                    </span>

                    {/* Stock (solo si aplica) */}
                    {producto.manejoStock ? (
                      <span
                        title={`Stock: ${producto.stockActual}`}
                        className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold ${
                          sinStock
                            ? "bg-red-50 text-red-500"
                            : stockBajo
                            ? "bg-amber-50 text-amber-500"
                            : "bg-green-50 text-green-600"
                        }`}
                      >
                        <Layers size={11} />
                        {producto.stockActual}
                      </span>
                    ) : (
                      <span
                        title="Sin manejo de stock"
                        className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-gray-50 text-gray-400"
                      >
                        <Layers size={11} />
                        —
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PageContent>

      <ProductoModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={handleSave}
        initial={editingProducto ? toDTO(editingProducto) : null}
        isEditing={!!editingProducto}
      />
    </div>
  );
}
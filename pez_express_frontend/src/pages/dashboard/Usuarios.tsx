// src/pages/dashboard/Usuarios.tsx

import { useEffect, useState } from "react";
import { Users, Plus } from "lucide-react";
import { getUsuarios, cambiarEstadoUsuario } from "../../services/usuarioService";
import type { Usuario } from "../../types/Usuario";
import type { Estado } from "../../types/common";
import NuevoUsuarioModal from "./components/NuevoUsuarioModal";
import { PageHeader } from "../../components/ui/pages/PageHeader";
import { StatCards } from "../../components/ui/pages/StatCards";
import type { Stat } from "../../components/ui/pages/StatCards";
import { SearchBar } from "../../components/ui/pages/SearchBar";
import { PageContent } from "../../components/ui/pages/Pagecontent";

/* ─── Componente ──────────────────────────────────────────────── */

export default function Usuarios() {
  const [usuarios, setUsuarios]   = useState<Usuario[]>([]);
  const [loading, setLoading]     = useState(true);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [search, setSearch]       = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [toggling, setToggling]   = useState<Set<number>>(new Set());

  const fetchUsuarios = async () => {
    try {
      setLoading(true);
      setFetchError(null);
      setUsuarios(await getUsuarios());
    } catch {
      setFetchError("No se pudieron cargar los usuarios. Intenta de nuevo.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchUsuarios(); }, []);

  const handleToggleEstado = async (usuario: Usuario) => {
    const nuevoEstado: Estado = usuario.estado === "ACTIVO" ? "INACTIVO" : "ACTIVO";

    // Optimistic update
    setUsuarios((prev) =>
      prev.map((u) => u.idUsuario === usuario.idUsuario ? { ...u, estado: nuevoEstado } : u)
    );
    setToggling((prev) => new Set(prev).add(usuario.idUsuario));

    try {
      await cambiarEstadoUsuario(usuario.idUsuario, nuevoEstado);
    } catch {
      // Revertir si falla
      setUsuarios((prev) =>
        prev.map((u) => u.idUsuario === usuario.idUsuario ? { ...u, estado: usuario.estado } : u)
      );
    } finally {
      setToggling((prev) => {
        const next = new Set(prev);
        next.delete(usuario.idUsuario);
        return next;
      });
    }
  };

  const filtered = usuarios.filter((u) =>
    `${u.nombre} ${u.apellido} ${u.usuario}`
      .toLowerCase()
      .includes(search.toLowerCase())
  );

  const stats: Stat[] = [
    { label: "Total",      value: usuarios.length,                                          accent: "text-gray-900" },
    { label: "Activos",    value: usuarios.filter((u) => u.estado === "ACTIVO").length,     accent: "text-cyan-600" },
    { label: "Inactivos",  value: usuarios.filter((u) => u.estado === "INACTIVO").length,   accent: "text-gray-400" },
    { label: "Con rol",    value: usuarios.filter((u) => !!u.rol).length,                   accent: "text-purple-500" },
  ];

  return (
    <div className="text-gray-800">
      <PageHeader
        icon={<Users size={24} className="text-cyan-500" />}
        title="Usuarios"
        subtitle="Administra los usuarios del sistema"
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="flex items-center gap-2 bg-cyan-500 hover:bg-cyan-600 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:shadow-md whitespace-nowrap"
          >
            <Plus size={16} />
            <span className="hidden sm:inline">Nuevo Usuario</span>
            <span className="sm:hidden">Nuevo</span>
          </button>
        }
      />

      <StatCards stats={stats} loading={loading} />

      <SearchBar
        value={search}
        onChange={setSearch}
        placeholder="Buscar por nombre, apellido o usuario..."
      />

      <PageContent
        loading={loading}
        error={fetchError}
        empty={filtered.length === 0}
        emptyMessage={
          search
            ? `No se encontraron usuarios para "${search}".`
            : "No hay usuarios registrados aún."
        }
        onRetry={fetchUsuarios}
      >
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((u, index) => (
            <div
              key={u.idUsuario}
              className="bg-white border border-gray-200 rounded-2xl p-5 hover:border-cyan-400 hover:shadow-md transition-all duration-200"
            >
              {/* Número correlativo */}
              <div className="text-xs text-gray-400 mb-3">Usuario #{index + 1}</div>

              {/* Avatar + Rol */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-full bg-cyan-100 flex items-center justify-center text-cyan-600 font-bold text-base">
                    {u.nombre.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 leading-tight">
                      {u.nombre} {u.apellido}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">@{u.usuario}</p>
                  </div>
                </div>
                <span className="bg-cyan-50 text-cyan-600 border border-cyan-200 px-2.5 py-1 rounded-full text-xs font-semibold">
                  {u.rol}
                </span>
              </div>

              {/* Info */}
              <div className="text-sm text-gray-500 mb-4">
                <p><span className="font-medium text-gray-700">Celular:</span> {u.celular}</p>
              </div>

              {/* Estado + toggle */}
              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border ${
                  u.estado === "ACTIVO"
                    ? "bg-cyan-50 text-cyan-600 border-cyan-200"
                    : "bg-gray-100 text-gray-400 border-gray-200"
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${u.estado === "ACTIVO" ? "bg-cyan-500" : "bg-gray-400"}`} />
                  {u.estado}
                </span>

                <button
                  onClick={() => handleToggleEstado(u)}
                  disabled={toggling.has(u.idUsuario)}
                  title={u.estado === "ACTIVO" ? "Desactivar usuario" : "Activar usuario"}
                  className={`
                    relative inline-flex h-6 w-11 items-center rounded-full
                    transition-colors duration-300 focus:outline-none
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${u.estado === "ACTIVO" ? "bg-cyan-500" : "bg-gray-300"}
                  `}
                >
                  <span className={`
                    inline-block h-4 w-4 rounded-full bg-white shadow
                    transform transition-transform duration-300
                    ${u.estado === "ACTIVO" ? "translate-x-6" : "translate-x-1"}
                  `} />
                </button>
              </div>
            </div>
          ))}
        </div>
      </PageContent>

      <NuevoUsuarioModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          fetchUsuarios();
          setModalOpen(false);
        }}
      />
    </div>
  );
}
// src/components/ui/page/StatCards.tsx

export interface Stat {
  label: string;
  value: number;
  accent: string; // clase Tailwind de color, ej. "text-cyan-600"
}

interface StatCardsProps {
  stats: Stat[];
  loading?: boolean;
}

/**
 * Fila de tarjetas de estadísticas reutilizable.
 * Muestra "—" mientras `loading` es true.
 */
export function StatCards({ stats, loading = false }: StatCardsProps) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {stats.map((s) => (
        <div key={s.label} className="bg-white border border-gray-200 rounded-2xl p-4">
          <p className="text-xs text-gray-400">{s.label}</p>
          <p className={`text-2xl font-bold mt-1 ${s.accent}`}>
            {loading ? <span className="text-gray-300">—</span> : s.value}
          </p>
        </div>
      ))}
    </div>
  );
}
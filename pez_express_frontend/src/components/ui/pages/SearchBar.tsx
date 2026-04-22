// src/components/ui/page/SearchBar.tsx

import { Search } from "lucide-react";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

/**
 * Barra de búsqueda reutilizable para páginas del dashboard.
 */
export function SearchBar({ value, onChange, placeholder = "Buscar..." }: SearchBarProps) {
  return (
    <div className="relative mb-5">
      <Search
        size={15}
        className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
      />
      <input
        type="text"
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full pl-10 pr-4 py-2.5 text-sm bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-100 transition"
      />
    </div>
  );
}
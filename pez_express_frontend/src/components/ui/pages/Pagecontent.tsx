// src/components/ui/page/PageContent.tsx

import { Loader2 } from "lucide-react";

interface PageContentProps {
  loading: boolean;
  error: string | null;
  empty: boolean;
  emptyMessage: string;
  onRetry?: () => void;
  children: React.ReactNode;
}

/**
 * Wrapper reutilizable que maneja los 4 estados de una página:
 * loading → error → vacío → contenido.
 */
export function PageContent({
  loading,
  error,
  empty,
  emptyMessage,
  onRetry,
  children,
}: PageContentProps) {
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20 gap-3 text-gray-400">
        <Loader2 size={22} className="animate-spin text-cyan-500" />
        <span className="text-sm">Cargando...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center">
        <p className="text-red-500 text-sm font-medium">{error}</p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="mt-3 text-xs text-red-400 underline hover:text-red-600"
          >
            Reintentar
          </button>
        )}
      </div>
    );
  }

  if (empty) {
    return (
      <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center text-gray-400">
        {emptyMessage}
      </div>
    );
  }

  return <>{children}</>;
}
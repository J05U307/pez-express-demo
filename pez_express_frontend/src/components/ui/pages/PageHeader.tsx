// src/components/ui/page/PageHeader.tsx

interface PageHeaderProps {
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  action: React.ReactNode;
}

/**
 * Header reutilizable para páginas del dashboard.
 * Muestra ícono, título, subtítulo y un botón de acción (ej. "Nuevo X").
 */
export function PageHeader({ icon, title, subtitle, action }: PageHeaderProps) {
  return (
    <div className="mb-6 flex items-start justify-between gap-4">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          {icon}
          {title}
        </h1>
        <p className="text-gray-500 text-sm mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
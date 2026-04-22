// src/components/ui/ToastContainer.tsx
import { X, AlertCircle, CheckCircle2, AlertTriangle, Info } from "lucide-react";
import type { Toast } from "../../hooks/useToast";

const CONFIG = {
  error:   { bg: "bg-red-50",    border: "border-red-200",   text: "text-red-800",   sub: "text-red-700",   icon: AlertCircle,    iconClass: "text-red-500"   },
  success: { bg: "bg-green-50",  border: "border-green-200", text: "text-green-800", sub: "text-green-700", icon: CheckCircle2,   iconClass: "text-green-500" },
  warning: { bg: "bg-amber-50",  border: "border-amber-200", text: "text-amber-800", sub: "text-amber-700", icon: AlertTriangle,  iconClass: "text-amber-500" },
  info:    { bg: "bg-blue-50",   border: "border-blue-200",  text: "text-blue-800",  sub: "text-blue-700",  icon: Info,           iconClass: "text-blue-500"  },
};

interface Props {
  toasts: Toast[];
  onRemove: (id: number) => void;
}

export function ToastContainer({ toasts, onRemove }: Props) {
  if (toasts.length === 0) return null;

  return (
    <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-2 w-80 pointer-events-none">
      {toasts.map((t) => {
        const c = CONFIG[t.type];
        const Icon = c.icon;
        return (
          <div
            key={t.id}
            className={`
              flex items-start gap-3 px-4 py-3 rounded-2xl border shadow-lg
              pointer-events-auto animate-in slide-in-from-right-5 fade-in
              ${c.bg} ${c.border}
            `}
            style={{ animation: "toastIn 0.3s ease" }}
          >
            <Icon size={16} className={`flex-shrink-0 mt-0.5 ${c.iconClass}`} />
            <div className="flex-1 min-w-0">
              {t.title && (
                <p className={`text-xs font-bold mb-0.5 ${c.text}`}>{t.title}</p>
              )}
              <p className={`text-xs leading-snug ${c.sub}`}>{t.message}</p>
            </div>
            <button
              onClick={() => onRemove(t.id)}
              className={`flex-shrink-0 hover:opacity-70 transition-opacity ${c.iconClass}`}
            >
              <X size={13} />
            </button>
          </div>
        );
      })}
      <style>{`
        @keyframes toastIn {
          from { opacity: 0; transform: translateX(16px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}
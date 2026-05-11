import { X, Check, AlertCircle, Info } from "lucide-react";
import { useEffect } from "react";

type ToastType = "success" | "error" | "info";

export interface Toast {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  duration?: number;
  onClose: (id: string) => void;
}

export function Toast({
  id,
  type,
  title,
  description,
  duration = 4000,
  onClose,
}: Toast) {
  useEffect(() => {
    if (duration === 0) return;

    const timer = setTimeout(() => {
      onClose(id);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration, id, onClose]);

  const configs = {
    success: {
      icon: <Check size={20} />,
      bgColor: "hsl(var(--card))",
      borderColor: "hsl(var(--success, 142 76% 36%) / 0.4)",
      textColor: "hsl(var(--success, 142 76% 36%))",
      iconColor: "hsl(var(--success, 142 76% 36%))",
      accentColor: "hsl(var(--success, 142 76% 36%) / 0.1)",
    },
    error: {
      icon: <AlertCircle size={20} />,
      bgColor: "hsl(var(--card))",
      borderColor: "hsl(var(--destructive, 0 84% 60%) / 0.4)",
      textColor: "hsl(var(--destructive, 0 84% 60%))",
      iconColor: "hsl(var(--destructive, 0 84% 60%))",
      accentColor: "hsl(var(--destructive, 0 84% 60%) / 0.1)",
    },
    info: {
      icon: <Info size={20} />,
      bgColor: "hsl(var(--card))",
      borderColor: "hsl(var(--primary) / 0.4)",
      textColor: "hsl(var(--primary))",
      iconColor: "hsl(var(--primary))",
      accentColor: "hsl(var(--primary) / 0.1)",
    },
  };

  const config = configs[type];

  return (
    <div 
      className="rounded-2xl p-4 flex gap-3 items-start border shadow-2xl relative overflow-hidden"
      style={{ 
        animation: "slideInUp 0.32s ease-out",
        backgroundColor: "hsl(var(--card))",
        borderColor: config.borderColor,
        boxShadow: `0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)`
      }}
    >
      {/* Accent Background */}
      <div 
        className="absolute inset-0 pointer-events-none" 
        style={{ backgroundColor: config.accentColor }} 
      />
      <div className="relative z-10 mt-0.5 flex-shrink-0" style={{ color: config.iconColor }}>
        {config.icon}
      </div>
      <div className="relative z-10 flex-1 min-w-0">
        <h3 className="font-bold text-sm" style={{ color: config.textColor }}>{title}</h3>
        {description && (
          <p className="text-xs mt-1" style={{ color: "hsl(var(--muted-foreground))" }}>{description}</p>
        )}
      </div>
      <button
        onClick={() => onClose(id)}
        className="relative z-10 flex-shrink-0 transition-colors p-1"
        style={{ 
          color: "hsl(var(--muted-foreground))"
        }}
        onMouseEnter={(e) => e.currentTarget.style.color = "hsl(var(--foreground))"}
        onMouseLeave={(e) => e.currentTarget.style.color = "hsl(var(--muted-foreground))"}
      >
        <X size={16} />
      </button>

      <style>{`
        @keyframes slideInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

interface ToastContainerProps {
  toasts: Toast[];
  onClose: (id: string) => void;
}

export function ToastContainer({ toasts, onClose }: ToastContainerProps) {
  return (
    <div className="fixed bottom-4 right-4 z-[70] flex flex-col gap-3 pointer-events-none max-w-sm px-4 sm:px-0">
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <Toast {...toast} onClose={onClose} />
        </div>
      ))}
    </div>
  );
}

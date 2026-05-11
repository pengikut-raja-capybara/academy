import { X } from "lucide-react";
import { useEffect } from "react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  isDangerous?: boolean;
  isLoading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
  icon?: React.ReactNode;
}

export default function ConfirmDialog({
  isOpen,
  title,
  description,
  confirmText = "Konfirmasi",
  cancelText = "Batal",
  isDangerous = false,
  isLoading = false,
  onConfirm,
  onCancel,
  icon,
}: ConfirmDialogProps) {
  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !isLoading) {
        onCancel();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
      return () => {
        document.removeEventListener("keydown", handleKeyDown);
        document.body.style.overflow = "unset";
      };
    }
  }, [isOpen, isLoading, onCancel]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="fixed inset-0 backdrop-blur-md"
        onClick={onCancel}
        role="presentation"
        style={{ 
          animation: "fadeIn 0.3s ease-out",
          backgroundColor: "rgba(0, 0, 0, 0.7)"
        }}
      />

      {/* Dialog */}
      <div className="relative rounded-3xl shadow-2xl max-w-sm w-full" style={{ 
        animation: "scaleIn 0.3s ease-out",
        backgroundColor: "hsl(var(--card))",
        border: "1px solid hsl(var(--border))"
      }}>
        {/* Close Button */}
        <button
          onClick={onCancel}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1.5 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
          aria-label="Close dialog"
          style={{ color: "hsl(var(--muted-foreground))" }}
        >
          <X size={20} />
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Icon */}
          {icon && (
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ 
              animation: "popIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) 100ms backwards",
              backgroundColor: "hsl(var(--primary) / 0.1)",
              color: "hsl(var(--primary))"
            }}>
              {icon}
            </div>
          )}

          {/* Header */}
          <div className="space-y-2" style={{ animation: "slideInUp 0.4s ease-out 200ms backwards" }}>
            <h2 className="text-xl sm:text-2xl font-black leading-tight" style={{ color: "hsl(var(--foreground))" }}>
              {title}
            </h2>
            {description && (
              <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--muted-foreground))" }}>
                {description}
              </p>
            )}
          </div>

          {/* Buttons */}
          <div className="flex gap-3 pt-2" style={{ animation: "slideInUp 0.4s ease-out 300ms backwards" }}>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              style={{ 
                backgroundColor: "hsl(var(--muted))",
                color: "hsl(var(--foreground))",
                border: "1px solid hsl(var(--border))"
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = "hsl(var(--muted) / 0.8)"}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = "hsl(var(--muted))"}
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="flex-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95"
              style={{ 
                backgroundColor: isDangerous ? "hsl(var(--destructive) / 0.9)" : "hsl(var(--primary))",
                color: isDangerous ? "white" : "hsl(var(--primary-foreground))"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = isDangerous ? "hsl(var(--destructive))" : "hsl(var(--primary) / 0.9)";
                e.currentTarget.style.boxShadow = isDangerous 
                  ? "0 10px 15px -3px rgb(239 68 68 / 0.3)"
                  : "0 10px 15px -3px hsl(var(--primary) / 0.3)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = isDangerous ? "hsl(var(--destructive) / 0.9)" : "hsl(var(--primary))";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {isLoading && (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              )}
              {confirmText}
            </button>
          </div>
        </div>

        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }
          
          @keyframes scaleIn {
            from {
              opacity: 0;
              transform: scale(0.95);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
          @keyframes popIn {
            from {
              opacity: 0;
              transform: scale(0.5);
            }
            to {
              opacity: 1;
              transform: scale(1);
            }
          }
          
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
    </div>
  );
}

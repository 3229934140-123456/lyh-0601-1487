import { CheckCircle2, XCircle, Info, X } from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import { cn } from "@/utils/formatters";

export function Toast() {
  const toast = useUiStore((s) => s.toast);
  const hide = useUiStore((s) => s.hideToast);

  if (!toast) return null;

  const style = {
    success: { icon: CheckCircle2, color: "text-emerald-600", bg: "bg-emerald-50 border-emerald-200" },
    error: { icon: XCircle, color: "text-red-600", bg: "bg-red-50 border-red-200" },
    info: { icon: Info, color: "text-blue-600", bg: "bg-blue-50 border-blue-200" },
  }[toast.type];

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-[100] animate-fadeUp">
      <div
        className={cn(
          "flex items-center gap-3 px-4 py-3 rounded-xl border shadow-cardHover",
          style.bg
        )}
      >
        {(() => {
        const Ico = style.icon;
        return <Ico size={18} className={style.color} strokeWidth={2.2} />;
      })()}
        <span className="text-sm font-semibold text-ink-800">{toast.text}</span>
        <button
          onClick={hide}
          className="ml-2 text-ink-400 hover:text-ink-700 transition-colors"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}

import type { LucideIcon } from "lucide-react";
import { cn } from "@/utils/formatters";

interface Props {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  delta?: { value: string; positive?: boolean };
  accent?: string;
  trend?: React.ReactNode;
  className?: string;
}

export function StatCard({ icon: Icon, label, value, delta, accent = "from-mint-400 to-mint-600", trend, className }: Props) {
  return (
    <div className={cn("card p-5 relative overflow-hidden animate-fadeUp", className)}>
      <div
        className={cn(
          "absolute top-0 right-0 w-24 h-24 opacity-[0.07] bg-gradient-to-br blur-2xl rounded-full",
          accent
        )}
        style={{ transform: "translate(30%, -30%)" }}
      />
      <div className="relative">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-ink-400">{label}</span>
          {Icon && (
            <div
              className={cn(
                "w-9 h-9 rounded-lg flex items-center justify-center bg-gradient-to-br text-white",
                accent
              )}
            >
              <Icon size={18} strokeWidth={2.2} />
            </div>
          )}
        </div>
        <div className="font-display text-3xl text-ink-800 tracking-tight mb-1.5">
          {value}
        </div>
        {delta && (
          <div
            className={cn(
              "text-xs font-semibold inline-flex items-center gap-1",
              delta.positive ? "text-emerald-600" : "text-amber-600"
            )}
          >
            <span>{delta.positive ? "▲" : "▼"}</span>
            {delta.value}
          </div>
        )}
        {trend && <div className="mt-3 h-10 -mx-2">{trend}</div>}
      </div>
    </div>
  );
}

import type { DemandStatus } from "@/types";
import { DEMAND_STATUS_META } from "@/utils/constants";
import { cn } from "@/utils/formatters";

interface Props {
  status: DemandStatus;
  size?: "sm" | "md";
  showDot?: boolean;
}

export function StatusBadge({ status, size = "sm", showDot = true }: Props) {
  const meta = DEMAND_STATUS_META[status];
  return (
    <span
      className={cn(
        "tag ring-1 ring-inset",
        meta.bg,
        meta.color,
        meta.ring,
        size === "md" ? "px-3 py-1.5 text-sm" : "px-2.5 py-1 text-xs"
      )}
    >
      {showDot && (
        <span className={cn("w-1.5 h-1.5 rounded-full", "bg-current opacity-70")} />
      )}
      {meta.label}
    </span>
  );
}

import {
  Bell,
  Search,
  ChevronDown,
  ShieldCheck,
  Building2,
  Warehouse,
} from "lucide-react";
import { useUiStore } from "@/store/useUiStore";
import type { UserRole } from "@/types";
import { cn } from "@/utils/formatters";

const ROLE_META: Record<UserRole, { label: string; Icon: typeof Building2; color: string }> = {
  demand: { label: "需求方视图", Icon: Building2, color: "text-blue-600 bg-blue-50" },
  provider: { label: "提供方视图", Icon: Warehouse, color: "text-purple-600 bg-purple-50" },
  operator: { label: "运营视图", Icon: ShieldCheck, color: "text-mint-600 bg-mint-50" },
};

const ROLES: UserRole[] = ["operator", "demand", "provider"];

interface Props {
  title: string;
  subtitle?: string;
}

export function Header({ title, subtitle }: Props) {
  const role = useUiStore((s) => s.role);
  const setRole = useUiStore((s) => s.setRole);
  const current = ROLE_META[role];

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-b border-ink-100 flex items-center gap-6 px-6 sticky top-0 z-30 shrink-0">
      <div className="flex-1 min-w-0">
        <h1 className="font-display text-xl text-ink-800 leading-tight truncate">
          {title}
        </h1>
        {subtitle && (
          <div className="text-xs text-ink-400 truncate mt-0.5">{subtitle}</div>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative hidden md:block">
          <Search
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400"
          />
          <input
            type="text"
            placeholder="搜索需求、产品、企业..."
            className="w-[280px] pl-10 pr-4 py-2 text-sm rounded-lg bg-ink-50 border border-ink-100 focus:bg-white focus:border-mint-400 focus:ring-2 focus:ring-mint-400/20 outline-none transition-all placeholder:text-ink-400"
          />
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-bold text-ink-400 px-1.5 py-0.5 rounded border border-ink-200">
            ⌘K
          </span>
        </div>

        <div className="relative group">
          <button
            className={cn(
              "flex items-center gap-2 px-3 py-2 rounded-lg border transition-all",
              "bg-white border-ink-100 hover:border-ink-200 hover:shadow-sm"
            )}
          >
            <div
              className={cn(
                "w-7 h-7 rounded-md flex items-center justify-center",
                current.color
              )}
            >
              <current.Icon size={15} strokeWidth={2.2} />
            </div>
            <span className="text-sm font-semibold text-ink-700 hidden sm:block">
              {current.label}
            </span>
            <ChevronDown size={14} className="text-ink-400" />
          </button>
          <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl border border-ink-100 bg-white shadow-cardHover py-1.5 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-150 z-50 animate-scaleIn origin-top-right">
            {ROLES.map((r) => {
              const meta = ROLE_META[r];
              return (
                <button
                  key={r}
                  onClick={() => setRole(r)}
                  className={cn(
                    "w-full flex items-center gap-2.5 px-3 py-2 text-sm transition-colors",
                    r === role
                      ? "bg-ink-50 text-ink-800 font-semibold"
                      : "text-ink-600 hover:bg-ink-50"
                  )}
                >
                  <div
                    className={cn("w-7 h-7 rounded-md flex items-center justify-center", meta.color)}
                  >
                    <meta.Icon size={15} strokeWidth={2.2} />
                  </div>
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <button className="relative w-10 h-10 rounded-lg border border-ink-100 bg-white hover:bg-ink-50 transition-colors flex items-center justify-center">
          <Bell size={18} className="text-ink-600" strokeWidth={1.8} />
          <span className="absolute top-2 right-2.5 w-2 h-2 rounded-full bg-amber-400 ring-2 ring-white" />
        </button>

        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-ink-700 to-ink-900 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-ink-800/20">
          周
        </div>
      </div>
    </header>
  );
}

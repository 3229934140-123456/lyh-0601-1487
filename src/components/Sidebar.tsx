import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  FileSpreadsheet,
  Store,
  GitBranch,
  MessageSquareText,
  Sparkles,
  PanelLeft,
  Database,
} from "lucide-react";
import { cn } from "@/utils/formatters";
import { useUiStore } from "@/store/useUiStore";

const NAV_ITEMS = [
  { to: "/dashboard", label: "进展看板", icon: LayoutDashboard, badge: "12" },
  { to: "/demands", label: "需求发布", icon: FileSpreadsheet },
  { to: "/showcase", label: "产品橱窗", icon: Store, badge: "NEW" },
  { to: "/matching", label: "撮合工作台", icon: GitBranch },
  { to: "/communication", label: "沟通记录", icon: MessageSquareText, badge: "6" },
];

export function Sidebar() {
  const collapsed = useUiStore((s) => s.sidebarCollapsed);
  const toggle = useUiStore((s) => s.toggleSidebar);

  return (
    <aside
      className={cn(
        "flex flex-col h-full bg-white border-r border-ink-100 transition-all duration-300",
        collapsed ? "w-[76px]" : "w-[248px]"
      )}
    >
      <div className="h-16 flex items-center gap-3 px-5 border-b border-ink-100 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-grad-primary flex items-center justify-center shrink-0 shadow-lg shadow-ink-800/20">
          <Database size={22} className="text-white" strokeWidth={2.2} />
        </div>
        {!collapsed && (
          <div className="overflow-hidden animate-slideRight">
            <div className="font-display text-lg font-bold text-ink-800 leading-tight">
              DataMatch
            </div>
            <div className="text-[11px] text-ink-400 font-medium">数据要素撮合平台</div>
          </div>
        )}
      </div>

      <nav className="flex-1 p-3 space-y-1 overflow-y-auto scrollbar-thin">
        {!collapsed && (
          <div className="px-3 py-2 text-[11px] font-bold text-ink-300 uppercase tracking-widest">
            功能导航
          </div>
        )}
        {NAV_ITEMS.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                isActive ? "nav-item-active" : "nav-item",
                collapsed && "justify-center px-0"
              )
            }
          >
            <item.icon size={20} strokeWidth={1.8} className="shrink-0" />
            {!collapsed && (
              <>
                <span className="flex-1">{item.label}</span>
                {item.badge && (
                  <span
                    className={cn(
                      "text-[10px] px-1.5 py-0.5 rounded-md font-bold",
                      item.badge === "NEW"
                        ? "bg-mint-100 text-mint-700"
                        : "bg-amber-100 text-amber-700"
                    )}
                  >
                    {item.badge}
                  </span>
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="p-3 border-t border-ink-100">
        <button
          onClick={toggle}
          className={cn(
            "w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-ink-500 hover:bg-ink-50 hover:text-ink-800 transition-colors",
            collapsed && "justify-center px-0"
          )}
        >
          <PanelLeft
            size={18}
            className={cn("transition-transform", collapsed && "rotate-180")}
          />
          {!collapsed && <span>收起侧栏</span>}
        </button>

        {!collapsed && (
          <div className="mt-3 p-4 rounded-xl bg-gradient-to-br from-mint-50 via-white to-mint-50 border border-mint-100 relative overflow-hidden animate-fadeUp">
            <Sparkles
              size={16}
              className="absolute top-3 right-3 text-mint-500"
              strokeWidth={2}
            />
            <div className="text-xs font-semibold text-ink-700 mb-1">撮合建议</div>
            <div className="text-[11px] text-ink-500 leading-relaxed mb-3">
              本周有 3 组高匹配撮合未处理，建议前往工作台确认。
            </div>
            <button className="w-full py-2 rounded-lg text-xs font-bold bg-grad-mint text-ink-900 hover:shadow-md transition-shadow">
              立即查看
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

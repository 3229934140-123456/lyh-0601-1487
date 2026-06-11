import { Outlet, useLocation } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { Toast } from "./Toast";

const PAGE_META: Record<string, { title: string; subtitle: string }> = {
  "/dashboard": {
    title: "进展看板",
    subtitle: "跟踪撮合全生命周期状态，洞察交易转化数据",
  },
  "/demands": {
    title: "需求发布中心",
    subtitle: "数据需求方发布采购需求，管理需求全流程",
  },
  "/showcase": {
    title: "数据产品橱窗",
    subtitle: "浏览已上架的数据产品，支持收藏、对比、发起意向",
  },
  "/matching": {
    title: "撮合工作台",
    subtitle: "按多维度筛选匹配，生成撮合报告推送给供需双方",
  },
  "/communication": {
    title: "沟通记录中心",
    subtitle: "集中管理供需双方的意向、问题、材料和会议纪要",
  },
};

export function Layout() {
  const loc = useLocation();
  const meta = PAGE_META[loc.pathname] ?? {
    title: "数据要素撮合平台",
    subtitle: "",
  };

  return (
    <div className="h-full flex bg-grad-ink">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <Header title={meta.title} subtitle={meta.subtitle} />
        <main className="flex-1 overflow-y-auto scrollbar-thin">
          <div className="min-w-[1100px] px-6 py-6">
            <Outlet />
          </div>
        </main>
      </div>
      <Toast />
    </div>
  );
}

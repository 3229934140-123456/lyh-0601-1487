import { useState, useMemo } from "react";
import {
  TrendingUp,
  Handshake,
  FileSignature,
  PackageCheck,
  Clock,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Calendar,
  DollarSign,
  Users,
  Building2,
  MapPin,
  GripVertical,
  MoreHorizontal,
  Star,
  Sparkles,
  Filter,
} from "lucide-react";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  ComposedChart,
} from "recharts";
import { useDemandStore } from "@/store/useDemandStore";
import { useCommunicationStore } from "@/store/useCommunicationStore";
import { StatusBadge } from "@/components/StatusBadge";
import { StatCard } from "@/components/StatCard";
import type { Demand, DemandStatus } from "@/types";
import { DEMAND_STATUS_META, DEMAND_STATUS_FLOW, INDUSTRIES } from "@/utils/constants";
import { TREND_DATA, INDUSTRY_STATS } from "@/data/trend";
import { formatCurrency, formatDate, cn, scoreToBg } from "@/utils/formatters";

export default function Dashboard() {
  const demands = useDemandStore((s) => s.demands);
  const updateStatus = useDemandStore((s) => s.updateStatus);
  const communications = useCommunicationStore((s) => s.communications);

  const stats = useMemo(() => {
    return demands.reduce(
      (acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      },
      { pending: 0, negotiating: 0, signing: 0, delivered: 0, closed: 0 } as Record<DemandStatus, number>
    );
  }, [demands]);

  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [hoverCol, setHoverCol] = useState<DemandStatus | null>(null);
  const [viewMode, setViewMode] = useState<"kanban" | "list">("kanban");
  const [filterIndustry, setFilterIndustry] = useState("");

  const totalAmount = useMemo(
    () => demands.reduce((sum, d) => sum + d.budget, 0),
    [demands]
  );

  const converted = stats.delivered + stats.signing;
  const conversionRate = Math.round((converted / demands.length) * 100);

  const filteredDemands = useMemo(
    () => (filterIndustry ? demands.filter((d) => d.industry === filterIndustry) : demands),
    [demands, filterIndustry]
  );

  const kanbanData = useMemo(() => {
    return DEMAND_STATUS_FLOW.reduce(
      (acc, status) => {
        acc[status] = filteredDemands.filter((d) => d.status === status);
        return acc;
      },
      {} as Record<DemandStatus, Demand[]>
    );
  }, [filteredDemands]);

  const industryAmount = useMemo(() => {
    return INDUSTRY_STATS.map((s) => ({
      ...s,
      amountText: formatCurrency(s.amount),
    }));
  }, []);

  const maxCount = Math.max(...INDUSTRY_STATS.map((s) => s.count));

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* 顶部统计卡 */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          icon={Handshake}
          label="撮合总数"
          value={demands.length}
          delta={{ value: "较上月 +12.5%", positive: true }}
          accent="from-mint-400 to-mint-600"
          trend={
            <ResponsiveContainer>
              <LineChart data={TREND_DATA}>
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#00D4AA"
                  strokeWidth={2.5}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          }
        />
        <StatCard
          icon={FileSignature}
          label="进行中"
          value={stats.negotiating + stats.signing}
          delta={{ value: "洽谈+签约", positive: true }}
          accent="from-blue-500 to-blue-700"
          trend={
            <ResponsiveContainer>
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="gradBlue" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#3B82F6" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey={(d) => d.negotiating + d.signing}
                  stroke="#3B82F6"
                  strokeWidth={2}
                  fill="url(#gradBlue)"
                />
              </AreaChart>
            </ResponsiveContainer>
          }
        />
        <StatCard
          icon={PackageCheck}
          label="已交付"
          value={stats.delivered}
          delta={{ value: `转化率 ${conversionRate}%`, positive: true }}
          accent="from-emerald-500 to-emerald-700"
          trend={
            <ResponsiveContainer>
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="gradGreen" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#10B981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="delivered"
                  stroke="#10B981"
                  strokeWidth={2}
                  fill="url(#gradGreen)"
                />
              </AreaChart>
            </ResponsiveContainer>
          }
        />
        <StatCard
          icon={DollarSign}
          label="撮合金额"
          value={formatCurrency(totalAmount)}
          delta={{ value: "预计年度可达 6800万", positive: true }}
          accent="from-ink-700 to-ink-900"
          trend={
            <ResponsiveContainer>
              <AreaChart data={TREND_DATA}>
                <defs>
                  <linearGradient id="gradInk" x1="0" x2="0" y1="0" y2="1">
                    <stop offset="0%" stopColor="#0E2A47" stopOpacity={0.4} />
                    <stop offset="100%" stopColor="#0E2A47" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey="amount"
                  stroke="#0E2A47"
                  strokeWidth={2}
                  fill="url(#gradInk)"
                />
              </AreaChart>
            </ResponsiveContainer>
          }
        />
      </div>

      {/* 第二行：筛选 + 视图切换 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white border border-ink-100">
            <Filter size={15} className="text-ink-400" />
            <select
              value={filterIndustry}
              onChange={(e) => setFilterIndustry(e.target.value)}
              className="text-sm text-ink-700 outline-none bg-transparent"
            >
              <option value="">全部行业</option>
              {INDUSTRIES.map((i) => (
                <option key={i}>{i}</option>
              ))}
            </select>
          </div>
          <div className="flex items-center gap-1 px-3 py-2 rounded-lg bg-white border border-ink-100">
            <Calendar size={15} className="text-ink-400" />
            <span className="text-sm font-semibold text-ink-700">近7个月</span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-ink-100/60">
          <button
            onClick={() => setViewMode("kanban")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
              viewMode === "kanban"
                ? "bg-white text-ink-800 shadow-sm"
                : "text-ink-500 hover:text-ink-700"
            )}
          >
            <BarChart3 size={13} />
            Kanban 看板
          </button>
          <button
            onClick={() => setViewMode("list")}
            className={cn(
              "flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-bold transition-all",
              viewMode === "list"
                ? "bg-white text-ink-800 shadow-sm"
                : "text-ink-500 hover:text-ink-700"
            )}
          >
            <PieChart size={13} />
            统计图表
          </button>
        </div>
      </div>

      {viewMode === "kanban" ? (
        /* Kanban 看板 */
        <div className="grid grid-cols-4 gap-4">
          {DEMAND_STATUS_FLOW.map((status, colIdx) => {
            const meta = DEMAND_STATUS_META[status];
            const list = kanbanData[status] ?? [];
            const totalBudgetValue = list.reduce((sum, d) => sum + d.budget, 0);

            return (
              <div
                key={status}
                className="kanban-col transition-all"
                style={{ animationDelay: `${colIdx * 60}ms` }}
                onDragOver={(e) => {
                  e.preventDefault();
                  setHoverCol(status);
                }}
                onDragLeave={() => setHoverCol(null)}
                onDrop={(e) => {
                  e.preventDefault();
                  const id = e.dataTransfer.getData("text/plain");
                  if (id && draggedId) {
                    updateStatus(id, status);
                  }
                  setHoverCol(null);
                  setDraggedId(null);
                }}
              >
                <div className="px-1 py-2 flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={cn("w-2.5 h-2.5 rounded-full", `bg-status-${status}`)} />
                    <h3 className="font-display text-base text-ink-800">{meta.label}</h3>
                    <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-white border border-ink-100 text-ink-600 shadow-sm">
                      {list.length}
                    </span>
                  </div>
                  <button className="text-ink-300 hover:text-ink-600 p-1 rounded-md hover:bg-white transition-colors">
                    <MoreHorizontal size={14} />
                  </button>
                </div>
                <div className="px-1 text-[11px] font-semibold text-ink-400 mb-2 flex items-center gap-1">
                  <DollarSign size={11} />
                  预算合计 {formatCurrency(totalBudgetValue)}
                </div>

                <div
                  className={cn(
                    "flex-1 flex flex-col gap-2.5 rounded-xl transition-all",
                    hoverCol === status && draggedId && "bg-mint-100/40 border-2 border-dashed border-mint-300 p-1.5"
                  )}
                >
                  {list.map((d, idx) => (
                    <div
                      key={d.id}
                      draggable
                      onDragStart={(e) => {
                        setDraggedId(d.id);
                        e.dataTransfer.setData("text/plain", d.id);
                      }}
                      onDragEnd={() => {
                        setDraggedId(null);
                        setHoverCol(null);
                      }}
                      style={{ animationDelay: `${idx * 40}ms` }}
                      className={cn(
                        "card p-3.5 cursor-grab active:cursor-grabbing animate-fadeUp transition-all group",
                        draggedId === d.id && "opacity-50 scale-95 rotate-1",
                        hoverCol === status && draggedId && draggedId !== d.id && "blur-[1px]"
                      )}
                    >
                      <div className="flex items-start gap-2 mb-2">
                        <div className="pt-0.5 text-ink-200 group-hover:text-ink-400 transition-colors">
                          <GripVertical size={14} />
                        </div>
                        <h4 className="text-sm font-semibold text-ink-800 leading-snug line-clamp-2 flex-1">
                          {d.title}
                        </h4>
                        {d.favorite && (
                          <Star size={12} className="text-amber-400" fill="currentColor" />
                        )}
                      </div>
                      <div className="flex flex-wrap gap-1 mb-2.5">
                        <span className="tag bg-white text-ink-600 ring-1 ring-ink-100">
                          <Building2 size={10} /> {d.industry}
                        </span>
                        <span className="tag bg-white text-ink-600 ring-1 ring-ink-100">
                          <MapPin size={10} /> {d.region.slice(0, 4)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-2 border-t border-ink-50">
                        <span className="text-xs font-bold text-mint-600">
                          {formatCurrency(d.budget)}
                        </span>
                        <span className="text-[10px] text-ink-400 flex items-center gap-1">
                          <Clock size={10} /> {formatDate(d.createdAt).slice(5)}
                        </span>
                      </div>
                    </div>
                  ))}

                  {list.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-8 text-center">
                      <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center mb-2 border border-dashed border-ink-200">
                        <Sparkles size={18} className="text-ink-300" />
                      </div>
                      <span className="text-xs text-ink-400">拖拽需求到此处</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* 统计图表视图 */
        <div className="grid grid-cols-12 gap-4">
          {/* 月度趋势图 */}
          <div className="col-span-8 card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg text-ink-800 flex items-center gap-2">
                  <TrendingUp size={18} className="text-mint-500" />
                  月度撮合趋势
                </h3>
                <p className="text-xs text-ink-400 mt-0.5">各状态流转数量与成交金额趋势</p>
              </div>
              <div className="flex items-center gap-3 text-[11px] font-semibold">
                <LegendDot color="bg-amber-400" label="待确认" />
                <LegendDot color="bg-blue-500" label="洽谈中" />
                <LegendDot color="bg-purple-500" label="待签约" />
                <LegendDot color="bg-emerald-500" label="已交付" />
                <LegendDot color="bg-ink-700" label="成交金额" dashed />
              </div>
            </div>

            <div className="h-[320px]">
              <ResponsiveContainer>
                <ComposedChart data={TREND_DATA} margin={{ top: 10, right: 20, bottom: 0, left: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E6ECF4" vertical={false} />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    axisLine={{ stroke: "#E6ECF4" }}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fontSize: 11, fill: "#64748B" }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(v) => `${(v / 10000).toFixed(0)}万`}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid #E6ECF4",
                      fontSize: 12,
                      boxShadow: "0 4px 16px rgba(15, 23, 42, 0.08)",
                    }}
                  />
                  <Bar yAxisId="left" dataKey="pending" stackId="a" fill="#F59E0B" radius={[4, 4, 0, 0]} barSize={18} />
                  <Bar yAxisId="left" dataKey="negotiating" stackId="a" fill="#3B82F6" barSize={18} />
                  <Bar yAxisId="left" dataKey="signing" stackId="a" fill="#8B5CF6" barSize={18} />
                  <Bar yAxisId="left" dataKey="delivered" stackId="a" fill="#10B981" radius={[4, 4, 0, 0]} barSize={18} />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="amount"
                    stroke="#0E2A47"
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: "#fff", stroke: "#0E2A47", strokeWidth: 2 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* 行业分析 */}
          <div className="col-span-4 card p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="font-display text-lg text-ink-800 flex items-center gap-2">
                  <PieChart size={18} className="text-mint-500" />
                  行业分布
                </h3>
                <p className="text-xs text-ink-400 mt-0.5">撮合数量与金额对比</p>
              </div>
            </div>

            <div className="space-y-3.5">
              {industryAmount.map((s, idx) => (
                <div key={s.name} className="animate-fadeUp" style={{ animationDelay: `${idx * 40}ms` }}>
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-semibold text-ink-700 flex items-center gap-1.5">
                      <span className={cn("w-2 h-2 rounded-full", scoreToBg(100 - idx * 10))} />
                      {s.name}
                    </span>
                    <span className="text-[11px] font-bold text-ink-500">
                      {s.amountText} · {s.count}单
                    </span>
                  </div>
                  <div className="h-7 flex items-center gap-1.5 rounded-lg bg-ink-50 overflow-hidden relative">
                    <div
                      className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-mint-400 to-mint-500 opacity-90 rounded-r"
                      style={{ width: `${(s.count / maxCount) * 100}%` }}
                    />
                    <div className="relative z-10 px-2.5 flex items-center justify-between w-full text-[11px]">
                      <span className="font-bold text-ink-800">{s.count}</span>
                      <span className="font-bold text-ink-600">{s.amountText}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-5 pt-4 border-t border-ink-100 grid grid-cols-2 gap-3">
              <MiniKpi Icon={Users} label="活跃需求方" value="128" delta="+8" />
              <MiniKpi Icon={Building2} label="认证提供方" value="64" delta="+5" />
            </div>
          </div>

          {/* 最近动态 */}
          <div className="col-span-12 card p-5">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-ink-800 flex items-center gap-2">
                <Sparkles size={18} className="text-mint-500" />
                近期撮合动态
              </h3>
              <button className="text-xs font-bold text-mint-600 hover:text-mint-700 px-3 py-1 rounded-md hover:bg-mint-50 transition-colors flex items-center gap-1">
                查看全部 <ArrowUpRight size={12} />
              </button>
            </div>

            <div className="overflow-hidden rounded-xl2 border border-ink-100">
              <table className="w-full text-sm">
                <thead className="bg-ink-50/80 text-[11px] text-ink-400 uppercase tracking-wider">
                  <tr>
                    <th className="text-left font-bold px-4 py-3">需求标题</th>
                    <th className="text-left font-bold px-4 py-3">行业 / 地域</th>
                    <th className="text-left font-bold px-4 py-3">需求方</th>
                    <th className="text-left font-bold px-4 py-3">预算</th>
                    <th className="text-left font-bold px-4 py-3">状态</th>
                    <th className="text-left font-bold px-4 py-3">沟通进展</th>
                    <th className="text-left font-bold px-4 py-3">趋势</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-50">
                  {filteredDemands.slice(0, 6).map((d, idx) => {
                    const comm = communications.find((c) => c.demandId === d.id);
                    const nextStatus = DEMAND_STATUS_FLOW[DEMAND_STATUS_FLOW.indexOf(d.status) + 1];
                    return (
                      <tr key={d.id} className="hover:bg-ink-50/50 transition-colors animate-fadeUp" style={{ animationDelay: `${idx * 30}ms` }}>
                        <td className="px-4 py-3.5">
                          <div className="font-semibold text-ink-800 line-clamp-1 max-w-[300px]">{d.title}</div>
                          <div className="text-[10px] text-ink-400 mt-0.5">
                            创建于 {formatDate(d.createdAt)}
                          </div>
                        </td>
                        <td className="px-4 py-3.5">
                          <div className="flex items-center gap-1.5">
                            <span className="tag bg-ink-50 text-ink-600 ring-1 ring-ink-100 !py-0.5">
                              {d.industry}
                            </span>
                            <span className="text-xs text-ink-400">{d.region.slice(0, 3)}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3.5 text-xs text-ink-600 font-medium">
                          {d.publisherCompany.slice(0, 8)}
                        </td>
                        <td className="px-4 py-3.5 text-sm font-bold text-mint-600">
                          {formatCurrency(d.budget)}
                        </td>
                        <td className="px-4 py-3.5">
                          <StatusBadge status={d.status} />
                        </td>
                        <td className="px-4 py-3.5">
                          {comm ? (
                            <div className="flex items-center gap-1.5">
                              <div className="flex -space-x-1">
                                <div className="w-5 h-5 rounded-full bg-blue-500 flex items-center justify-center text-[9px] text-white font-bold ring-1 ring-white">
                                  {comm.partyA.slice(0, 1)}
                                </div>
                                <div className="w-5 h-5 rounded-full bg-mint-500 flex items-center justify-center text-[9px] text-white font-bold ring-1 ring-white">
                                  {comm.partyB.slice(0, 1)}
                                </div>
                              </div>
                              <span className="text-[11px] text-ink-500">活跃沟通中</span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-ink-400">待撮合</span>
                          )}
                        </td>
                        <td className="px-4 py-3.5">
                          {nextStatus ? (
                            <button
                              onClick={() => updateStatus(d.id, nextStatus)}
                              className="flex items-center gap-1 text-[11px] font-bold text-ink-600 hover:text-mint-600 px-2 py-1 rounded-md hover:bg-mint-50 transition-colors"
                            >
                              推进到 <span className="text-mint-600">{DEMAND_STATUS_META[nextStatus].label}</span>
                              <ArrowUpRight size={11} className="text-mint-500" />
                            </button>
                          ) : (
                            <span className="flex items-center gap-1 text-[11px] font-bold text-emerald-600">
                              <CheckIcon />
                              已完成
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function LegendDot({ color, label, dashed }: { color: string; label: string; dashed?: boolean }) {
  return (
    <span className="flex items-center gap-1.5 text-ink-500">
      <span
        className={cn(
          "w-3 h-3 rounded-sm",
          color,
          dashed && "!bg-transparent !rounded-none border-t-2 border-dashed !w-4"
        )}
        style={dashed ? { borderColor: "#0E2A47" } : undefined}
      />
      {label}
    </span>
  );
}

function MiniKpi({
  Icon,
  label,
  value,
  delta,
}: {
  Icon: typeof Users;
  label: string;
  value: string;
  delta: string;
}) {
  return (
    <div className="p-3 rounded-xl bg-ink-50/60 border border-ink-100">
      <div className="flex items-center justify-between mb-1">
        <Icon size={13} className="text-ink-400" />
        <span className="text-[10px] font-bold text-emerald-600 flex items-center gap-0.5">
          <ArrowUpRight size={10} />
          {delta}
        </span>
      </div>
      <div className="font-display text-xl font-bold text-ink-800 leading-tight">{value}</div>
      <div className="text-[10px] text-ink-400 mt-0.5">{label}</div>
    </div>
  );
}

function CheckIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
      <circle cx="6" cy="6" r="5.5" fill="currentColor" fillOpacity="0.2" />
      <path
        d="M3.5 6.2L5.2 7.9L8.5 4.6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

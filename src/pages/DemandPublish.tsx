import { useState, useMemo, useEffect } from "react";
import {
  Plus,
  Star,
  StarOff,
  X,
  Search,
  Filter,
  Building2,
  MapPin,
  CalendarClock,
  Banknote,
  Target,
  FileText,
  ChevronRight,
  XCircle,
  MessageSquare,
  TrendingUp,
  Eye,
  BarChart3,
} from "lucide-react";
import { useDemandStore } from "@/store/useDemandStore";
import { useUiStore } from "@/store/useUiStore";
import { useNavigate } from "react-router-dom";
import { useCommunicationStore } from "@/store/useCommunicationStore";
import { useMatchReportStore } from "@/store/useMatchReportStore";
import { useProductStore } from "@/store/useProductStore";
import { StatusBadge } from "@/components/StatusBadge";
import { MatchScoreRing } from "@/components/MatchScoreRing";
import type { DemandStatus, Demand, MatchReport } from "@/types";
import { INDUSTRIES, REGIONS, UPDATE_FREQUENCIES, DEMAND_STATUS_META } from "@/utils/constants";
import { formatCurrency, formatDate, formatDateTime, cn, scoreToColor } from "@/utils/formatters";
import { loadJson, saveJson } from "@/utils/storage";

const STATUS_TABS: (DemandStatus | "all")[] = ["all", "pending", "negotiating", "signing", "delivered", "closed"];

const TAB_LABELS: Record<string, string> = {
  all: "全部需求",
  pending: "待确认",
  negotiating: "洽谈中",
  signing: "待签约",
  delivered: "已交付",
  closed: "已关闭",
};

export default function DemandPublish() {
  const demands = useDemandStore((s) => s.demands);
  const toggleFavorite = useDemandStore((s) => s.toggleFavorite);
  const addDemand = useDemandStore((s) => s.addDemand);
  const closeDemand = useDemandStore((s) => s.closeDemand);
  const showToast = useUiStore((s) => s.showToast);
  const findCommsByDemand = useCommunicationStore((s) => s.findByDemand);
  const findOrCreateByDemandAndProduct = useCommunicationStore((s) => s.findOrCreateByDemandAndProduct);
  const products = useProductStore((s) => s.products);
  const findReportsByDemand = useMatchReportStore((s) => s.findByDemand);
  const navigate = useNavigate();

  const stats = useMemo(() => {
    return demands.reduce(
      (acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      },
      { pending: 0, negotiating: 0, signing: 0, delivered: 0, closed: 0 } as Record<DemandStatus, number>
    );
  }, [demands]);

  const [activeTab, setActiveTab] = useState<DemandStatus | "all">("all");
  const [showForm, setShowForm] = useState(false);
  const [selectedDemand, setSelectedDemand] = useState<Demand | null>(null);
  const [keyword, setKeyword] = useState("");
  const [filterIndustry, setFilterIndustry] = useState<string>("");
  const [sortBy, setSortBy] = useState<"new" | "budget">("new");
  const [selectedProductId, setSelectedProductId] = useState<string>("");
  const [selectedReport, setSelectedReport] = useState<MatchReport | null>(null);
  const [showReportModal, setShowReportModal] = useState(false);

  const defaultForm = {
    title: "",
    dataScope: "",
    purpose: "",
    updateFrequency: UPDATE_FREQUENCIES[2],
    budget: 100000,
    industry: INDUSTRIES[0],
    region: REGIONS[7],
    publisher: "当前用户",
    publisherCompany: "示例企业有限公司",
  };

  const [form, setForm] = useState(defaultForm);

  useEffect(() => {
    const draft = loadJson("demandDraft", null);
    if (draft) {
      setForm(draft);
    }
  }, []);

  useEffect(() => {
    saveJson("demandDraft", form);
  }, [form]);

  const filtered = demands
    .filter((d) => (activeTab === "all" ? true : d.status === activeTab))
    .filter((d) => (keyword ? d.title.includes(keyword) || d.publisherCompany.includes(keyword) : true))
    .filter((d) => (filterIndustry ? d.industry === filterIndustry : true))
    .sort((a, b) =>
      sortBy === "budget" ? b.budget - a.budget : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

  const handleSubmit = () => {
    if (!form.title.trim() || !form.dataScope.trim() || !form.purpose.trim()) {
      showToast("error", "请填写必填字段");
      return;
    }
    addDemand(form);
    setShowForm(false);
    setForm(defaultForm);
    saveJson("demandDraft", null);
    showToast("success", "需求发布成功！已进入撮合匹配池");
  };

  const handleClose = (id: string) => {
    closeDemand(id);
    showToast("success", "需求已关闭");
  };

  const handleStartCommunication = (demandId: string, demandTitle: string) => {
    if (!selectedProductId) {
      showToast("error", "请先选择一个产品");
      return;
    }
    const product = products.find((p) => p.id === selectedProductId);
    if (!product) return;
    findOrCreateByDemandAndProduct(
      demandId,
      selectedProductId,
      demandTitle,
      product.name,
      product.providerCompany
    );
    navigate("/communication");
  };

  const handleEnterCommunication = (commId: string) => {
    const setActive = useCommunicationStore.getState().setActive;
    setActive(commId);
    navigate("/communication");
    setSelectedDemand(null);
  };

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* 顶部操作区 */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 overflow-x-auto scrollbar-thin pb-1">
          {STATUS_TABS.map((t) => {
            const count = t === "all" ? demands.length : stats[t] || 0;
            const active = activeTab === t;
            const meta = t !== "all" ? DEMAND_STATUS_META[t] : null;
            return (
              <button
                key={t}
                onClick={() => setActiveTab(t)}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-all whitespace-nowrap",
                  active
                    ? "bg-ink-800 text-white shadow-cardHover"
                    : "bg-white text-ink-600 hover:bg-ink-50 border border-ink-100"
                )}
              >
                {meta && (
                  <span className={cn("w-2 h-2 rounded-full", active ? "bg-white/80" : meta.color.replace("text-", "bg-"))} />
                )}
                {TAB_LABELS[t]}
                <span
                  className={cn(
                    "text-xs px-1.5 py-0.5 rounded-md font-bold",
                    active ? "bg-white/20 text-white" : "bg-ink-100 text-ink-600"
                  )}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
            <input
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              placeholder="搜索需求..."
              className="w-56 pl-9 pr-3 py-2 text-sm rounded-lg bg-white border border-ink-100 focus:border-mint-400 focus:ring-2 focus:ring-mint-400/20 outline-none"
            />
          </div>
          <select
            value={filterIndustry}
            onChange={(e) => setFilterIndustry(e.target.value)}
            className="text-sm rounded-lg bg-white border border-ink-100 px-3 py-2 text-ink-700 focus:border-mint-400 outline-none"
          >
            <option value="">全部行业</option>
            {INDUSTRIES.map((i) => (
              <option key={i} value={i}>
                {i}
              </option>
            ))}
          </select>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as typeof sortBy)}
            className="text-sm rounded-lg bg-white border border-ink-100 px-3 py-2 text-ink-700 focus:border-mint-400 outline-none"
          >
            <option value="new">最新发布</option>
            <option value="budget">预算最高</option>
          </select>
          <button onClick={() => setShowForm(true)} className="btn-primary">
            <Plus size={16} />
            发布需求
          </button>
        </div>
      </div>

      {/* 需求列表 */}
      {filtered.length === 0 ? (
        <div className="card p-16 text-center">
          <FileText size={48} className="mx-auto text-ink-200 mb-3" />
          <div className="font-display text-lg text-ink-600 mb-1">暂无匹配需求</div>
          <div className="text-sm text-ink-400">尝试调整筛选条件或发布新的需求</div>
        </div>
      ) : (
        <div className="grid gap-4">
          {filtered.map((d, idx) => (
            <div
              key={d.id}
              style={{ animationDelay: `${idx * 40}ms` }}
              className="card card-hover p-5 animate-fadeUp cursor-pointer group"
              onClick={() => setSelectedDemand(d)}
            >
              <div className="flex items-start gap-5">
                <div className="w-14 h-14 rounded-xl2 bg-gradient-to-br from-ink-100 to-ink-50 flex items-center justify-center shrink-0 border border-ink-100 group-hover:from-mint-100 group-hover:to-white transition-colors">
                  <Target size={26} className="text-ink-500 group-hover:text-mint-600 transition-colors" strokeWidth={1.8} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h3 className="font-display text-lg text-ink-800 leading-tight group-hover:text-ink-900">
                        {d.title}
                      </h3>
                      <div className="flex items-center gap-3 mt-1.5 text-xs text-ink-400">
                        <span className="flex items-center gap-1">
                          <Building2 size={12} /> {d.publisherCompany}
                        </span>
                        <span>·</span>
                        <span className="flex items-center gap-1">
                          <CalendarClock size={12} /> {formatDate(d.createdAt)}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0" onClick={(e) => e.stopPropagation()}>
                      <StatusBadge status={d.status} />
                      <button
                        onClick={() => toggleFavorite(d.id)}
                        className={cn(
                          "w-9 h-9 rounded-lg flex items-center justify-center transition-all",
                          d.favorite
                            ? "text-amber-500 bg-amber-50 hover:bg-amber-100"
                            : "text-ink-300 hover:text-amber-500 hover:bg-amber-50"
                        )}
                      >
                        {d.favorite ? <Star size={16} fill="currentColor" /> : <StarOff size={16} />}
                      </button>
                    </div>
                  </div>

                  <p className="text-sm text-ink-500 leading-relaxed mb-3 line-clamp-2">
                    {d.dataScope}
                  </p>

                  <div className="flex flex-wrap items-center gap-2">
                    <span className="tag bg-ink-50 text-ink-600 ring-1 ring-ink-100">
                      <Building2 size={12} /> {d.industry}
                    </span>
                    <span className="tag bg-ink-50 text-ink-600 ring-1 ring-ink-100">
                      <MapPin size={12} /> {d.region}
                    </span>
                    <span className="tag bg-blue-50 text-blue-700 ring-1 ring-blue-100">
                      <CalendarClock size={12} /> {d.updateFrequency}
                    </span>
                    <span className="tag bg-mint-50 text-mint-700 ring-1 ring-mint-100 font-semibold">
                      <Banknote size={12} /> 预算 {formatCurrency(d.budget)}
                    </span>
                  </div>
                </div>
                <ChevronRight
                  size={18}
                  className="text-ink-300 group-hover:text-ink-600 group-hover:translate-x-0.5 transition-all mt-6 shrink-0"
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 发布需求表单模态框 */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink-900/40 backdrop-blur-sm animate-fadeUp">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-ink-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-display text-xl text-ink-800">发布数据需求</h2>
                <p className="text-xs text-ink-400 mt-1">填写需求信息，系统将自动匹配相关数据产品</p>
              </div>
              <button onClick={() => setShowForm(false)} className="btn-ghost !px-2 !py-2">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="label">
                  需求标题 <span className="text-amber-500">*</span>
                </label>
                <input
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="例如：全国金融行业小微企业经营数据采购"
                  className="input"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label">所属行业</label>
                  <select
                    value={form.industry}
                    onChange={(e) => setForm({ ...form, industry: e.target.value })}
                    className="input"
                  >
                    {INDUSTRIES.map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label">数据地域范围</label>
                  <select
                    value={form.region}
                    onChange={(e) => setForm({ ...form, region: e.target.value })}
                    className="input"
                  >
                    {REGIONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="label">
                  数据范围描述 <span className="text-amber-500">*</span>
                </label>
                <textarea
                  value={form.dataScope}
                  onChange={(e) => setForm({ ...form, dataScope: e.target.value })}
                  placeholder="请详细描述数据的主体范围、维度要求、样本量、时间跨度等..."
                  rows={3}
                  className="input resize-none"
                />
              </div>

              <div className="space-y-2">
                <label className="label">
                  使用目的 <span className="text-amber-500">*</span>
                </label>
                <textarea
                  value={form.purpose}
                  onChange={(e) => setForm({ ...form, purpose: e.target.value })}
                  placeholder="数据将用于何种业务场景、预期解决的业务问题、预计带来的价值..."
                  rows={2}
                  className="input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label">更新频率</label>
                  <select
                    value={form.updateFrequency}
                    onChange={(e) => setForm({ ...form, updateFrequency: e.target.value })}
                    className="input"
                  >
                    {UPDATE_FREQUENCIES.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label">
                    预算金额：<span className="text-mint-600 font-bold">{formatCurrency(form.budget)}</span>
                  </label>
                  <input
                    type="range"
                    min={10000}
                    max={2000000}
                    step={10000}
                    value={form.budget}
                    onChange={(e) => setForm({ ...form, budget: Number(e.target.value) })}
                    className="w-full accent-mint-500 mt-2.5"
                  />
                  <div className="flex justify-between text-[11px] text-ink-400 font-medium -mt-1">
                    <span>1万</span>
                    <span>200万</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-ink-100 sticky bottom-0 bg-white/95 backdrop-blur-sm">
              <button onClick={() => setShowForm(false)} className="btn-outline">
                取消
              </button>
              <button onClick={handleSubmit} className="btn-primary">
                <Plus size={16} />
                立即发布
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 需求详情抽屉 */}
      {selectedDemand && (
        <div className="fixed inset-0 z-50 bg-ink-900/40 backdrop-blur-sm" onClick={() => setSelectedDemand(null)}>
          <div
            className="absolute right-0 top-0 bottom-0 w-full max-w-xl bg-white shadow-2xl overflow-y-auto scrollbar-thin animate-slideRight"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-white border-b border-ink-100 p-6 z-10">
              <div className="flex items-start justify-between gap-4 mb-3">
                <h2 className="font-display text-xl text-ink-800 leading-snug pr-8">{selectedDemand.title}</h2>
                <button onClick={() => setSelectedDemand(null)} className="btn-ghost !px-2 !py-2 -mr-2 -mt-1">
                  <X size={18} />
                </button>
              </div>
              <div className="flex items-center gap-3 flex-wrap">
                <StatusBadge status={selectedDemand.status} size="md" />
                <span className="text-xs text-ink-400 flex items-center gap-1">
                  <Building2 size={12} /> {selectedDemand.publisherCompany}
                </span>
                <span className="text-xs text-ink-400 flex items-center gap-1">
                  <CalendarClock size={12} /> {formatDate(selectedDemand.createdAt)}
                </span>
              </div>
            </div>

            <div className="p-6 space-y-6">
              <div className="grid grid-cols-2 gap-3">
                <InfoTile icon={Building2} label="行业" value={selectedDemand.industry} />
                <InfoTile icon={MapPin} label="地域" value={selectedDemand.region} />
                <InfoTile icon={TrendingUp} label="更新频率" value={selectedDemand.updateFrequency} />
                <InfoTile icon={Banknote} label="预算" value={formatCurrency(selectedDemand.budget)} accent />
              </div>

              <Section title="数据范围" icon={<Target size={14} />}>
                <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">
                  {selectedDemand.dataScope}
                </p>
              </Section>

              <Section title="使用目的" icon={<FileText size={14} />}>
                <p className="text-sm text-ink-600 leading-relaxed whitespace-pre-wrap">
                  {selectedDemand.purpose}
                </p>
              </Section>

              {selectedDemand.deadline && (
                <Section title="期望交付时间" icon={<CalendarClock size={14} />}>
                  <p className="text-sm text-ink-600 font-semibold">{selectedDemand.deadline}</p>
                </Section>
              )}

              <Section title="沟通会话" icon={<MessageSquare size={14} />}>
                {findCommsByDemand(selectedDemand.id).length > 0 ? (
                  <div className="space-y-2">
                    {findCommsByDemand(selectedDemand.id).map((comm) => (
                      <div
                        key={comm.id}
                        className="p-3 rounded-xl2 border border-ink-100 bg-white hover:border-mint-200 hover:bg-mint-50/30 transition-all"
                      >
                        <div className="flex items-center justify-between gap-3 mb-1.5">
                          <span className="text-sm font-semibold text-ink-800 truncate">
                            {comm.productName}
                          </span>
                          <StatusBadge status={comm.status} size="sm" />
                        </div>
                        <p className="text-xs text-ink-500 line-clamp-1 mb-2">
                          {comm.lastMessage}
                        </p>
                        <button
                          onClick={() => handleEnterCommunication(comm.id)}
                          className="w-full btn-outline !py-1.5 !px-3 text-xs"
                        >
                          <MessageSquare size={12} />
                          进入沟通
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-xs text-ink-400">暂无沟通会话，选择一个产品开始沟通</p>
                    <select
                      value={selectedProductId}
                      onChange={(e) => setSelectedProductId(e.target.value)}
                      className="w-full input !py-2 text-sm"
                    >
                      <option value="">请选择产品</option>
                      {products.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                    <button
                      onClick={() => handleStartCommunication(selectedDemand.id, selectedDemand.title)}
                      disabled={!selectedProductId}
                      className="w-full btn-mint !py-2 text-sm"
                    >
                      <MessageSquare size={14} />
                      开始沟通
                    </button>
                  </div>
                )}
              </Section>

              <Section title="撮合报告历史" icon={<BarChart3 size={14} />}>
                {findReportsByDemand(selectedDemand.id).length > 0 ? (
                  <div className="space-y-2">
                    {findReportsByDemand(selectedDemand.id).map((report) => {
                      const product = products.find((p) => p.id === report.productId);
                      return (
                        <div
                          key={report.id}
                          className="p-3 rounded-xl2 border border-ink-100 bg-white hover:border-mint-200 transition-all"
                        >
                          <div className="flex items-center justify-between gap-3 mb-1.5">
                            <span className="text-sm font-semibold text-ink-800 truncate">
                              {product?.name || "未知产品"}
                            </span>
                            <span className={cn("text-sm font-bold", scoreToColor(report.matchScore))}>
                              {report.matchScore}分
                            </span>
                          </div>
                          <div className="flex items-center justify-between gap-3">
                            <span className="text-xs text-ink-400">
                              {formatDate(report.createdAt)}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedReport(report);
                                setShowReportModal(true);
                              }}
                              className="btn-outline !py-1 !px-2.5 text-[11px]"
                            >
                              <Eye size={12} />
                              查看
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-ink-400">暂无撮合报告</p>
                )}
              </Section>
            </div>

            <div className="sticky bottom-0 p-6 bg-gradient-to-t from-white via-white/95 to-transparent border-t border-ink-100 flex flex-wrap gap-2.5 justify-end">
              <button
                onClick={() => handleClose(selectedDemand.id)}
                disabled={selectedDemand.status === "closed"}
                className="btn-outline"
              >
                <XCircle size={16} />
                关闭需求
              </button>
              <button
                onClick={() => toggleFavorite(selectedDemand.id)}
                className="btn-outline"
              >
                {selectedDemand.favorite ? (
                  <>
                    <Star size={16} fill="currentColor" className="text-amber-500" />
                    取消收藏
                  </>
                ) : (
                  <>
                    <Star size={16} />
                    收藏
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showReportModal && selectedReport && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink-900/40 backdrop-blur-sm animate-fadeUp" onClick={() => setShowReportModal(false)}>
          <div className="card w-full max-w-lg max-h-[85vh] overflow-y-auto scrollbar-thin animate-scaleIn" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-6 border-b border-ink-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-display text-xl text-ink-800">撮合报告详情</h2>
                <p className="text-xs text-ink-400 mt-1">
                  {products.find((p) => p.id === selectedReport.productId)?.name || "未知产品"}
                </p>
              </div>
              <button onClick={() => setShowReportModal(false)} className="btn-ghost !px-2 !py-2">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="flex items-center justify-center py-4">
                <MatchScoreRing score={selectedReport.matchScore} size={120} strokeWidth={10} />
              </div>

              <Section title="各维度评分" icon={<BarChart3 size={14} />}>
                <div className="space-y-3">
                  {selectedReport.dimensionScores.map((dim) => (
                    <div key={dim.name} className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-ink-600 font-medium">{dim.label}</span>
                        <span className={cn("font-bold", scoreToColor(dim.score))}>{dim.score}分</span>
                      </div>
                      <div className="h-2 bg-ink-100 rounded-full overflow-hidden">
                        <div
                          className={cn("h-full rounded-full transition-all", scoreToColor(dim.score).replace("text-", "bg-"))}
                          style={{ width: `${dim.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </Section>

              <Section title="报告摘要" icon={<FileText size={14} />}>
                <p className="text-sm text-ink-600 leading-relaxed">
                  {selectedReport.summary}
                </p>
              </Section>

              {selectedReport.timelinessNote && (
                <Section title="时效性说明" icon={<CalendarClock size={14} />}>
                  <p className="text-sm text-amber-600 leading-relaxed bg-amber-50 p-3 rounded-lg">
                    {selectedReport.timelinessNote}
                  </p>
                </Section>
              )}

              <Section title="优化建议" icon={<Target size={14} />}>
                <ul className="space-y-2">
                  {selectedReport.recommendations.map((rec, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-ink-600">
                      <span className="w-5 h-5 rounded-full bg-mint-100 text-mint-600 flex items-center justify-center text-[11px] font-bold shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </Section>

              <div className="pt-2 border-t border-ink-100">
                <div className="flex items-center justify-between text-xs text-ink-400">
                  <span>生成人：{selectedReport.generatedBy}</span>
                  <span>{formatDateTime(selectedReport.createdAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Section({ title, icon, children }: { title: string; icon?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2.5 text-ink-400">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

function InfoTile({
  icon: Icon,
  label,
  value,
  accent,
}: {
  icon: typeof Building2;
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className={cn("p-4 rounded-xl2 border border-ink-100", accent ? "bg-gradient-to-br from-mint-50 to-white" : "bg-ink-50/60")}>
      <div className="flex items-center gap-2 text-ink-400 mb-1">
        <Icon size={14} />
        <span className="text-[11px] font-semibold uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn("text-sm font-semibold", accent ? "text-mint-600" : "text-ink-800")}>
        {value}
      </div>
    </div>
  );
}

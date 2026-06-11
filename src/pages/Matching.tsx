import { useState, useMemo } from "react";
import {
  SlidersHorizontal,
  Sparkles,
  FileText,
  Download,
  ArrowRightLeft,
  RefreshCw,
  Target,
  Building2,
  MapPin,
  Banknote,
  Clock,
  ChevronDown,
  CheckCircle2,
  Zap,
  X,
  Copy,
  Share2,
  ThumbsUp,
  Lightbulb,
} from "lucide-react";
import { useDemandStore } from "@/store/useDemandStore";
import { useProductStore } from "@/store/useProductStore";
import { useUiStore } from "@/store/useUiStore";
import { MatchScoreRing } from "@/components/MatchScoreRing";
import { StatusBadge } from "@/components/StatusBadge";
import type { MatchReport, MatchResult } from "@/types";
import { INDUSTRIES, REGIONS, UPDATE_FREQUENCIES, PRICE_RANGES } from "@/utils/constants";
import { calculateMatch, generateMatchReport } from "@/utils/matchEngine";
import { formatCurrency, cn, scoreToBg } from "@/utils/formatters";

export default function Matching() {
  const allDemands = useDemandStore((s) => s.demands);
  const demands = useMemo(
    () => allDemands.filter((d) => d.status !== "closed"),
    [allDemands]
  );
  const products = useProductStore((s) => s.products);
  const showToast = useUiStore((s) => s.showToast);

  const [selectedDemandId, setSelectedDemandId] = useState<string>(demands[0]?.id ?? "");
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [timeliness, setTimeliness] = useState("");
  const [priceIdx, setPriceIdx] = useState(0);
  const [minScore, setMinScore] = useState(0);
  const [showDemandPicker, setShowDemandPicker] = useState(false);
  const [report, setReport] = useState<MatchReport | null>(null);

  const selectedDemand = demands.find((d) => d.id === selectedDemandId);

  const results = useMemo<MatchResult[]>(() => {
    if (!selectedDemand) return [];
    const pr = PRICE_RANGES[priceIdx];
    return products
      .map((product) => {
        const { matchScore, dimensionScores } = calculateMatch(selectedDemand, product);
        return {
          id: `${selectedDemand.id}_${product.id}`,
          demandId: selectedDemand.id,
          productId: product.id,
          demand: selectedDemand,
          product,
          matchScore,
          dimensionScores,
        };
      })
      .filter((r) => r.matchScore >= minScore)
      .filter((r) => (industry ? r.product.industry === industry : true))
      .filter((r) => (region ? r.product.region === region : true))
      .filter((r) => (pr.min === 0 && pr.max === Infinity ? true : r.product.price >= pr.min && r.product.price <= pr.max))
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 20);
  }, [selectedDemand, products, industry, region, priceIdx, minScore]);

  const stats = useMemo(() => {
    if (results.length === 0) return { high: 0, mid: 0, low: 0, avg: 0 };
    const scores = results.map((r) => r.matchScore);
    return {
      high: scores.filter((s) => s >= 80).length,
      mid: scores.filter((s) => s >= 60 && s < 80).length,
      low: scores.filter((s) => s < 60).length,
      avg: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length),
    };
  }, [results]);

  const selectedResult = useMemo(() => results[0], [results]);

  const handleGenerateReport = (r: MatchResult) => {
    const { matchScore, dimensionScores } = calculateMatch(r.demand, r.product);
    const rep = generateMatchReport(r.demand, r.product, { matchScore, dimensionScores });
    setReport(rep);
    showToast("success", "撮合报告生成成功！");
  };

  return (
    <div className="space-y-5 animate-fadeUp">
      {/* 顶部筛选栏 */}
      <div className="card p-4">
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative" onClick={() => setShowDemandPicker((s) => !s)}>
            <button
              className="flex items-center gap-2.5 pl-3 pr-2 py-2 rounded-lg border border-ink-200 bg-white hover:border-mint-400 transition-all min-w-[320px] max-w-[440px]"
            >
              <Target size={16} className="text-mint-500 shrink-0" />
              <div className="flex-1 min-w-0 text-left">
                <div className="text-[10px] text-ink-400 font-semibold uppercase tracking-wider leading-tight">
                  待撮合需求
                </div>
                <div className="text-sm font-semibold text-ink-800 truncate leading-tight mt-0.5">
                  {selectedDemand?.title ?? "请选择需求"}
                </div>
              </div>
              <ChevronDown size={16} className="text-ink-400 shrink-0" />
            </button>
            {showDemandPicker && (
              <div
                className="absolute left-0 right-0 top-full mt-2 bg-white border border-ink-100 rounded-xl shadow-cardHover z-30 max-h-80 overflow-y-auto scrollbar-thin animate-scaleIn origin-top-left"
                onClick={(e) => e.stopPropagation()}
              >
                {demands.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setSelectedDemandId(d.id);
                      setShowDemandPicker(false);
                    }}
                    className={cn(
                      "w-full text-left px-4 py-3 border-b border-ink-50 last:border-0 transition-colors",
                      d.id === selectedDemandId ? "bg-mint-50" : "hover:bg-ink-50"
                    )}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-semibold text-ink-800 line-clamp-1">{d.title}</span>
                      <StatusBadge status={d.status} />
                    </div>
                    <div className="text-xs text-ink-400 mt-1 flex items-center gap-2">
                      <Building2 size={10} /> {d.industry} · {d.region} · 预算 {formatCurrency(d.budget)}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="h-7 w-px bg-ink-200 mx-1 hidden md:block" />

          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="input !py-2 !w-auto"
          >
            <option value="">全部行业</option>
            {INDUSTRIES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="input !py-2 !w-auto"
          >
            <option value="">全部地域</option>
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <select
            value={timeliness}
            onChange={(e) => setTimeliness(e.target.value)}
            className="input !py-2 !w-auto"
          >
            <option value="">全部时效</option>
            {UPDATE_FREQUENCIES.map((u) => (
              <option key={u}>{u}</option>
            ))}
          </select>
          <select
            value={priceIdx}
            onChange={(e) => setPriceIdx(Number(e.target.value))}
            className="input !py-2 !w-auto"
          >
            {PRICE_RANGES.map((pr, idx) => (
              <option key={pr.label} value={idx}>
                价格 {pr.label}
              </option>
            ))}
          </select>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-ink-100 bg-white">
            <span className="text-xs text-ink-400 font-semibold whitespace-nowrap">
              最低匹配分
            </span>
            <input
              type="range"
              min={0}
              max={90}
              step={5}
              value={minScore}
              onChange={(e) => setMinScore(Number(e.target.value))}
              className="w-24 accent-mint-500"
            />
            <span className="text-xs font-bold text-mint-600 w-8 text-right">{minScore}+</span>
          </div>

          <div className="flex-1" />

          <button
            onClick={() => showToast("info", "已刷新撮合结果")}
            className="btn-outline"
          >
            <RefreshCw size={16} />
            重新匹配
          </button>
          <button className="btn-primary">
            <Sparkles size={16} />
            AI 智能撮合
          </button>
        </div>
      </div>

      {/* 统计条 */}
      <div className="grid grid-cols-4 gap-4">
        <StatBar label="匹配结果" value={`${results.length}`} unit="个产品" accent="from-ink-700 to-ink-900" Icon={SlidersHorizontal} />
        <StatBar label="高匹配" value={`${stats.high}`} unit="个(≥80分)" accent="from-emerald-500 to-emerald-700" Icon={ThumbsUp} />
        <StatBar label="中等匹配" value={`${stats.mid}`} unit="个(60-79分)" accent="from-mint-400 to-mint-600" Icon={CheckCircle2} />
        <StatBar label="平均匹配度" value={`${stats.avg}`} unit="分" accent="from-amber-400 to-amber-600" Icon={Zap} />
      </div>

      {/* 主内容：左结果列表 + 右详情 */}
      <div className="grid grid-cols-12 gap-5">
        {/* 结果列表 */}
        <div className="col-span-5 space-y-3 max-h-[calc(100vh-360px)] overflow-y-auto scrollbar-thin pr-1">
          {results.length === 0 ? (
            <div className="card p-12 text-center">
              <Target size={44} className="mx-auto text-ink-200 mb-3" />
              <div className="font-display text-lg text-ink-600 mb-1">暂无匹配结果</div>
              <div className="text-sm text-ink-400">尝试放宽筛选条件或调整最低匹配度</div>
            </div>
          ) : (
            results.map((r, idx) => (
              <div
                key={r.id}
                style={{ animationDelay: `${idx * 30}ms` }}
                onClick={() => console.log(r)}
                className={cn(
                  "w-full card p-4 text-left animate-fadeUp transition-all flex items-start gap-4 group",
                  idx === 0
                    ? "ring-2 ring-mint-400/40 shadow-cardHover -translate-y-0.5"
                    : "hover:shadow-cardHover hover:-translate-y-0.5"
                )}
              >
                <MatchScoreRing score={r.matchScore} size={72} strokeWidth={6} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <h3 className="font-display text-base text-ink-800 leading-tight line-clamp-2 group-hover:text-ink-900">
                      {r.product.name}
                    </h3>
                    <span className={cn("w-2.5 h-2.5 rounded-full shrink-0 mt-1.5", scoreToBg(r.matchScore))} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-ink-400 mb-2">
                    <Building2 size={11} /> {r.product.providerCompany}
                  </div>
                  <div className="flex flex-wrap gap-1.5 mb-2">
                    <Tag>
                      <Building2 size={10} /> {r.product.industry}
                    </Tag>
                    <Tag>
                      <MapPin size={10} /> {r.product.region}
                    </Tag>
                    <Tag accent>
                      <Banknote size={10} /> {formatCurrency(r.product.price)}
                    </Tag>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1 -space-x-1">
                      {r.dimensionScores.map((d) => (
                        <div
                          key={d.name}
                          className="h-1.5 w-10 rounded-full bg-ink-100 overflow-hidden"
                          title={`${d.label} ${d.score}分`}
                        >
                          <div
                            className={cn("h-full rounded-full", scoreToBg(d.score))}
                            style={{ width: `${d.score}%` }}
                          />
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleGenerateReport(r);
                      }}
                      className="text-xs font-bold text-mint-600 hover:text-mint-700 px-2.5 py-1 rounded-md bg-mint-50 hover:bg-mint-100 transition-all flex items-center gap-1"
                    >
                      <FileText size={12} />
                      撮合报告
                    </button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* 匹配详情 */}
        <div className="col-span-7 space-y-4">
          {selectedResult ? (
            <>
              {/* 供需配对概览 */}
              <div className="card p-5 relative overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-40 h-40 bg-gradient-to-br from-mint-100/60 to-transparent rounded-full blur-3xl -translate-y-1/2" />
                <div className="relative grid grid-cols-11 gap-3 items-center">
                  <DemandCard demand={selectedResult.demand} />
                  <div className="col-span-1 flex flex-col items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-grad-mint flex items-center justify-center shadow-md shadow-mint-400/30">
                      <ArrowRightLeft size={16} className="text-ink-900" />
                    </div>
                    <div className="mt-2 text-[10px] font-bold text-mint-600 uppercase tracking-widest">
                      撮合
                    </div>
                  </div>
                  <ProductCard product={selectedResult.product} />
                </div>
              </div>

              {/* 匹配维度分析 */}
              <div className="card p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-display text-lg text-ink-800 flex items-center gap-2">
                      <Sparkles size={18} className="text-mint-500" />
                      多维度匹配分析
                    </h3>
                    <p className="text-xs text-ink-400 mt-0.5">基于行业、地域、时效、价格四个维度的加权评分</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {(["industry", "region", "timeliness", "price"] as const).map((k) => {
                      const dim = selectedResult.dimensionScores.find((d) => d.name === k);
                      return (
                        <div
                          key={k}
                          className="text-[10px] font-bold px-2 py-1 rounded-md bg-ink-50 text-ink-500"
                        >
                          {dim?.label} {(dim?.weight * 100).toFixed(0)}%
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3.5">
                  {selectedResult.dimensionScores.map((d, idx) => (
                    <div key={d.name} className="animate-fadeUp" style={{ animationDelay: `${idx * 60}ms` }}>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-sm font-semibold text-ink-700">{d.label}</span>
                        <span className="text-xs font-bold text-ink-500">
                          权重 {(d.weight * 100).toFixed(0)}% · 得分{" "}
                          <span className={cn("text-base font-display", scoreToBg(d.score).replace("bg-", "text-"))}>
                            {d.score}
                          </span>
                        </span>
                      </div>
                      <div className="h-2.5 bg-ink-100 rounded-full overflow-hidden">
                        <div
                          className={cn(
                            "h-full rounded-full transition-all duration-700",
                            scoreToBg(d.score)
                          )}
                          style={{ width: `${d.score}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 操作区 */}
              <div className="card p-5 flex flex-wrap items-center gap-3">
                <button
                  onClick={() => handleGenerateReport(selectedResult)}
                  className="btn-mint flex-1 min-w-[160px]"
                >
                  <Sparkles size={16} />
                  生成撮合报告
                </button>
                <button className="btn-outline">
                  <Share2 size={16} />
                  分享给供需双方
                </button>
                <button className="btn-outline">
                  <Copy size={16} />
                  复制匹配信息
                </button>
                <button className="btn-primary">
                  <Download size={16} />
                  导出撮合结果
                </button>
              </div>
            </>
          ) : (
            <div className="card p-16 text-center">
              <Sparkles size={44} className="mx-auto text-ink-200 mb-3" />
              <div className="font-display text-lg text-ink-600 mb-1">从左侧选择匹配结果查看详情</div>
              <div className="text-sm text-ink-400">系统根据需求特征与产品属性进行多维匹配</div>
            </div>
          )}
        </div>
      </div>

      {/* 撮合报告模态框 */}
      {report && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink-900/40 backdrop-blur-sm animate-fadeUp"
          onClick={() => setReport(null)}
        >
          <div
            className="card w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-ink-100 bg-gradient-to-br from-mint-50 via-white to-white">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-grad-mint flex items-center justify-center shadow-md shadow-mint-400/20">
                  <FileText size={18} className="text-ink-900" />
                </div>
                <div>
                  <h2 className="font-display text-xl text-ink-800">撮合分析报告</h2>
                  <div className="text-xs text-ink-400">
                    报告编号 {report.id} · 生成于 {report.generatedBy}
                  </div>
                </div>
              </div>
              <button onClick={() => setReport(null)} className="btn-ghost !px-2 !py-2">
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-5">
              <div className="grid grid-cols-3 items-center gap-3">
                <div className="p-4 rounded-xl bg-ink-50 border border-ink-100">
                  <div className="text-[10px] font-bold text-ink-400 uppercase tracking-wider mb-1">需求方</div>
                  <div className="text-sm font-semibold text-ink-800 line-clamp-2">{report.demandId && demands.find(d=>d.id===report.demandId)?.publisherCompany}</div>
                </div>
                <div className="flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <MatchScoreRing score={report.matchScore} size={88} />
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-mint-50 border border-mint-100">
                  <div className="text-[10px] font-bold text-mint-600 uppercase tracking-wider mb-1">提供方</div>
                  <div className="text-sm font-semibold text-ink-800 line-clamp-2">{report.productId && products.find(p=>p.id===report.productId)?.providerCompany}</div>
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Lightbulb size={12} /> 综合评价
                </div>
                <p className="text-sm text-ink-700 leading-relaxed p-4 rounded-xl bg-gradient-to-br from-amber-50/70 to-white border border-amber-100">
                  {report.summary}
                </p>
              </div>

              <div>
                <div className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Target size={12} /> 匹配维度明细
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {report.dimensionScores.map((d) => (
                    <div
                      key={d.name}
                      className="p-3 rounded-xl bg-white border border-ink-100"
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-semibold text-ink-600">{d.label}</span>
                        <span className={cn("text-base font-display font-bold", scoreToBg(d.score).replace("bg-", "text-"))}>
                          {d.score}
                        </span>
                      </div>
                      <div className="h-1.5 bg-ink-100 rounded-full overflow-hidden">
                        <div className={cn("h-full", scoreToBg(d.score))} style={{ width: `${d.score}%` }} />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <div className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <CheckCircle2 size={12} /> 运营建议
                </div>
                <ol className="space-y-2">
                  {report.recommendations.map((r, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-sm text-ink-700 p-3 rounded-lg bg-ink-50/60 border border-ink-100">
                      <span className="w-5 h-5 rounded-full bg-ink-800 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">
                        {idx + 1}
                      </span>
                      <span className="leading-relaxed">{r}</span>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-5 border-t border-ink-100">
              <button className="btn-outline">
                <Copy size={16} /> 复制报告
              </button>
              <button className="btn-outline">
                <Share2 size={16} /> 推送双方
              </button>
              <button className="btn-primary">
                <Download size={16} /> 导出 PDF
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function StatBar({
  label,
  value,
  unit,
  accent,
  Icon,
}: {
  label: string;
  value: string;
  unit: string;
  accent: string;
  Icon: typeof Sparkles;
}) {
  return (
    <div className="card p-4 relative overflow-hidden">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs font-semibold text-ink-400">{label}</div>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className={cn("font-display text-2xl bg-gradient-to-br bg-clip-text text-transparent font-bold", accent)}>
              {value}
            </span>
            <span className="text-xs text-ink-400">{unit}</span>
          </div>
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center text-white bg-gradient-to-br shadow-md", accent)}>
          <Icon size={18} />
        </div>
      </div>
    </div>
  );
}

function DemandCard({ demand }: { demand: MatchResult["demand"] }) {
  return (
    <div className="col-span-5 p-4 rounded-xl bg-white border border-ink-200 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest">
        <Target size={11} /> 需求侧
      </div>
      <div className="text-sm font-semibold text-ink-800 leading-snug line-clamp-2 mb-2">
        {demand.title}
      </div>
      <div className="flex flex-wrap gap-1">
        <Tag><Building2 size={9} /> {demand.industry}</Tag>
        <Tag><MapPin size={9} /> {demand.region}</Tag>
        <Tag><Clock size={9} /> {demand.updateFrequency}</Tag>
      </div>
    </div>
  );
}

function ProductCard({ product }: { product: MatchResult["product"] }) {
  return (
    <div className="col-span-5 p-4 rounded-xl bg-gradient-to-br from-mint-50 to-white border border-mint-200 shadow-sm">
      <div className="flex items-center gap-1.5 mb-2 text-[10px] font-bold text-mint-700 uppercase tracking-widest">
        <Building2 size={11} /> 供给侧
      </div>
      <div className="text-sm font-semibold text-ink-800 leading-snug line-clamp-2 mb-2">
        {product.name}
      </div>
      <div className="flex flex-wrap gap-1">
        <Tag><Building2 size={9} /> {product.providerCompany.split("（")[0]}</Tag>
        <Tag><MapPin size={9} /> {product.region}</Tag>
        <Tag accent><Banknote size={9} /> {formatCurrency(product.price)}</Tag>
      </div>
    </div>
  );
}

function Tag({ children, accent }: { children: React.ReactNode; accent?: boolean }) {
  return (
    <span
      className={cn(
        "tag ring-1 ring-inset",
        accent
          ? "bg-mint-50 text-mint-700 ring-mint-100"
          : "bg-ink-50 text-ink-600 ring-ink-100"
      )}
    >
      {children}
    </span>
  );
}

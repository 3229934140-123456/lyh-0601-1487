import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Star,
  StarOff,
  Search,
  SlidersHorizontal,
  GitCompareArrows,
  X,
  Building2,
  MapPin,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  Eye,
  Database,
  FileJson,
  Download,
  Star as StarIcon,
  Sparkles,
  Handshake,
  Trash2,
  Plus,
} from "lucide-react";
import { useProductStore } from "@/store/useProductStore";
import { useDemandStore } from "@/store/useDemandStore";
import { useCommunicationStore } from "@/store/useCommunicationStore";
import { useUiStore } from "@/store/useUiStore";
import type { Product } from "@/types";
import { INDUSTRIES, REGIONS, DELIVERY_FORMS, UPDATE_FREQUENCIES, PRICE_RANGES } from "@/utils/constants";
import { formatCurrency, cn, scoreToColor } from "@/utils/formatters";

const PRICE_UNITS = ["元/年", "元/季", "元/月", "元/项目", "元/次"];

const emptyField = () => ({ name: "", type: "", description: "", example: "" });

const initProductForm = () => ({
  name: "",
  description: "",
  industry: INDUSTRIES[0],
  region: REGIONS[7],
  coverage: "",
  deliveryForms: [] as string[],
  updateFrequency: UPDATE_FREQUENCIES[2],
  restrictions: "",
  price: 100000,
  priceUnit: "元/年",
  sampleFields: [emptyField()],
  provider: "当前用户",
  providerCompany: "示例企业有限公司",
});

export default function Showcase() {
  const products = useProductStore((s) => s.products);
  const filterFn = useProductStore((s) => s.filter);
  const toggleFavorite = useProductStore((s) => s.toggleFavorite);
  const toggleCompare = useProductStore((s) => s.toggleCompare);
  const clearCompare = useProductStore((s) => s.clearCompare);
  const compareIds = useProductStore((s) => s.compareIds);
  const addProduct = useProductStore((s) => s.addProduct);
  const showToast = useUiStore((s) => s.showToast);
  const demands = useDemandStore((s) => s.demands);
  const findOrCreateByDemand = useCommunicationStore((s) => s.findOrCreateByDemand);
  const sendMessage = useCommunicationStore((s) => s.sendMessage);
  const navigate = useNavigate();

  const [keyword, setKeyword] = useState("");
  const [industry, setIndustry] = useState("");
  const [region, setRegion] = useState("");
  const [delivery, setDelivery] = useState("");
  const [priceIdx, setPriceIdx] = useState(0);
  const [selected, setSelected] = useState<Product | null>(null);
  const [showCompare, setShowCompare] = useState(false);
  const [showFilters, setShowFilters] = useState(true);

  const [showProductForm, setShowProductForm] = useState(false);
  const [productForm, setProductForm] = useState(initProductForm);

  const [showIntentionModal, setShowIntentionModal] = useState(false);
  const [intentionProduct, setIntentionProduct] = useState<Product | null>(null);
  const [intentionForm, setIntentionForm] = useState({ demandId: "", note: "" });

  const filtered = useMemo(() => {
    const pr = PRICE_RANGES[priceIdx];
    return filterFn({
      keyword,
      industry,
      region,
      delivery,
      minPrice: pr.min,
      maxPrice: pr.max === Infinity ? undefined : pr.max,
    });
  }, [keyword, industry, region, delivery, priceIdx, filterFn]);

  const compareProducts = useMemo(
    () => compareIds.map((id) => products.find((p) => p.id === id)!).filter(Boolean),
    [compareIds, products]
  );

  const openDemands = demands.filter((d) => d.status !== "closed");

  const handleIntention = (p: Product) => {
    setIntentionProduct(p);
    setIntentionForm({ demandId: "", note: "" });
    setShowIntentionModal(true);
  };

  const handleIntentionSubmit = () => {
    if (!intentionProduct || !intentionForm.demandId) return;
    const demand = demands.find((d) => d.id === intentionForm.demandId);
    if (!demand) return;
    const comm = findOrCreateByDemand(
      demand.id,
      demand.title,
      intentionProduct.id,
      intentionProduct.name,
      intentionProduct.providerCompany
    );
    sendMessage({
      communicationId: comm.id,
      sender: "当前用户",
      senderRole: "demand",
      type: "intention",
      content: `【采购意向】对产品[${intentionProduct.name}]表达采购意向，关联需求：${demand.title}`,
    });
    setShowIntentionModal(false);
    setSelected(null);
    navigate("/communication");
  };

  const toggleDeliveryForm = (form: string) => {
    setProductForm((prev) => ({
      ...prev,
      deliveryForms: prev.deliveryForms.includes(form)
        ? prev.deliveryForms.filter((f) => f !== form)
        : [...prev.deliveryForms, form],
    }));
  };

  const updateSampleField = (idx: number, key: string, value: string) => {
    setProductForm((prev) => ({
      ...prev,
      sampleFields: prev.sampleFields.map((f, i) =>
        i === idx ? { ...f, [key]: value } : f
      ),
    }));
  };

  const addSampleField = () => {
    setProductForm((prev) => ({
      ...prev,
      sampleFields: [...prev.sampleFields, emptyField()],
    }));
  };

  const removeSampleField = (idx: number) => {
    setProductForm((prev) => ({
      ...prev,
      sampleFields: prev.sampleFields.filter((_, i) => i !== idx),
    }));
  };

  const handleProductSubmit = () => {
    if (!productForm.name.trim() || !productForm.description.trim()) {
      showToast("error", "请填写必填字段");
      return;
    }
    addProduct({
      name: productForm.name,
      description: productForm.description,
      industry: productForm.industry,
      region: productForm.region,
      coverage: productForm.coverage,
      deliveryForm: productForm.deliveryForms.join(" + "),
      updateFrequency: productForm.updateFrequency,
      restrictions: productForm.restrictions,
      price: productForm.price,
      priceUnit: productForm.priceUnit,
      sampleFields: productForm.sampleFields.filter((f) => f.name.trim()),
      provider: productForm.provider,
      providerCompany: productForm.providerCompany,
    });
    setShowProductForm(false);
    setProductForm(initProductForm());
    showToast("success", "产品发布成功！已加入产品橱窗");
  };

  return (
    <div className="space-y-5 animate-fadeUp">
      <div className="card p-4 flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[260px] max-w-md">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400" />
          <input
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            placeholder="搜索数据产品、提供方、关键字..."
            className="input pl-10"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={industry}
            onChange={(e) => setIndustry(e.target.value)}
            className="input max-w-[140px]"
          >
            <option value="">全部行业</option>
            {INDUSTRIES.map((i) => (
              <option key={i}>{i}</option>
            ))}
          </select>
          <select
            value={region}
            onChange={(e) => setRegion(e.target.value)}
            className="input max-w-[140px]"
          >
            <option value="">全部地域</option>
            {REGIONS.map((r) => (
              <option key={r}>{r}</option>
            ))}
          </select>
          <button
            onClick={() => setShowFilters((s) => !s)}
            className={cn(
              "btn-outline",
              (delivery || priceIdx > 0) && "!border-mint-400 !text-mint-700 !bg-mint-50"
            )}
          >
            <SlidersHorizontal size={16} />
            高级筛选
          </button>
          <div className="h-6 w-px bg-ink-200 mx-1" />
          <button
            onClick={() => compareProducts.length >= 2 && setShowCompare(true)}
            disabled={compareProducts.length < 2}
            className={cn(
              "btn-outline relative",
              compareProducts.length >= 2 && "!border-mint-400 !text-mint-700 !bg-mint-50"
            )}
          >
            <GitCompareArrows size={16} />
            对比
            {compareIds.length > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold bg-amber-400 text-white rounded-full flex items-center justify-center shadow-md">
                {compareIds.length}
              </span>
            )}
          </button>
          <div className="text-xs text-ink-400 font-semibold px-2">
            共 <span className="text-ink-800">{filtered.length}</span> 个产品
          </div>
          <button onClick={() => setShowProductForm(true)} className="btn-primary">
            <Plus size={16} />
            发布产品
          </button>
        </div>
      </div>

      {showFilters && (
        <div className="card p-5 animate-fadeUp">
          <div className="grid md:grid-cols-3 gap-5">
            <div>
              <div className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2.5">
                可交付形式
              </div>
              <div className="flex flex-wrap gap-1.5">
                <Chip active={!delivery} onClick={() => setDelivery("")}>
                  全部
                </Chip>
                {DELIVERY_FORMS.slice(0, 4).map((d) => (
                  <Chip key={d} active={delivery === d} onClick={() => setDelivery(d === delivery ? "" : d)}>
                    {d.split(" ")[0]}
                  </Chip>
                ))}
                <Chip
                  active={delivery && !DELIVERY_FORMS.slice(0, 4).includes(delivery)}
                  onClick={() => setDelivery(delivery && DELIVERY_FORMS.slice(0, 4).includes(delivery) ? "" : DELIVERY_FORMS[4])}
                >
                  其他
                </Chip>
              </div>
            </div>
            <div className="md:col-span-2">
              <div className="text-xs font-bold text-ink-400 uppercase tracking-wider mb-2.5">
                价格区间
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRICE_RANGES.map((pr, idx) => (
                  <Chip key={pr.label} active={priceIdx === idx} onClick={() => setPriceIdx(idx)}>
                    {pr.label}
                  </Chip>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {compareIds.length > 0 && !showCompare && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 animate-fadeUp">
          <div className="card px-5 py-3 flex items-center gap-4 shadow-cardHover">
            <GitCompareArrows size={18} className="text-mint-500" />
            <div className="flex items-center gap-2">
              {compareProducts.map((p) => (
                <div
                  key={p.id}
                  className="flex items-center gap-1.5 bg-ink-50 border border-ink-100 rounded-lg px-2.5 py-1"
                >
                  <span className="text-xs font-semibold text-ink-700 max-w-[120px] truncate">
                    {p.name}
                  </span>
                  <button
                    onClick={() => toggleCompare(p.id)}
                    className="text-ink-300 hover:text-amber-500 transition-colors"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
            <span className="text-xs text-ink-400">
              还可选 {3 - compareIds.length} 个
            </span>
            <div className="h-5 w-px bg-ink-200" />
            <button onClick={clearCompare} className="text-xs text-ink-400 hover:text-amber-600 font-semibold">
              清空
            </button>
            <button
              onClick={() => compareProducts.length >= 2 && setShowCompare(true)}
              disabled={compareProducts.length < 2}
              className="btn-mint !py-1.5 !px-4 text-xs"
            >
              开始对比
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filtered.map((p, idx) => (
          <ProductCard
            key={p.id}
            product={p}
            idx={idx}
            inCompare={compareIds.includes(p.id)}
            onToggleCompare={() => toggleCompare(p.id)}
            onToggleFav={() => toggleFavorite(p.id)}
            onClick={() => setSelected(p)}
          />
        ))}
      </div>

      {selected && (
        <ProductDetail
          product={selected}
          onClose={() => setSelected(null)}
          onFavorite={() => toggleFavorite(selected.id)}
          onIntention={() => handleIntention(selected)}
        />
      )}

      {showCompare && (
        <CompareModal products={compareProducts} onClose={() => setShowCompare(false)} />
      )}

      {showProductForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink-900/40 backdrop-blur-sm animate-fadeUp">
          <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto scrollbar-thin animate-scaleIn">
            <div className="flex items-center justify-between p-6 border-b border-ink-100 sticky top-0 bg-white z-10">
              <div>
                <h2 className="font-display text-xl text-ink-800">发布数据产品</h2>
                <p className="text-xs text-ink-400 mt-1">填写产品信息，发布后将展示在产品橱窗</p>
              </div>
              <button onClick={() => { setShowProductForm(false); setProductForm(initProductForm()); }} className="btn-ghost !px-2 !py-2">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="label">
                  产品名称 <span className="text-amber-500">*</span>
                </label>
                <input
                  value={productForm.name}
                  onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                  placeholder="例如：全国企业工商注册数据集"
                  className="input"
                />
              </div>

              <div className="space-y-2">
                <label className="label">
                  产品说明 <span className="text-amber-500">*</span>
                </label>
                <textarea
                  value={productForm.description}
                  onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                  placeholder="详细描述产品内容、数据来源、应用场景..."
                  rows={3}
                  className="input resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label">所属行业</label>
                  <select
                    value={productForm.industry}
                    onChange={(e) => setProductForm({ ...productForm, industry: e.target.value })}
                    className="input"
                  >
                    {INDUSTRIES.map((i) => (
                      <option key={i}>{i}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label">覆盖地域</label>
                  <select
                    value={productForm.region}
                    onChange={(e) => setProductForm({ ...productForm, region: e.target.value })}
                    className="input"
                  >
                    {REGIONS.map((r) => (
                      <option key={r}>{r}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="label">数据覆盖范围</label>
                <input
                  value={productForm.coverage}
                  onChange={(e) => setProductForm({ ...productForm, coverage: e.target.value })}
                  placeholder="例如：覆盖全国31省300万+企业"
                  className="input"
                />
              </div>

              <div className="space-y-2">
                <label className="label">可交付形式</label>
                <div className="flex flex-wrap gap-2">
                  {DELIVERY_FORMS.map((df) => (
                    <label
                      key={df}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg border cursor-pointer transition-all",
                        productForm.deliveryForms.includes(df)
                          ? "bg-ink-800 text-white border-ink-800 shadow-sm"
                          : "bg-white text-ink-600 border-ink-200 hover:border-mint-400 hover:text-mint-700"
                      )}
                    >
                      <input
                        type="checkbox"
                        className="accent-mint-500"
                        checked={productForm.deliveryForms.includes(df)}
                        onChange={() => toggleDeliveryForm(df)}
                      />
                      {df.split(" ")[0]}
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="label">更新频率</label>
                  <select
                    value={productForm.updateFrequency}
                    onChange={(e) => setProductForm({ ...productForm, updateFrequency: e.target.value })}
                    className="input"
                  >
                    {UPDATE_FREQUENCIES.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="label">价格单位</label>
                  <select
                    value={productForm.priceUnit}
                    onChange={(e) => setProductForm({ ...productForm, priceUnit: e.target.value })}
                    className="input"
                  >
                    {PRICE_UNITS.map((u) => (
                      <option key={u}>{u}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-2">
                <label className="label">
                  价格：<span className="text-mint-600 font-bold">{formatCurrency(productForm.price)}</span>
                  <span className="text-ink-400 font-normal text-xs ml-1">{productForm.priceUnit}</span>
                </label>
                <input
                  type="range"
                  min={10000}
                  max={2000000}
                  step={10000}
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: Number(e.target.value) })}
                  className="w-full accent-mint-500 mt-1"
                />
                <div className="flex justify-between text-[11px] text-ink-400 font-medium">
                  <span>1万</span>
                  <span>200万</span>
                </div>
              </div>

              <div className="space-y-2">
                <label className="label">限制条件</label>
                <textarea
                  value={productForm.restrictions}
                  onChange={(e) => setProductForm({ ...productForm, restrictions: e.target.value })}
                  placeholder="数据使用限制、合规要求、授权范围..."
                  rows={2}
                  className="input resize-none"
                />
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="label !mb-0">样例字段</label>
                  <button onClick={addSampleField} className="text-xs font-semibold text-mint-600 hover:text-mint-700 flex items-center gap-1">
                    <Plus size={12} /> 添加字段
                  </button>
                </div>
                <div className="space-y-2">
                  {productForm.sampleFields.map((field, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className="grid grid-cols-4 gap-2 flex-1">
                        <input
                          value={field.name}
                          onChange={(e) => updateSampleField(idx, "name", e.target.value)}
                          placeholder="字段名"
                          className="input text-xs"
                        />
                        <input
                          value={field.type}
                          onChange={(e) => updateSampleField(idx, "type", e.target.value)}
                          placeholder="类型"
                          className="input text-xs"
                        />
                        <input
                          value={field.description}
                          onChange={(e) => updateSampleField(idx, "description", e.target.value)}
                          placeholder="描述"
                          className="input text-xs"
                        />
                        <input
                          value={field.example ?? ""}
                          onChange={(e) => updateSampleField(idx, "example", e.target.value)}
                          placeholder="示例"
                          className="input text-xs"
                        />
                      </div>
                      <button
                        onClick={() => removeSampleField(idx)}
                        className="mt-1.5 text-ink-300 hover:text-amber-500 transition-colors shrink-0"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-ink-100 sticky bottom-0 bg-white/95 backdrop-blur-sm">
              <button onClick={() => { setShowProductForm(false); setProductForm(initProductForm()); }} className="btn-outline">
                取消
              </button>
              <button onClick={handleProductSubmit} className="btn-primary">
                <Plus size={16} />
                立即发布
              </button>
            </div>
          </div>
        </div>
      )}

      {showIntentionModal && intentionProduct && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-6 bg-ink-900/40 backdrop-blur-sm animate-fadeUp" onClick={() => setShowIntentionModal(false)}>
          <div
            className="card w-full max-w-lg animate-scaleIn"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-6 border-b border-ink-100">
              <div>
                <h2 className="font-display text-xl text-ink-800 flex items-center gap-2">
                  <Handshake size={20} className="text-mint-500" />
                  发起采购意向
                </h2>
                <p className="text-xs text-ink-400 mt-1">
                  对产品【{intentionProduct.name}】发起意向，将创建沟通通道
                </p>
              </div>
              <button onClick={() => setShowIntentionModal(false)} className="btn-ghost !px-2 !py-2">
                <X size={18} />
              </button>
            </div>

            <div className="p-6 space-y-5">
              <div className="space-y-2">
                <label className="label">
                  关联需求 <span className="text-amber-500">*</span>
                </label>
                <select
                  value={intentionForm.demandId}
                  onChange={(e) => setIntentionForm({ ...intentionForm, demandId: e.target.value })}
                  className="input"
                >
                  <option value="">请选择需求</option>
                  {openDemands.map((d) => (
                    <option key={d.id} value={d.id}>{d.title}</option>
                  ))}
                </select>
                {openDemands.length === 0 && (
                  <p className="text-xs text-ink-400">暂无可关联的需求，请先发布需求</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="label">备注信息</label>
                <textarea
                  value={intentionForm.note}
                  onChange={(e) => setIntentionForm({ ...intentionForm, note: e.target.value })}
                  placeholder="可补充说明您的采购意向、关注点、期望等..."
                  rows={3}
                  className="input resize-none"
                />
              </div>

              <div className="p-4 rounded-xl2 bg-mint-50/60 border border-mint-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-mint-100 to-white border border-mint-100 flex items-center justify-center shrink-0">
                    <Database size={20} className="text-mint-600" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-ink-800 truncate">{intentionProduct.name}</div>
                    <div className="text-xs text-ink-400 flex items-center gap-2 mt-0.5">
                      <span className="flex items-center gap-1"><Building2 size={10} /> {intentionProduct.providerCompany}</span>
                      <span className="text-mint-600 font-semibold">{formatCurrency(intentionProduct.price)}{intentionProduct.priceUnit}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-ink-100">
              <button onClick={() => setShowIntentionModal(false)} className="btn-outline">
                取消
              </button>
              <button
                onClick={handleIntentionSubmit}
                disabled={!intentionForm.demandId}
                className={cn("btn-primary", !intentionForm.demandId && "opacity-50 cursor-not-allowed")}
              >
                <Handshake size={16} />
                确认发起
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all",
        active
          ? "bg-ink-800 text-white border-ink-800 shadow-sm"
          : "bg-white text-ink-600 border-ink-200 hover:border-mint-400 hover:text-mint-700"
      )}
    >
      {children}
    </button>
  );
}

function ProductCard({
  product,
  idx,
  inCompare,
  onToggleCompare,
  onToggleFav,
  onClick,
}: {
  product: Product;
  idx: number;
  inCompare: boolean;
  onToggleCompare: () => void;
  onToggleFav: () => void;
  onClick: () => void;
}) {
  return (
    <div
      style={{ animationDelay: `${idx * 40}ms` }}
      className="card card-hover overflow-hidden animate-fadeUp cursor-pointer group flex flex-col"
      onClick={onClick}
    >
      <div className="h-24 relative bg-gradient-to-br from-ink-50 via-white to-mint-50 overflow-hidden border-b border-ink-100">
        <div className="absolute inset-0 bg-grid-texture grid-bg opacity-40" />
        <div className="absolute left-4 bottom-3">
          <div className="w-11 h-11 rounded-xl bg-white shadow-sm border border-ink-100 flex items-center justify-center group-hover:shadow-md transition-all">
            <Database size={22} className="text-ink-600" strokeWidth={1.8} />
          </div>
        </div>
        <div className="absolute right-3 top-3 flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
          <label
            className={cn(
              "flex items-center gap-1.5 text-[10px] font-bold px-2 py-1 rounded-md transition-all",
              inCompare
                ? "bg-mint-100 text-mint-700"
                : "bg-white/80 text-ink-400 opacity-0 group-hover:opacity-100"
            )}
          >
            <input type="checkbox" className="accent-mint-500" checked={inCompare} onChange={onToggleCompare} />
            对比
          </label>
          <button
            onClick={onToggleFav}
            className={cn(
              "w-8 h-8 rounded-md flex items-center justify-center transition-all",
              product.favorite
                ? "text-amber-500 bg-amber-50"
                : "bg-white/80 text-ink-300 hover:text-amber-500"
            )}
          >
            {product.favorite ? <Star size={14} fill="currentColor" /> : <StarOff size={14} />}
          </button>
        </div>
        <div className="absolute right-3 bottom-3 flex items-center gap-1.5">
          <span className="tag bg-white/90 text-ink-600 border border-ink-100 shadow-sm">
            <Building2 size={11} /> {product.industry}
          </span>
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1 min-h-0">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="font-display text-base text-ink-800 leading-snug group-hover:text-ink-900 line-clamp-2">
            {product.name}
          </h3>
          <div className="flex items-center gap-0.5 shrink-0 text-amber-500 mt-0.5">
            <StarIcon size={12} fill="currentColor" />
            <span className="text-xs font-bold text-ink-700">{product.rating}</span>
          </div>
        </div>

        <p className="text-xs text-ink-500 leading-relaxed line-clamp-2 mb-3">
          {product.description}
        </p>

        <div className="mb-3 flex flex-wrap gap-1.5">
          {product.sampleFields.slice(0, 4).map((f) => (
            <span
              key={f.name}
              className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-ink-50 text-ink-500 border border-ink-100"
            >
              {f.name}
            </span>
          ))}
          {product.sampleFields.length > 4 && (
            <span className="text-[10px] px-1.5 py-0.5 rounded font-mono bg-mint-50 text-mint-700 border border-mint-100">
              +{product.sampleFields.length - 4}
            </span>
          )}
        </div>

        <div className="mt-auto pt-3 border-t border-ink-100 flex items-center justify-between">
          <div>
            <div className={cn("font-display text-lg font-bold", scoreToColor(product.price / 20000 < 5 ? 0 : 75))}>
              {formatCurrency(product.price)}
              <span className="text-[10px] font-normal text-ink-400 ml-1">{product.priceUnit}</span>
            </div>
            <div className="text-[10px] text-ink-400 flex items-center gap-1 mt-0.5">
              <MapPin size={10} /> {product.coverage} · {product.dealsCount} 次交易
            </div>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            className="text-xs font-bold text-ink-600 hover:text-mint-600 px-3 py-1.5 rounded-lg border border-ink-100 hover:border-mint-300 hover:bg-mint-50 transition-all flex items-center gap-1"
          >
            <Eye size={12} /> 查看
          </button>
        </div>
      </div>
    </div>
  );
}

function ProductDetail({
  product,
  onClose,
  onFavorite,
  onIntention,
}: {
  product: Product;
  onClose: () => void;
  onFavorite: () => void;
  onIntention: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink-900/40 backdrop-blur-sm animate-fadeUp" onClick={onClose}>
      <div
        className="card w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-ink-100">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-xl2 bg-gradient-to-br from-mint-100 to-white border border-mint-100 flex items-center justify-center">
              <Database size={28} className="text-mint-600" />
            </div>
            <div>
              <h2 className="font-display text-xl text-ink-800">{product.name}</h2>
              <div className="flex items-center gap-3 mt-1 text-xs text-ink-400">
                <span className="flex items-center gap-1"><Building2 size={12} /> {product.providerCompany}</span>
                <span className="flex items-center gap-1"><StarIcon size={12} className="text-amber-500" fill="currentColor" /> {product.rating} 分 · {product.dealsCount}次交易</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="btn-ghost !px-2 !py-2">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-thin p-6 space-y-6">
          <div className="grid grid-cols-4 gap-3">
            <MiniStat icon={Building2} label="行业" value={product.industry} />
            <MiniStat icon={MapPin} label="地域" value={product.region} />
            <MiniStat icon={Download} label="交付形式" value={product.deliveryForm.split(" ")[0]} />
            <MiniStat icon={Banknote} label="价格" value={formatCurrency(product.price)} accent />
          </div>

          <DetailSection title="产品说明" icon={<FileJson size={14} />}>
            <p className="text-sm text-ink-600 leading-relaxed">{product.description}</p>
          </DetailSection>

          <DetailSection title="样例字段" icon={<Sparkles size={14} />}>
            <div className="border border-ink-100 rounded-xl2 overflow-hidden">
              <table className="w-full text-sm">
                <thead className="bg-ink-50 text-[11px] text-ink-400 uppercase tracking-wider">
                  <tr>
                    <th className="text-left font-bold px-4 py-2.5">字段名</th>
                    <th className="text-left font-bold px-4 py-2.5">类型</th>
                    <th className="text-left font-bold px-4 py-2.5">描述</th>
                    <th className="text-left font-bold px-4 py-2.5">示例</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-ink-100">
                  {product.sampleFields.map((f) => (
                    <tr key={f.name} className="hover:bg-ink-50/50">
                      <td className="px-4 py-2.5 font-mono text-xs text-mint-700 font-semibold">{f.name}</td>
                      <td className="px-4 py-2.5 text-xs text-ink-500">{f.type}</td>
                      <td className="px-4 py-2.5 text-xs text-ink-600">{f.description}</td>
                      <td className="px-4 py-2.5 text-xs font-mono text-ink-500 bg-ink-50/50 border-l border-ink-100">
                        {f.example}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </DetailSection>

          <div className="grid md:grid-cols-2 gap-4">
            <DetailSection title="可交付形式" icon={<Download size={14} />}>
              <div className="flex flex-wrap gap-1.5">
                {product.deliveryForm.split("+").map((d) => (
                  <span key={d} className="tag bg-mint-50 text-mint-700 ring-1 ring-mint-100">
                    <CheckCircle2 size={11} /> {d.trim()}
                  </span>
                ))}
              </div>
            </DetailSection>
            <DetailSection title="数据覆盖范围" icon={<MapPin size={14} />}>
              <p className="text-sm text-ink-600 font-semibold">{product.coverage}</p>
            </DetailSection>
          </div>

          <DetailSection title="限制条件与合规" icon={<ShieldCheck size={14} />}>
            <div className="p-4 rounded-xl2 bg-amber-50/60 border border-amber-100">
              <p className="text-sm text-amber-800 leading-relaxed">{product.restrictions}</p>
            </div>
          </DetailSection>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-ink-100 bg-white/80 backdrop-blur-sm">
          <button onClick={onFavorite} className="btn-outline">
            {product.favorite ? (
              <><Star size={16} fill="#F59E0B" className="text-amber-500" /> 已收藏</>
            ) : (
              <><StarOff size={16} /> 收藏</>
            )}
          </button>
          <button onClick={onIntention} className="btn-mint">
            <Handshake size={16} /> 发起采购意向
          </button>
        </div>
      </div>
    </div>
  );
}

function CompareModal({ products, onClose }: { products: Product[]; onClose: () => void }) {
  const fields = ["行业", "地域", "价格", "评分", "交易次数", "覆盖范围", "交付形式"];
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-ink-900/40 backdrop-blur-sm animate-fadeUp" onClick={onClose}>
      <div
        className="card w-full max-w-5xl max-h-[90vh] overflow-hidden flex flex-col animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-6 border-b border-ink-100">
          <div>
            <h2 className="font-display text-xl text-ink-800 flex items-center gap-2">
              <GitCompareArrows size={20} className="text-mint-500" />
              产品对比分析
            </h2>
            <p className="text-xs text-ink-400 mt-1">多维度对比 {products.length} 个数据产品的差异</p>
          </div>
          <button onClick={onClose} className="btn-ghost !px-2 !py-2">
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-auto scrollbar-thin">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-ink-50/80 sticky top-0 z-10">
                <th className="text-left text-[11px] font-bold text-ink-400 uppercase tracking-wider px-6 py-4 w-40 border-b border-ink-100">
                  对比维度
                </th>
                {products.map((p) => (
                  <th key={p.id} className="text-left px-6 py-4 border-b border-ink-100 min-w-[260px]">
                    <div className="font-display text-base text-ink-800 leading-tight mb-1">{p.name}</div>
                    <div className="text-xs text-ink-400">{p.providerCompany}</div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {[
                { label: "行业", get: (p: Product) => p.industry },
                { label: "地域", get: (p: Product) => p.region },
                {
                  label: "价格",
                  get: (p: Product) => (
                    <span className="font-bold text-mint-600">
                      {formatCurrency(p.price)}
                      <span className="text-ink-400 font-normal text-xs ml-1">{p.priceUnit}</span>
                    </span>
                  ),
                },
                {
                  label: "评分",
                  get: (p: Product) => (
                    <span className="flex items-center gap-1">
                      <StarIcon size={12} className="text-amber-500" fill="currentColor" />
                      <span className="font-bold text-ink-700">{p.rating}</span>
                    </span>
                  ),
                },
                { label: "交易次数", get: (p: Product) => `${p.dealsCount} 次` },
                { label: "覆盖范围", get: (p: Product) => p.coverage },
                {
                  label: "交付形式",
                  get: (p: Product) => (
                    <div className="flex flex-wrap gap-1">
                      {p.deliveryForm.split("+").map((d) => (
                        <span key={d} className="text-[10px] px-2 py-0.5 rounded bg-mint-50 text-mint-700 font-semibold">
                          {d.trim()}
                        </span>
                      ))}
                    </div>
                  ),
                },
                { label: "样例字段数", get: (p: Product) => `${p.sampleFields.length} 个` },
                {
                  label: "合规标签",
                  get: () => (
                    <span className="tag bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
                      <ShieldCheck size={10} /> 合规审核通过
                    </span>
                  ),
                },
              ].map((row, ridx) => (
                <tr key={row.label} className={ridx % 2 === 0 ? "bg-white" : "bg-ink-50/30"}>
                  <td className="px-6 py-3.5 text-xs font-semibold text-ink-500 uppercase tracking-wider border-r border-ink-100">
                    {row.label}
                  </td>
                  {products.map((p) => (
                    <td key={p.id} className="px-6 py-3.5 text-sm text-ink-700">
                      {typeof row.get === "function" ? row.get(p) : ""}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <td className="px-6 py-4 bg-ink-800/5 border-t-2 border-ink-200" />
                {products.map((p, idx) => {
                  const min = Math.min(...products.map((x) => x.price));
                  const best = p.price === min;
                  return (
                    <td key={p.id} className="px-6 py-4 bg-ink-800/5 border-t-2 border-ink-200">
                      <button
                        className={cn(
                          "w-full font-bold py-2.5 rounded-lg transition-all",
                          best
                            ? "bg-grad-mint text-ink-900 hover:shadow-md"
                            : "bg-white border border-ink-200 text-ink-700 hover:border-mint-400"
                        )}
                      >
                        {best && <Sparkles size={14} className="inline mr-1.5" />}
                        选择此产品
                      </button>
                    </td>
                  );
                })}
              </tr>
            </tbody>
          </table>
        </div>

        <div className="flex items-center justify-end gap-3 p-5 border-t border-ink-100">
          <button className="btn-outline">
            <Trash2 size={16} /> 清空对比
          </button>
          <button onClick={onClose} className="btn-primary">
            完成对比
          </button>
        </div>
      </div>
    </div>
  );
}

function MiniStat({
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
    <div className={cn("p-3.5 rounded-xl2 border border-ink-100", accent ? "bg-gradient-to-br from-mint-50" : "bg-ink-50/60")}>
      <div className="flex items-center gap-1.5 text-ink-400 mb-1">
        <Icon size={12} />
        <span className="text-[10px] font-bold uppercase tracking-wider">{label}</span>
      </div>
      <div className={cn("text-sm font-bold truncate", accent ? "text-mint-600" : "text-ink-800")}>
        {value}
      </div>
    </div>
  );
}

function DetailSection({
  title,
  icon,
  children,
}: {
  title: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-3 text-ink-400">
        {icon}
        <span className="text-xs font-bold uppercase tracking-wider">{title}</span>
      </div>
      {children}
    </div>
  );
}

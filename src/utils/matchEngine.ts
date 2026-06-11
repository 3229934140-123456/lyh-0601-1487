import type { Demand, Product, DimensionScore } from "@/types";

const WEIGHTS = {
  industry: 0.3,
  region: 0.2,
  timeliness: 0.25,
  price: 0.25,
};

function scoreIndustry(demand: Demand, product: Product): number {
  if (demand.industry === product.industry) return 100;
  const relatedGroups: Record<string, string[]> = {
    金融银行: ["政务服务", "零售电商"],
    医疗健康: ["政务服务", "教育科研"],
    交通物流: ["零售电商", "能源电力"],
    零售电商: ["金融银行", "交通物流"],
    政务服务: ["金融银行", "医疗健康"],
    教育科研: ["医疗健康", "文化传媒"],
    能源电力: ["交通物流", "政务服务"],
    文化传媒: ["教育科研", "零售电商"],
  };
  if (relatedGroups[demand.industry]?.includes(product.industry)) return 65;
  return 30;
}

function scoreRegion(demand: Demand, product: Product): number {
  if (product.region === "全国范围") return 90;
  if (demand.region === product.region) return 100;
  const adjacent: Record<string, string[]> = {
    京津冀地区: ["东北地区", "中部地区"],
    长三角地区: ["中部地区", "粤港澳大湾区"],
    粤港澳大湾区: ["长三角地区", "成渝双城圈"],
    成渝双城圈: ["西部地区", "中部地区"],
    中部地区: ["京津冀地区", "长三角地区", "成渝双城圈"],
    东北地区: ["京津冀地区"],
    西部地区: ["成渝双城圈"],
    "全国范围": ["长三角地区", "粤港澳大湾区"],
  };
  if (adjacent[demand.region]?.includes(product.region)) return 70;
  return 40;
}

function scoreTimeliness(demand: Demand, product: Product): number {
  const order = [
    "一次性交付",
    "每季度更新",
    "每月更新",
    "每周更新",
    "每日更新",
    "实时/流式",
  ];
  const demandIdx = order.indexOf(demand.updateFrequency);
  const productIdx = order.indexOf(product.updateFrequency);
  if (demandIdx === -1 || productIdx === -1) return 50;
  const diff = Math.abs(demandIdx - productIdx);
  if (diff === 0) return 100;
  if (diff === 1) return 85;
  if (diff === 2) return 65;
  if (diff === 3) return 45;
  return 25;
}

function scorePrice(demand: Demand, product: Product): number {
  const budget = demand.budget;
  const price = product.price;
  if (price <= budget) {
    const ratio = price / budget;
    if (ratio >= 0.85) return 95;
    if (ratio >= 0.6) return 80;
    if (ratio >= 0.4) return 70;
    return 55;
  }
  const overRatio = (price - budget) / budget;
  if (overRatio <= 0.1) return 75;
  if (overRatio <= 0.3) return 50;
  if (overRatio <= 0.5) return 30;
  return 15;
}

export interface MatchEngineResult {
  matchScore: number;
  dimensionScores: DimensionScore[];
  timelinessNote?: string;
}

export function calculateMatch(demand: Demand, product: Product): MatchEngineResult {
  const industry = scoreIndustry(demand, product);
  const region = scoreRegion(demand, product);
  const timeliness = scoreTimeliness(demand, product);
  const price = scorePrice(demand, product);

  let timelinessNote: string | undefined;
  const order = ["一次性交付","每季度更新","每月更新","每周更新","每日更新","实时/流式"];
  const dIdx = order.indexOf(demand.updateFrequency);
  const pIdx = order.indexOf(product.updateFrequency);
  if (dIdx !== -1 && pIdx !== -1) {
    if (pIdx > dIdx) {
      timelinessNote = `产品时效（${product.updateFrequency}）高于需求（${demand.updateFrequency}），满足且有余量`;
    } else if (pIdx === dIdx) {
      timelinessNote = `产品时效（${product.updateFrequency}）与需求完全一致`;
    } else {
      timelinessNote = `产品时效（${product.updateFrequency}）低于需求（${demand.updateFrequency}），可能无法满足实时性要求`;
    }
  }

  const dimensionScores: DimensionScore[] = [
    { name: "industry", label: "行业匹配", score: industry, weight: WEIGHTS.industry },
    { name: "region", label: "地域覆盖", score: region, weight: WEIGHTS.region },
    { name: "timeliness", label: "时效满足", score: timeliness, weight: WEIGHTS.timeliness },
    { name: "price", label: "价格适配", score: price, weight: WEIGHTS.price },
  ];

  const matchScore = Math.round(
    industry * WEIGHTS.industry +
      region * WEIGHTS.region +
      timeliness * WEIGHTS.timeliness +
      price * WEIGHTS.price
  );

  return { matchScore, dimensionScores, timelinessNote };
}

export function generateMatchReport(demand: Demand, product: Product, result: MatchEngineResult) {
  const { matchScore, dimensionScores, timelinessNote } = result;
  let summary = "";
  const recommendations: string[] = [];

  if (matchScore >= 85) {
    summary = `综合匹配度 ${matchScore} 分，属于高度匹配。建议运营优先推送给供需双方，尽快进入意向确认环节。`;
    recommendations.push("安排供需双方对接会议，明确实施路径");
    recommendations.push("协助提供方准备产品试用与合规文件");
    recommendations.push("跟进预算确认与合同条款沟通");
  } else if (matchScore >= 70) {
    summary = `综合匹配度 ${matchScore} 分，属于较高匹配。存在一到两个维度的差异，建议运营介入撮合，寻找折中方案。`;
    recommendations.push("针对差异维度深入沟通，评估可调整空间");
    recommendations.push("推动双方先行试点合作，验证数据价值");
    recommendations.push("可考虑分阶段交付方案，降低一次性投入");
  } else if (matchScore >= 55) {
    summary = `综合匹配度 ${matchScore} 分，存在一定差异。需要运营深入了解双方诉求，判断是否存在撮合价值。`;
    recommendations.push("进一步访谈需求方，确认核心诉求是否可调整");
    recommendations.push("与提供方沟通定制化服务可能性");
    recommendations.push("推荐同类高匹配产品作为备选");
  } else {
    summary = `综合匹配度 ${matchScore} 分，匹配度较低。不建议重点投入，可作为信息参考。`;
    recommendations.push("告知需求方当前产品覆盖情况，后续补充");
    recommendations.push("引导提供方优化产品线覆盖范围");
  }

  const lowDims = dimensionScores.filter((d) => d.score < 60);
  if (lowDims.length > 0) {
    recommendations.push(
      `重点关注短板维度：${lowDims.map((d) => `${d.label}(${d.score}分)`).join("、")}`
    );
  }

  return {
    id: `rpt_${Date.now()}`,
    demandId: demand.id,
    productId: product.id,
    matchScore,
    dimensionScores,
    summary,
    recommendations,
    timelinessNote,
    generatedBy: "系统撮合引擎",
    createdAt: new Date().toISOString(),
  };
}

import type { TrendDataPoint } from "@/types";

export const TREND_DATA: TrendDataPoint[] = [
  { month: "2025-07", pending: 8, negotiating: 12, signing: 6, delivered: 10, total: 36, amount: 5200000 },
  { month: "2025-08", pending: 10, negotiating: 14, signing: 8, delivered: 11, total: 43, amount: 6350000 },
  { month: "2025-09", pending: 7, negotiating: 18, signing: 9, delivered: 13, total: 47, amount: 7120000 },
  { month: "2025-10", pending: 12, negotiating: 15, signing: 11, delivered: 14, total: 52, amount: 8450000 },
  { month: "2025-11", pending: 9, negotiating: 20, signing: 10, delivered: 16, total: 55, amount: 9280000 },
  { month: "2025-12", pending: 15, negotiating: 22, signing: 14, delivered: 18, total: 69, amount: 11250000 },
  { month: "2026-01", pending: 13, negotiating: 19, signing: 12, delivered: 9, total: 53, amount: 8760000 },
];

export const INDUSTRY_STATS = [
  { name: "金融银行", count: 28, amount: 9820000 },
  { name: "医疗健康", count: 19, amount: 5360000 },
  { name: "交通物流", count: 14, amount: 6280000 },
  { name: "零售电商", count: 22, amount: 4870000 },
  { name: "政务服务", count: 11, amount: 12450000 },
  { name: "教育科研", count: 16, amount: 2640000 },
  { name: "能源电力", count: 8, amount: 3920000 },
  { name: "文化传媒", count: 7, amount: 1680000 },
];

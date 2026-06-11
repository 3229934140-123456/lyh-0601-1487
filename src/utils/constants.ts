import type { UserRole, DemandStatus, MessageType, ReportConfirmStatus } from "@/types";

export const INDUSTRIES = [
  "金融银行",
  "医疗健康",
  "交通物流",
  "零售电商",
  "政务服务",
  "教育科研",
  "能源电力",
  "文化传媒",
];

export const REGIONS = [
  "京津冀地区",
  "长三角地区",
  "粤港澳大湾区",
  "成渝双城圈",
  "中部地区",
  "东北地区",
  "西部地区",
  "全国范围",
];

export const UPDATE_FREQUENCIES = [
  "一次性交付",
  "每日更新",
  "每周更新",
  "每月更新",
  "每季度更新",
  "实时/流式",
];

export const DELIVERY_FORMS = [
  "API 接口调用",
  "离线数据包（CSV/Parquet）",
  "数据库访问授权",
  "SaaS 平台账号",
  "私有化部署",
  "定制化加工",
];

export const USER_ROLES: { value: UserRole; label: string; icon: string }[] = [
  { value: "demand", label: "需求方", icon: "building-2" },
  { value: "provider", label: "提供方", icon: "warehouse" },
  { value: "operator", label: "平台运营", icon: "shield-check" },
];

export const DEMAND_STATUS_META: Record<
  DemandStatus,
  { label: string; color: string; bg: string; ring: string }
> = {
  pending: { label: "待确认", color: "text-amber-600", bg: "bg-amber-50", ring: "ring-amber-200" },
  negotiating: { label: "洽谈中", color: "text-blue-600", bg: "bg-blue-50", ring: "ring-blue-200" },
  signing: { label: "待签约", color: "text-purple-600", bg: "bg-purple-50", ring: "ring-purple-200" },
  delivered: { label: "已交付", color: "text-emerald-600", bg: "bg-emerald-50", ring: "ring-emerald-200" },
  closed: { label: "已关闭", color: "text-slate-600", bg: "bg-slate-100", ring: "ring-slate-200" },
};

export const DEMAND_STATUS_FLOW: DemandStatus[] = [
  "pending",
  "negotiating",
  "signing",
  "delivered",
];

export const MESSAGE_TYPE_META: Record<
  MessageType,
  { label: string; icon: string; color: string }
> = {
  text: { label: "消息", icon: "message-circle", color: "text-ink-600" },
  intention: { label: "意向", icon: "handshake", color: "text-mint-600" },
  question: { label: "问题", icon: "help-circle", color: "text-amber-600" },
  material: { label: "材料", icon: "file-text", color: "text-blue-600" },
  minutes: { label: "会议纪要", icon: "calendar-check", color: "text-purple-600" },
  task: { label: "协作任务", icon: "list-checks", color: "text-emerald-600" },
};

export const REPORT_CONFIRM_META: Record<ReportConfirmStatus, { label: string; color: string; bg: string }> = {
  draft: { label: "草稿", color: "text-slate-600", bg: "bg-slate-100" },
  pending_confirm: { label: "待确认", color: "text-amber-600", bg: "bg-amber-50" },
  confirmed: { label: "已确认", color: "text-emerald-600", bg: "bg-emerald-50" },
  rejected: { label: "已退回", color: "text-red-600", bg: "bg-red-50" },
};

export const TASK_ASSIGNEE_META: Record<string, { label: string; color: string }> = {
  demand: { label: "需求方", color: "text-blue-600" },
  provider: { label: "提供方", color: "text-orange-600" },
  both: { label: "双方", color: "text-purple-600" },
};

export const PRICE_RANGES = [
  { label: "全部", min: 0, max: Infinity },
  { label: "5万以下", min: 0, max: 50000 },
  { label: "5-20万", min: 50000, max: 200000 },
  { label: "20-50万", min: 200000, max: 500000 },
  { label: "50-100万", min: 500000, max: 1000000 },
  { label: "100万以上", min: 1000000, max: Infinity },
];

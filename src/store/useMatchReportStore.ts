import { create } from "zustand";
import type { MatchReport, DimensionScore, ReportConfirmStatus } from "@/types";
import { loadJson, saveJson } from "@/utils/storage";
import { uid } from "@/utils/formatters";

interface MatchReportState {
  reports: MatchReport[];
  addReport: (params: {
    demandId: string;
    productId: string;
    matchScore: number;
    dimensionScores: DimensionScore[];
    summary: string;
    recommendations: string[];
    timelinessNote?: string;
  }) => MatchReport;
  getById: (id: string) => MatchReport | undefined;
  findByDemand: (demandId: string) => MatchReport[];
  findByProduct: (productId: string) => MatchReport[];
  findByDemandAndProduct: (demandId: string, productId: string) => MatchReport[];
  pushForConfirm: (id: string) => void;
  confirmReport: (id: string, role: "demand" | "provider") => void;
  rejectReport: (id: string, role: "demand" | "provider", reason?: string) => void;
}

function resolveConfirmStatus(report: MatchReport): ReportConfirmStatus {
  if (report.demandConfirm === "rejected" || report.providerConfirm === "rejected") return "rejected";
  if (report.demandConfirm === "confirmed" && report.providerConfirm === "confirmed") return "confirmed";
  if (report.demandConfirm || report.providerConfirm) return "pending_confirm";
  return report.confirmStatus;
}

export const useMatchReportStore = create<MatchReportState>((set, get) => ({
  reports: loadJson("matchReports", [] as MatchReport[]),

  addReport: (params) => {
    const report: MatchReport = {
      id: uid("rpt"),
      ...params,
      generatedBy: "平台运营",
      createdAt: new Date().toISOString(),
      confirmStatus: "draft",
    };
    set((state) => ({ reports: [report, ...state.reports] }));
    return report;
  },

  getById: (id) => get().reports.find((r) => r.id === id),

  findByDemand: (demandId) =>
    get().reports.filter((r) => r.demandId === demandId),

  findByProduct: (productId) =>
    get().reports.filter((r) => r.productId === productId),

  findByDemandAndProduct: (demandId, productId) =>
    get().reports.filter(
      (r) => r.demandId === demandId && r.productId === productId
    ),

  pushForConfirm: (id) =>
    set((state) => ({
      reports: state.reports.map((r) =>
        r.id === id ? { ...r, confirmStatus: "pending_confirm" as ReportConfirmStatus } : r
      ),
    })),

  confirmReport: (id, role) =>
    set((state) => ({
      reports: state.reports.map((r) => {
        if (r.id !== id) return r;
        const updated = {
          ...r,
          ...(role === "demand" ? { demandConfirm: "confirmed" as const } : { providerConfirm: "confirmed" as const }),
        };
        const newStatus = resolveConfirmStatus(updated);
        return {
          ...updated,
          confirmStatus: newStatus,
          confirmedAt: newStatus === "confirmed" ? new Date().toISOString() : updated.confirmedAt,
        };
      }),
    })),

  rejectReport: (id, role, reason) =>
    set((state) => ({
      reports: state.reports.map((r) => {
        if (r.id !== id) return r;
        return {
          ...r,
          confirmStatus: "rejected" as ReportConfirmStatus,
          ...(role === "demand" ? { demandConfirm: "rejected" as const } : { providerConfirm: "rejected" as const }),
          rejectedAt: new Date().toISOString(),
          rejectReason: reason,
        };
      }),
    })),
}));

useMatchReportStore.subscribe((s) => saveJson("matchReports", s.reports));

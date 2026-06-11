import { create } from "zustand";
import type { MatchReport, DimensionScore } from "@/types";
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
}

export const useMatchReportStore = create<MatchReportState>((set, get) => ({
  reports: loadJson("matchReports", [] as MatchReport[]),

  addReport: (params) => {
    const report: MatchReport = {
      id: uid("rpt"),
      ...params,
      generatedBy: "平台运营",
      createdAt: new Date().toISOString(),
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
}));

useMatchReportStore.subscribe((s) => saveJson("matchReports", s.reports));

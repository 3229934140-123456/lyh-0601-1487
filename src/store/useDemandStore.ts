import { create } from "zustand";
import type { Demand, DemandStatus } from "@/types";
import { DEMANDS } from "@/data/demands";
import { loadJson, saveJson } from "@/utils/storage";

interface DemandState {
  demands: Demand[];
  getById: (id: string) => Demand | undefined;
  addDemand: (demand: Omit<Demand, "id" | "createdAt" | "favorite" | "status">) => void;
  updateStatus: (id: string, status: DemandStatus) => void;
  toggleFavorite: (id: string) => void;
  closeDemand: (id: string) => void;
  filterByStatus: (status?: DemandStatus) => Demand[];
  getStats: () => Record<DemandStatus, number>;
}

export const useDemandStore = create<DemandState>((set, get) => ({
  demands: loadJson("demands", DEMANDS),

  getById: (id) => get().demands.find((d) => d.id === id),

  addDemand: (payload) =>
    set((state) => ({
      demands: [
        {
          ...payload,
          id: `d_${Date.now().toString(36)}`,
          createdAt: new Date().toISOString(),
          favorite: false,
          status: "pending",
        },
        ...state.demands,
      ],
    })),

  updateStatus: (id, status) =>
    set((state) => ({
      demands: state.demands.map((d) => (d.id === id ? { ...d, status } : d)),
    })),

  toggleFavorite: (id) =>
    set((state) => ({
      demands: state.demands.map((d) =>
        d.id === id ? { ...d, favorite: !d.favorite } : d
      ),
    })),

  closeDemand: (id) =>
    set((state) => ({
      demands: state.demands.map((d) =>
        d.id === id ? { ...d, status: "closed" } : d
      ),
    })),

  filterByStatus: (status) => {
    const list = get().demands;
    return status ? list.filter((d) => d.status === status) : list;
  },

  getStats: () => {
    const list = get().demands;
    return list.reduce(
      (acc, d) => {
        acc[d.status] = (acc[d.status] || 0) + 1;
        return acc;
      },
      { pending: 0, negotiating: 0, signing: 0, delivered: 0, closed: 0 } as Record<DemandStatus, number>
    );
  },
}));

useDemandStore.subscribe((s) => saveJson("demands", s.demands));

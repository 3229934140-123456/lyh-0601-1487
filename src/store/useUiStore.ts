import { create } from "zustand";
import type { UserRole } from "@/types";

interface UiState {
  role: UserRole;
  sidebarCollapsed: boolean;
  modalStack: { id: string; data?: unknown }[];
  toast: { id: string; type: "success" | "error" | "info"; text: string } | null;
  setRole: (role: UserRole) => void;
  toggleSidebar: () => void;
  openModal: (id: string, data?: unknown) => void;
  closeModal: (id?: string) => void;
  showToast: (type: "success" | "error" | "info", text: string) => void;
  hideToast: () => void;
}

export const useUiStore = create<UiState>((set, get) => ({
  role: "operator",
  sidebarCollapsed: false,
  modalStack: [],
  toast: null,

  setRole: (role) => set({ role }),

  toggleSidebar: () => set({ sidebarCollapsed: !get().sidebarCollapsed }),

  openModal: (id, data) =>
    set((s) => ({ modalStack: [...s.modalStack, { id, data }] })),

  closeModal: (id) =>
    set((s) => ({
      modalStack: id
        ? s.modalStack.filter((m) => m.id !== id)
        : s.modalStack.slice(0, -1),
    })),

  showToast: (type, text) => {
    const id = `t_${Date.now()}`;
    set({ toast: { id, type, text } });
    setTimeout(() => {
      if (get().toast?.id === id) set({ toast: null });
    }, 3000);
  },

  hideToast: () => set({ toast: null }),
}));

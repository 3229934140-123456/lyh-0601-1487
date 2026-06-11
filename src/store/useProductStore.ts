import { create } from "zustand";
import type { Product } from "@/types";
import { PRODUCTS } from "@/data/products";

interface ProductState {
  products: Product[];
  compareIds: string[];
  getById: (id: string) => Product | undefined;
  toggleFavorite: (id: string) => void;
  toggleCompare: (id: string) => void;
  clearCompare: () => void;
  filter: (opts: {
    industry?: string;
    region?: string;
    delivery?: string;
    minPrice?: number;
    maxPrice?: number;
    keyword?: string;
  }) => Product[];
}

export const useProductStore = create<ProductState>((set, get) => ({
  products: PRODUCTS,
  compareIds: [],

  getById: (id) => get().products.find((p) => p.id === id),

  toggleFavorite: (id) =>
    set((state) => ({
      products: state.products.map((p) =>
        p.id === id ? { ...p, favorite: !p.favorite } : p
      ),
    })),

  toggleCompare: (id) =>
    set((state) => ({
      compareIds: state.compareIds.includes(id)
        ? state.compareIds.filter((x) => x !== id)
        : state.compareIds.length < 3
        ? [...state.compareIds, id]
        : state.compareIds,
    })),

  clearCompare: () => set({ compareIds: [] }),

  filter: ({ industry, region, delivery, minPrice, maxPrice, keyword }) => {
    let list = get().products;
    if (industry) list = list.filter((p) => p.industry === industry);
    if (region) list = list.filter((p) => p.region === region);
    if (delivery) list = list.filter((p) => p.deliveryForm.includes(delivery));
    if (typeof minPrice === "number") list = list.filter((p) => p.price >= minPrice);
    if (typeof maxPrice === "number") list = list.filter((p) => p.price <= maxPrice);
    if (keyword) {
      const kw = keyword.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(kw) ||
          p.description.toLowerCase().includes(kw) ||
          p.providerCompany.toLowerCase().includes(kw)
      );
    }
    return list;
  },
}));

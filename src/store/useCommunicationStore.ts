import { create } from "zustand";
import type { Communication, Message, MessageAttachment } from "@/types";
import { COMMUNICATIONS, MESSAGES } from "@/data/communications";
import { uid } from "@/utils/formatters";
import { loadJson, saveJson } from "@/utils/storage";

interface CommunicationState {
  communications: Communication[];
  messages: Message[];
  activeId: string | null;
  setActive: (id: string | null) => void;
  markAsRead: (id: string) => void;
  sendMessage: (params: {
    communicationId: string;
    sender: string;
    senderRole: Message["senderRole"];
    type?: Message["type"];
    content: string;
    attachments?: MessageAttachment[];
  }) => void;
  createCommunication: (params: {
    demandId: string;
    productId: string;
    demandTitle: string;
    productName: string;
    partyA: string;
    partyB: string;
  }) => Communication;
  findOrCreateByDemand: (demandId: string, demandTitle: string, productId?: string, productName?: string, partyB?: string) => Communication;
  findByDemandAndProduct: (demandId: string, productId: string) => Communication | undefined;
}

export const useCommunicationStore = create<CommunicationState>((set, get) => ({
  communications: loadJson("communications", COMMUNICATIONS),
  messages: loadJson("messages", MESSAGES),
  activeId: loadJson("communications", COMMUNICATIONS)[0]?.id ?? null,

  setActive: (id) => set({ activeId: id }),

  markAsRead: (id) =>
    set((state) => ({
      communications: state.communications.map((c) =>
        c.id === id ? { ...c, unreadCount: 0 } : c
      ),
    })),

  sendMessage: ({ communicationId, sender, senderRole, type = "text", content, attachments }) => {
    const now = new Date().toISOString();
    const msg: Message = {
      id: uid("msg"),
      communicationId,
      sender,
      senderRole,
      type,
      content,
      attachments,
      timestamp: now,
    };
    set((state) => ({
      messages: [...state.messages, msg],
      communications: state.communications.map((c) =>
        c.id === communicationId
          ? { ...c, lastMessage: content.slice(0, 60), lastMessageAt: now }
          : c
      ),
    }));
  },

  createCommunication: (params) => {
    const newItem: Communication = {
      id: uid("c"),
      ...params,
      lastMessage: "双方已建立沟通通道",
      lastMessageAt: new Date().toISOString(),
      unreadCount: 0,
      status: "pending",
    };
    set((state) => ({
      communications: [newItem, ...state.communications],
      activeId: newItem.id,
    }));
    return newItem;
  },

  findByDemandAndProduct: (demandId, productId) => {
    return get().communications.find(
      (c) => c.demandId === demandId && c.productId === productId
    );
  },

  findOrCreateByDemand: (demandId, demandTitle, productId, productName, partyB) => {
    const existing = get().communications.find((c) => c.demandId === demandId);
    if (existing) {
      set({ activeId: existing.id });
      return existing;
    }
    return get().createCommunication({
      demandId,
      productId: productId ?? "",
      demandTitle,
      productName: productName ?? "",
      partyA: "当前用户",
      partyB: partyB ?? "待确认",
    });
  },
}));

useCommunicationStore.subscribe((s) => saveJson("communications", s.communications));
useCommunicationStore.subscribe((s) => saveJson("messages", s.messages));

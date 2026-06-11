import { create } from "zustand";
import type { Communication, Message, MessageAttachment, DemandStatus } from "@/types";
import { COMMUNICATIONS, MESSAGES } from "@/data/communications";
import { uid } from "@/utils/formatters";
import { loadJson, saveJson } from "@/utils/storage";
import { useDemandStore } from "./useDemandStore";

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
    initialMessage?: string;
    initialMessageRole?: Message["senderRole"];
  }) => Communication;
  findOrCreateByDemandAndProduct: (
    demandId: string,
    productId: string,
    demandTitle: string,
    productName: string,
    partyB?: string,
    initialNote?: string
  ) => Communication;
  findByDemandAndProduct: (demandId: string, productId: string) => Communication | undefined;
  findByDemand: (demandId: string) => Communication[];
  findByProduct: (productId: string) => Communication[];
  updateStatus: (id: string, status: DemandStatus) => void;
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
    const { initialMessage, initialMessageRole, ...rest } = params;
    const now = new Date().toISOString();
    const newItem: Communication = {
      id: uid("c"),
      ...rest,
      lastMessage: initialMessage ? initialMessage.slice(0, 60) : "双方已建立沟通通道",
      lastMessageAt: now,
      unreadCount: 0,
      status: "pending",
    };
    const messages: Message[] = [];
    if (initialMessage) {
      messages.push({
        id: uid("msg"),
        communicationId: newItem.id,
        sender: "当前用户",
        senderRole: initialMessageRole ?? "demand",
        type: "intention",
        content: initialMessage,
        timestamp: now,
      });
    }
    set((state) => ({
      communications: [newItem, ...state.communications],
      messages: messages.length ? [...state.messages, ...messages] : state.messages,
      activeId: newItem.id,
    }));
    return newItem;
  },

  findByDemandAndProduct: (demandId, productId) => {
    return get().communications.find(
      (c) => c.demandId === demandId && c.productId === productId
    );
  },

  findByDemand: (demandId) => {
    return get().communications.filter((c) => c.demandId === demandId);
  },

  findByProduct: (productId) => {
    return get().communications.filter((c) => c.productId === productId);
  },

  findOrCreateByDemandAndProduct: (
    demandId,
    productId,
    demandTitle,
    productName,
    partyB,
    initialNote
  ) => {
    const existing = get().findByDemandAndProduct(demandId, productId);
    if (existing) {
      set({ activeId: existing.id });
      return existing;
    }
    const initialMessage = initialNote
      ? `【采购意向】对产品[${productName}]表达采购意向，关联需求：${demandTitle}。备注：${initialNote}`
      : `【采购意向】对产品[${productName}]表达采购意向，关联需求：${demandTitle}`;
    return get().createCommunication({
      demandId,
      productId,
      demandTitle,
      productName,
      partyA: "当前用户",
      partyB: partyB ?? "待确认",
      initialMessage,
      initialMessageRole: "demand",
    });
  },

  updateStatus: (id, status) => {
    set((state) => ({
      communications: state.communications.map((c) =>
        c.id === id ? { ...c, status } : c
      ),
    }));
    const comm = get().communications.find((c) => c.id === id);
    if (comm) {
      const demandStore = useDemandStore.getState();
      if (demandStore.updateStatus) {
        demandStore.updateStatus(comm.demandId, status);
      }
    }
  },
}));

useCommunicationStore.subscribe((s) => saveJson("communications", s.communications));
useCommunicationStore.subscribe((s) => saveJson("messages", s.messages));

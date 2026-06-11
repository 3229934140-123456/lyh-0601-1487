import { create } from "zustand";
import type { Communication, Message, MessageAttachment } from "@/types";
import { COMMUNICATIONS, MESSAGES } from "@/data/communications";
import { uid } from "@/utils/formatters";

interface CommunicationState {
  communications: Communication[];
  messages: Message[];
  activeId: string | null;
  setActive: (id: string | null) => void;
  getActive: () => Communication | undefined;
  getActiveMessages: () => Message[];
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
}

export const useCommunicationStore = create<CommunicationState>((set, get) => ({
  communications: COMMUNICATIONS,
  messages: MESSAGES,
  activeId: COMMUNICATIONS[0]?.id ?? null,

  setActive: (id) => set({ activeId: id }),

  getActive: () =>
    get().communications.find((c) => c.id === get().activeId),

  getActiveMessages: () => {
    const id = get().activeId;
    return id
      ? get()
          .messages.filter((m) => m.communicationId === id)
          .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime())
      : [];
  },

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
}));

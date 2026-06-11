import { create } from "zustand";
import type { CollabTask, TaskAssignee } from "@/types";
import { uid } from "@/utils/formatters";
import { loadJson, saveJson } from "@/utils/storage";

interface CollabTaskState {
  tasks: CollabTask[];
  addTask: (params: {
    communicationId: string;
    title: string;
    assignee: TaskAssignee;
    createdBy: string;
  }) => CollabTask;
  completeTask: (id: string) => void;
  reopenTask: (id: string) => void;
  getByCommunication: (communicationId: string) => CollabTask[];
  getPendingCount: (communicationId: string) => number;
}

export const useCollabTaskStore = create<CollabTaskState>((set, get) => ({
  tasks: loadJson("collabTasks", [] as CollabTask[]),

  addTask: (params) => {
    const task: CollabTask = {
      id: uid("task"),
      ...params,
      status: "pending",
      createdAt: new Date().toISOString(),
    };
    set((state) => ({ tasks: [task, ...state.tasks] }));
    return task;
  },

  completeTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: "done" as const, completedAt: new Date().toISOString() } : t
      ),
    })),

  reopenTask: (id) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === id ? { ...t, status: "pending" as const, completedAt: undefined } : t
      ),
    })),

  getByCommunication: (communicationId) =>
    get().tasks.filter((t) => t.communicationId === communicationId),

  getPendingCount: (communicationId) =>
    get().tasks.filter((t) => t.communicationId === communicationId && t.status === "pending").length,
}));

useCollabTaskStore.subscribe((s) => saveJson("collabTasks", s.tasks));

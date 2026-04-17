/**
 * Chat Store
 * Zustand store for chat state management
 */

import { create } from "zustand";
import type { ChatItem, ToolCallBlock, ChartConfig, TodoItem } from "../types";

interface ChatState {
  sessionId: string | null;
  items: ChatItem[];
  todos: TodoItem[];
  isLoading: boolean;
  error: string | null;
  isSidebarCollapsed: boolean;

  // Actions
  setSessionId: (id: string | null) => void;
  addUserMessage: (id: string, content: string) => void;
  startAssistantMessage: (id: string) => void;
  appendThinking: (messageId: string, content: string) => void;
  appendText: (messageId: string, content: string) => void;
  addToolCall: (messageId: string, toolCall: ToolCallBlock) => void;
  updateToolCall: (
    messageId: string,
    toolId: string,
    updates: Partial<ToolCallBlock>,
  ) => void;
  addChart: (messageId: string, chart: ChartConfig) => void;
  setTodos: (todos: TodoItem[]) => void;
  clearTodos: () => void;
  toggleToolCollapse: (messageId: string, toolId: string) => void;
  setMessageStreaming: (messageId: string, isStreaming: boolean) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  clearItems: () => void;
  toggleSidebar: () => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
  reset: () => void;
}

const SIDEBAR_STORAGE_KEY = "ecommerce-agent:sidebar-collapsed";

const getInitialSidebarCollapsed = () => {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(SIDEBAR_STORAGE_KEY) === "true";
  } catch {
    return false;
  }
};

const persistSidebarCollapsed = (collapsed: boolean) => {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SIDEBAR_STORAGE_KEY, String(collapsed));
  } catch {
    // Ignore storage errors (private mode, etc.)
  }
};

export const useChatStore = create<ChatState>((set) => ({
  sessionId: null,
  items: [],
  todos: [],
  isLoading: false,
  error: null,
  isSidebarCollapsed: getInitialSidebarCollapsed(),

  setSessionId: (id) => set({ sessionId: id }),

  addUserMessage: (id, content) =>
    set((state) => ({
      items: [
        ...state.items,
        {
          id,
          type: "user_message" as const,
          content,
        },
      ],
    })),

  startAssistantMessage: (id) =>
    set((state) => ({
      items: [
        ...state.items,
        {
          id,
          type: "assistant_message" as const,
          thinking: "",
          toolCalls: [],
          content: "",
          charts: [],
          isStreaming: true,
        },
      ],
    })),

  appendThinking: (messageId, content) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.type === "assistant_message" && item.id === messageId) {
          return {
            ...item,
            thinking: (item.thinking || "") + content,
          };
        }
        return item;
      }),
    })),

  appendText: (messageId, content) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.type === "assistant_message" && item.id === messageId) {
          return {
            ...item,
            content: item.content + content,
          };
        }
        return item;
      }),
    })),

  addToolCall: (messageId, toolCall) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.type === "assistant_message" && item.id === messageId) {
          return {
            ...item,
            toolCalls: [...item.toolCalls, toolCall],
          };
        }
        return item;
      }),
    })),

  updateToolCall: (messageId, toolId, updates) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.type === "assistant_message" && item.id === messageId) {
          return {
            ...item,
            toolCalls: item.toolCalls.map((tc) =>
              tc.id === toolId ? { ...tc, ...updates } : tc,
            ),
          };
        }
        return item;
      }),
    })),

  addChart: (messageId, chart) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.type === "assistant_message" && item.id === messageId) {
          return {
            ...item,
            charts: [...item.charts, chart],
          };
        }
        return item;
      }),
    })),

  setTodos: (todos) => set({ todos }),

  clearTodos: () => set({ todos: [] }),

  toggleToolCollapse: (messageId, toolId) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.type === "assistant_message" && item.id === messageId) {
          return {
            ...item,
            toolCalls: item.toolCalls.map((tc) =>
              tc.id === toolId ? { ...tc, isCollapsed: !tc.isCollapsed } : tc,
            ),
          };
        }
        return item;
      }),
    })),

  setMessageStreaming: (messageId, isStreaming) =>
    set((state) => ({
      items: state.items.map((item) => {
        if (item.type === "assistant_message" && item.id === messageId) {
          return { ...item, isStreaming };
        }
        return item;
      }),
    })),

  setLoading: (loading) => set({ isLoading: loading }),

  setError: (error) => set({ error }),

  clearItems: () => set({ items: [], error: null }),

  toggleSidebar: () =>
    set((state) => {
      const next = !state.isSidebarCollapsed;
      persistSidebarCollapsed(next);
      return { isSidebarCollapsed: next };
    }),

  setSidebarCollapsed: (collapsed) => {
    persistSidebarCollapsed(collapsed);
    set({ isSidebarCollapsed: collapsed });
  },

  reset: () =>
    set((state) => ({
      sessionId: null,
      items: [],
      todos: [],
      isLoading: false,
      error: null,
      isSidebarCollapsed: state.isSidebarCollapsed,
    })),
}));

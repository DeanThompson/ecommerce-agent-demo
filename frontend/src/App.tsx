import { useCallback, useEffect, useRef, useState } from "react";
import { ConfigProvider, theme } from "antd";
import zhCN from "antd/locale/zh_CN";
import { Header } from "./components/Layout/Header";
import { Sidebar } from "./components/Layout/Sidebar";
import { MainContent } from "./components/Layout/MainContent";
import { ChatPanel } from "./components/Chat/ChatPanel";
import { useChat } from "./hooks/useChat";
import { useSession } from "./hooks/useSession";
import { useChatStore } from "./stores/chatStore";
import {
  getSessionIdFromPath,
  updateSessionPath,
  type HistoryMode,
} from "./utils/sessionRoute";
import type { ToolCallBlock } from "./types";

interface SelectSessionOptions {
  updateUrl?: boolean;
  historyMode?: HistoryMode;
}

function App() {
  const { newChat, sessionId } = useChat();
  const { sessions, isLoading, fetchSessions, fetchSession, deleteSession } =
    useSession();
  const {
    setSessionId,
    clearItems,
    addUserMessage,
    startAssistantMessage,
    addToolCall,
    addChart,
    appendText,
    setMessageStreaming,
  } = useChatStore();

  const [isRouteReady, setIsRouteReady] = useState(false);
  const isRouteHydratingRef = useRef(false);

  const resetToHome = useCallback(
    (mode: HistoryMode = "replace") => {
      newChat();
      updateSessionPath(null, mode);
    },
    [newChat],
  );

  const handleSelectSession = useCallback(
    async (
      selectedSessionId: string,
      options: SelectSessionOptions = {},
    ): Promise<boolean> => {
      const session = await fetchSession(selectedSessionId);
      if (!session) {
        if (options.updateUrl !== false) {
          updateSessionPath(null, options.historyMode ?? "replace");
        }
        return false;
      }

      clearItems();
      setSessionId(session.id);

      session.messages.forEach((msg) => {
        if (msg.role === "user") {
          addUserMessage(msg.id, msg.content);
          return;
        }

        startAssistantMessage(msg.id);

        if (msg.toolCalls && msg.toolCalls.length > 0) {
          msg.toolCalls.forEach((toolCall, index) => {
            const toolCallBlock: ToolCallBlock = {
              id: `${msg.id}-tool-${index}`,
              tool: toolCall.tool,
              args: toolCall.args || {},
              result: toolCall.result,
              duration: toolCall.duration,
              status:
                toolCall.status ||
                (toolCall.result ? "completed" : "running"),
              isCollapsed: true,
            };
            addToolCall(msg.id, toolCallBlock);
          });
        }

        if (msg.charts && msg.charts.length > 0) {
          msg.charts.forEach((chart) => {
            addChart(msg.id, chart);
          });
        }

        if (msg.content) {
          appendText(msg.id, msg.content);
        }

        setMessageStreaming(msg.id, false);
      });

      if (options.updateUrl !== false) {
        updateSessionPath(session.id, options.historyMode ?? "push");
      }

      return true;
    },
    [
      fetchSession,
      clearItems,
      setSessionId,
      addUserMessage,
      startAssistantMessage,
      addToolCall,
      addChart,
      appendText,
      setMessageStreaming,
    ],
  );

  const handleDeleteSession = useCallback(
    async (sessionIdToDelete: string) => {
      const success = await deleteSession(sessionIdToDelete);
      if (success && sessionIdToDelete === sessionId) {
        resetToHome("replace");
      }
    },
    [deleteSession, sessionId, resetToHome],
  );

  const handleNewChat = useCallback(() => {
    resetToHome("push");
    fetchSessions();
  }, [resetToHome, fetchSessions]);

  useEffect(() => {
    if (sessionId) {
      fetchSessions();
    }
  }, [sessionId, fetchSessions]);

  useEffect(() => {
    let cancelled = false;

    const hydrateFromRoute = async () => {
      const sessionIdFromPath = getSessionIdFromPath();
      if (sessionIdFromPath) {
        isRouteHydratingRef.current = true;
        const loaded = await handleSelectSession(sessionIdFromPath, {
          updateUrl: false,
        });
        isRouteHydratingRef.current = false;

        if (!loaded) {
          resetToHome("replace");
        }
      }

      if (!cancelled) {
        setIsRouteReady(true);
      }
    };

    void hydrateFromRoute();

    return () => {
      cancelled = true;
    };
  }, [handleSelectSession, resetToHome]);

  useEffect(() => {
    if (!isRouteReady || isRouteHydratingRef.current) {
      return;
    }

    updateSessionPath(sessionId, "replace");
  }, [isRouteReady, sessionId]);

  useEffect(() => {
    if (!isRouteReady) {
      return;
    }

    const onPopState = () => {
      const sessionIdFromPath = getSessionIdFromPath();
      if (sessionIdFromPath) {
        void handleSelectSession(sessionIdFromPath, { updateUrl: false });
        return;
      }

      newChat();
    };

    window.addEventListener("popstate", onPopState);
    return () => {
      window.removeEventListener("popstate", onPopState);
    };
  }, [isRouteReady, handleSelectSession, newChat]);

  return (
    <ConfigProvider
      locale={zhCN}
      theme={{
        algorithm: theme.defaultAlgorithm,
        token: {
          colorPrimary: "#d97757",
          colorBgLayout: "#f9fafb",
          colorBgContainer: "#ffffff",
          colorBorder: "#e5e7eb",
          borderRadius: 12,
          fontFamily: '"Manrope", "Segoe UI", sans-serif',
          colorText: "#1f2937",
          colorTextSecondary: "#6b7280",
          colorTextTertiary: "#9ca3af",
        },
      }}
    >
      <div
        style={{
          height: "100vh",
          display: "flex",
          overflow: "hidden",
          background: "var(--bg-primary)",
        }}
      >
        <Sidebar
          sessions={sessions}
          activeSessionId={sessionId}
          isLoading={isLoading}
          onNewChat={handleNewChat}
          onSelectSession={handleSelectSession}
          onDeleteSession={handleDeleteSession}
        />
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            minWidth: 0,
          }}
        >
          <Header onNewChat={handleNewChat} />
          <MainContent>
            <ChatPanel />
          </MainContent>
        </div>
      </div>
    </ConfigProvider>
  );
}

export default App;

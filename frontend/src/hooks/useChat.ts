/**
 * Chat Hook
 * High-level chat logic combining store and SSE
 */

import { useCallback, useRef } from "react";
import { v4 as uuidv4 } from "uuid";
import { useChatStore } from "../stores/chatStore";
import { useSSE } from "./useSSE";
import type { ToolCallBlock } from "../types";

export function useChat() {
  const {
    sessionId,
    items,
    todos,
    isLoading,
    error,
    setSessionId,
    addUserMessage,
    startAssistantMessage,
    appendThinking,
    appendText,
    addToolCall,
    updateToolCall,
    addChart,
    setTodos,
    setMessageStreaming,
    setLoading,
    setError,
    clearItems,
    reset,
  } = useChatStore();

  const { sendMessage: sendSSE, abort } = useSSE();
  const activeAssistantId = useRef<string | null>(null);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!content.trim() || isLoading) return;

      setError(null);
      setLoading(true);
      activeAssistantId.current = null;

      // Add user message
      const userMessageId = uuidv4();
      addUserMessage(userMessageId, content.trim());

      // Start assistant message
      const assistantId = uuidv4();
      startAssistantMessage(assistantId);
      activeAssistantId.current = assistantId;

      try {
        await sendSSE(content.trim(), sessionId, {
          onTurnStart: (data) => {
            // Persist session immediately so retries stay in the same conversation.
            if (data.sessionId) {
              setSessionId(data.sessionId);
            }
          },

          onThinking: (data) => {
            if (activeAssistantId.current) {
              appendThinking(activeAssistantId.current, data.content);
            }
          },

          onTextDelta: (data) => {
            if (activeAssistantId.current) {
              appendText(activeAssistantId.current, data.content);
            }
          },

          onToolStart: (data) => {
            if (activeAssistantId.current) {
              const toolCall: ToolCallBlock = {
                id: data.id,
                tool: data.tool,
                args: data.args || {},
                status: "running",
                isCollapsed: true, // Default collapsed
              };
              addToolCall(activeAssistantId.current, toolCall);
            }
          },

          onToolInput: (_data) => {
            // Tool input streaming - could update args incrementally if needed
            // For now, we wait for the full result
          },

          onToolResult: (data) => {
            if (activeAssistantId.current) {
              updateToolCall(activeAssistantId.current, data.id, {
                args: data.args,
                result: data.result,
                duration: data.duration,
                status: "completed",
              });
            }
          },

          onChart: (chart) => {
            if (activeAssistantId.current) {
              addChart(activeAssistantId.current, chart);
            }
          },

          onTodos: (todosData) => {
            setTodos(todosData);
          },

          onTurnEnd: () => {
            // Turn ended
          },

          onDone: (data) => {
            if (data.sessionId) {
              setSessionId(data.sessionId);
            }
            if (activeAssistantId.current) {
              setMessageStreaming(activeAssistantId.current, false);
            }
            setLoading(false);
            activeAssistantId.current = null;
          },

          onError: (data) => {
            setError(data.message);
            if (activeAssistantId.current) {
              setMessageStreaming(activeAssistantId.current, false);
            }
            setLoading(false);
            activeAssistantId.current = null;
          },
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "发送失败，请重试");
        if (activeAssistantId.current) {
          setMessageStreaming(activeAssistantId.current, false);
        }
        setLoading(false);
        activeAssistantId.current = null;
      }
    },
    [
      sessionId,
      isLoading,
      sendSSE,
      setSessionId,
      addUserMessage,
      startAssistantMessage,
      appendThinking,
      appendText,
      addToolCall,
      updateToolCall,
      addChart,
      setTodos,
      setMessageStreaming,
      setLoading,
      setError,
    ],
  );

  const newChat = useCallback(() => {
    abort();
    reset();
  }, [abort, reset]);

  return {
    sessionId,
    items,
    todos,
    isLoading,
    error,
    sendMessage,
    newChat,
    clearItems,
  };
}

/**
 * SSE Hook
 * Server-Sent Events connection using fetch-event-source
 * With error handling and reconnection support
 */

import { useCallback, useRef, useState } from "react";
import {
  fetchEventSource,
  FetchEventSourceInit,
} from "@microsoft/fetch-event-source";
import type {
  SSETurnStartEvent,
  SSEThinkingEvent,
  SSETextDeltaEvent,
  SSEToolStartEvent,
  SSEToolInputEvent,
  SSEToolResultEvent,
  SSETurnEndEvent,
  SSEDoneEvent,
  SSEErrorEvent,
  SSETodosEvent,
  ChartConfig,
} from "../types";

interface SSECallbacks {
  onTurnStart?: (data: SSETurnStartEvent) => void;
  onThinking?: (data: SSEThinkingEvent) => void;
  onTextDelta?: (data: SSETextDeltaEvent) => void;
  onToolStart?: (data: SSEToolStartEvent) => void;
  onToolInput?: (data: SSEToolInputEvent) => void;
  onToolResult?: (data: SSEToolResultEvent) => void;
  onChart?: (data: ChartConfig) => void;
  onTodos?: (data: SSETodosEvent) => void;
  onTurnEnd?: (data: SSETurnEndEvent) => void;
  onDone?: (data: SSEDoneEvent) => void;
  onError?: (data: SSEErrorEvent) => void;
  onConnectionError?: (error: Error) => void;
}

class RetriableError extends Error {}
class FatalError extends Error {}

export function useSSE() {
  const abortControllerRef = useRef<AbortController | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  const sendMessage = useCallback(
    async (
      message: string,
      sessionId: string | null,
      callbacks: SSECallbacks,
    ) => {
      let receivedTerminalEvent = false;

      // Abort any existing connection
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      abortControllerRef.current = new AbortController();
      setIsConnected(true);

      const fetchOptions: FetchEventSourceInit = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message,
          sessionId,
        }),
        signal: abortControllerRef.current.signal,
        openWhenHidden: true,

        async onopen(response) {
          if (response.ok) {
            setIsConnected(true);
            return;
          }

          if (response.status >= 400 && response.status < 500) {
            // Client error - don't retry
            throw new FatalError(`Client error: ${response.status}`);
          }

          // Server error - could retry
          throw new RetriableError(`Server error: ${response.status}`);
        },

        onmessage(event) {
          if (!event.data) return;

          try {
            const data = JSON.parse(event.data);

            switch (event.event) {
              case "turn_start":
                callbacks.onTurnStart?.(data as SSETurnStartEvent);
                break;
              case "thinking":
                callbacks.onThinking?.(data as SSEThinkingEvent);
                break;
              case "text_delta":
                callbacks.onTextDelta?.(data as SSETextDeltaEvent);
                break;
              case "tool_start":
                callbacks.onToolStart?.(data as SSEToolStartEvent);
                break;
              case "tool_input":
                callbacks.onToolInput?.(data as SSEToolInputEvent);
                break;
              case "tool_result":
                callbacks.onToolResult?.(data as SSEToolResultEvent);
                break;
              case "chart":
                callbacks.onChart?.(data as ChartConfig);
                break;
              case "todos":
                callbacks.onTodos?.(data as SSETodosEvent);
                break;
              case "turn_end":
                callbacks.onTurnEnd?.(data as SSETurnEndEvent);
                break;
              case "done":
                callbacks.onDone?.(data as SSEDoneEvent);
                receivedTerminalEvent = true;
                setIsConnected(false);
                break;
              case "error":
                callbacks.onError?.(data as SSEErrorEvent);
                receivedTerminalEvent = true;
                setIsConnected(false);
                break;
            }
          } catch (e) {
            console.error("Failed to parse SSE data:", e);
          }
        },

        onerror(err) {
          setIsConnected(false);

          if (err instanceof FatalError) {
            callbacks.onError?.({
              code: "FATAL_ERROR",
              message: err.message,
            });
            throw err; // Stop retrying
          }

          // For retriable errors, notify but don't throw
          callbacks.onConnectionError?.(err);
          callbacks.onError?.({
            code: "CONNECTION_ERROR",
            message: "连接中断，请重试",
          });

          // Throw to stop retrying (we don't want automatic retries for chat)
          throw err;
        },

        onclose() {
          setIsConnected(false);
          if (!receivedTerminalEvent) {
            throw new FatalError("连接在完成前意外关闭");
          }
        },
      };

      try {
        await fetchEventSource("/api/chat", fetchOptions);
      } catch (err) {
        if ((err as Error).name === "AbortError") {
          // Request was aborted, ignore
          return;
        }

        // Handle other errors
        if (!(err instanceof FatalError) && !(err instanceof RetriableError)) {
          callbacks.onError?.({
            code: "NETWORK_ERROR",
            message:
              err instanceof Error ? err.message : "网络错误，请检查连接",
          });
        }
      } finally {
        setIsConnected(false);
      }
    },
    [],
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setIsConnected(false);
  }, []);

  return { sendMessage, abort, isConnected };
}

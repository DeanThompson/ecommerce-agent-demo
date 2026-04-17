/**
 * Chat Panel Component
 * Main chat interface combining message list and input
 */

import { useCallback, useState } from "react";
import { Alert } from "antd";
import { useChat } from "../../hooks/useChat";
import { InputArea } from "./InputArea";
import { MessageList } from "./MessageList";
import { TodoProgressBar } from "./TodoProgressBar";

export function ChatPanel() {
  const { items, todos, isLoading, error, sendMessage } = useChat();
  const [inputValue, setInputValue] = useState("");

  const handleSend = useCallback(
    (message: string) => {
      sendMessage(message);
      setInputValue("");
    },
    [sendMessage],
  );

  const handleSelectPrompt = useCallback((prompt: string) => {
    setInputValue(prompt);
    window.requestAnimationFrame(() => {
      const input = document.getElementById(
        "chat-input-textarea",
      ) as HTMLTextAreaElement | null;
      input?.focus();
    });
  }, []);

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        backgroundColor: "var(--bg-primary)",
        minHeight: 0,
      }}
    >
      {/* Todo Progress Bar */}
      <TodoProgressBar todos={todos} />

      {/* Error alert */}
      {error && (
        <Alert
          message={error}
          type="error"
          showIcon
          closable
          style={{ margin: "8px 16px" }}
        />
      )}

      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
        }}
      >
        {/* Message list */}
        <MessageList items={items} onSelectPrompt={handleSelectPrompt} />
      </div>

      {/* Input area */}
      <InputArea
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        disabled={isLoading}
        placeholder={isLoading ? "正在处理..." : "输入您的问题..."}
      />
    </div>
  );
}

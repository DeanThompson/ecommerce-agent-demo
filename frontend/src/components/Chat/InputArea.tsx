/**
 * Input Area Component
 * Message input with send button
 */

import { useCallback, KeyboardEvent } from "react";
import { Input, Button } from "antd";
import { SendOutlined } from "@ant-design/icons";

const { TextArea } = Input;

interface InputAreaProps {
  value: string;
  onChange: (value: string) => void;
  onSend: (message: string) => void;
  disabled?: boolean;
  placeholder?: string;
}

export function InputArea({
  value,
  onChange,
  onSend,
  disabled = false,
  placeholder = "输入您的问题...",
}: InputAreaProps) {
  const handleSend = useCallback(() => {
    if (value.trim() && !disabled) {
      onSend(value.trim());
    }
  }, [value, disabled, onSend]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend],
  );

  return (
    <div
      style={{
        padding: "16px 24px 24px",
        background: "transparent",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "flex-end",
          gap: "12px",
          background: "var(--bg-secondary)",
          border: "1px solid var(--border-color)",
          borderRadius: "16px",
          padding: "12px 16px",
          boxShadow: "var(--shadow-sm)",
        }}
      >
        <TextArea
          id="chat-input-textarea"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          autoSize={{ minRows: 1, maxRows: 4 }}
          variant="borderless"
          style={{
            resize: "none",
            background: "transparent",
            fontSize: "15px",
            lineHeight: 1.6,
            flex: 1,
          }}
        />
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          disabled={disabled || !value.trim()}
          style={{
            height: "40px",
            width: "40px",
            minWidth: "40px",
            borderRadius: "12px",
            background:
              disabled || !value.trim() ? "#d1d5db" : "var(--accent-color)",
            borderColor:
              disabled || !value.trim() ? "#d1d5db" : "var(--accent-color)",
          }}
        />
      </div>
      <div
        style={{
          marginTop: "8px",
          fontSize: "12px",
          color: "var(--text-secondary)",
          textAlign: "center",
        }}
      >
        按 Enter 发送，Shift + Enter 换行
      </div>
    </div>
  );
}

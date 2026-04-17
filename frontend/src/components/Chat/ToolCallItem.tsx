/**
 * Tool Call Item
 * Collapsible visualization for tool call status
 */

import {
  LoadingOutlined,
  CheckCircleOutlined,
  CloseCircleOutlined,
  ToolOutlined,
  DownOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { ToolCallBlock } from "../../types";

interface ToolCallItemProps {
  toolCall: ToolCallBlock;
  onToggleCollapse?: () => void;
}

const formatPreview = (value: unknown, maxLength = 180) => {
  try {
    const text = JSON.stringify(value, null, 2);
    if (!text) return "";
    return text.length > maxLength ? `${text.slice(0, maxLength)}…` : text;
  } catch {
    const fallback = String(value ?? "");
    return fallback.length > maxLength
      ? `${fallback.slice(0, maxLength)}…`
      : fallback;
  }
};

// Format tool name for display
const formatToolName = (name: string) => {
  // Remove MCP prefix if present (e.g., "mcp__ecommerce__query_sales" -> "query_sales")
  const cleanName = name.replace(/^mcp__[^_]+__/, "");
  // Convert snake_case to readable format
  return cleanName.replace(/_/g, " ");
};

export function ToolCallItem({
  toolCall,
  onToggleCollapse,
}: ToolCallItemProps) {
  const status = toolCall.status || "running";
  const isCollapsed = toolCall.isCollapsed ?? true;

  const statusMeta = {
    running: {
      label: "运行中",
      color: "#2563eb",
      icon: <LoadingOutlined spin />,
    },
    pending: {
      label: "等待中",
      color: "#2563eb",
      icon: <LoadingOutlined spin />,
    },
    completed: {
      label: "完成",
      color: "#16a34a",
      icon: <CheckCircleOutlined />,
    },
    error: { label: "失败", color: "#dc2626", icon: <CloseCircleOutlined /> },
  } as const;

  const meta = statusMeta[status] ?? statusMeta.running;
  const hasDetails =
    (toolCall.args && Object.keys(toolCall.args).length > 0) ||
    toolCall.result !== undefined;

  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        border: "1px solid var(--border-color)",
        borderRadius: "12px",
        overflow: "hidden",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      {/* Header - always visible */}
      <div
        onClick={hasDetails ? onToggleCollapse : undefined}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "12px 14px",
          cursor: hasDetails ? "pointer" : "default",
          userSelect: "none",
        }}
      >
        {/* Collapse indicator */}
        {hasDetails && (
          <span
            style={{
              color: "var(--text-secondary)",
              fontSize: "10px",
              width: "12px",
            }}
          >
            {isCollapsed ? <RightOutlined /> : <DownOutlined />}
          </span>
        )}

        {/* Tool icon */}
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "rgba(59, 130, 246, 0.12)",
            color: "#2563eb",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            flexShrink: 0,
          }}
        >
          <ToolOutlined />
        </div>

        {/* Tool name and duration */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: "var(--text-primary)",
              textTransform: "capitalize",
            }}
          >
            {formatToolName(toolCall.tool)}
          </div>
          {toolCall.duration !== undefined && (
            <div style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
              {toolCall.duration} ms
            </div>
          )}
        </div>

        {/* Status badge */}
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "4px 10px",
            borderRadius: "999px",
            background: "rgba(15, 23, 42, 0.06)",
            color: meta.color,
            fontSize: "12px",
            fontWeight: 600,
            flexShrink: 0,
          }}
        >
          {meta.icon}
          {meta.label}
        </div>
      </div>

      {/* Expandable details */}
      {!isCollapsed && hasDetails && (
        <div
          style={{
            borderTop: "1px solid var(--border-color)",
            padding: "12px 14px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {/* Arguments */}
          {toolCall.args && Object.keys(toolCall.args).length > 0 && (
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                }}
              >
                参数
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  background: "var(--bg-subtle)",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "200px",
                  overflow: "auto",
                }}
              >
                {formatPreview(toolCall.args, 500)}
              </div>
            </div>
          )}

          {/* Result */}
          {toolCall.result !== undefined && (
            <div>
              <div
                style={{
                  fontSize: "11px",
                  fontWeight: 600,
                  color: "var(--text-secondary)",
                  marginBottom: "4px",
                  textTransform: "uppercase",
                }}
              >
                结果
              </div>
              <div
                style={{
                  fontFamily: "var(--font-mono)",
                  fontSize: "12px",
                  color: "var(--text-secondary)",
                  background: "var(--bg-subtle)",
                  borderRadius: "8px",
                  padding: "8px 10px",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word",
                  maxHeight: "300px",
                  overflow: "auto",
                }}
              >
                {formatPreview(toolCall.result, 1000)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

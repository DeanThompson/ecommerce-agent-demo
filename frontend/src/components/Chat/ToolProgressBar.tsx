/**
 * Tool Progress Bar Component
 * Compact, collapsible visualization for tool calls
 */

import { useMemo, useState } from "react";
import {
  CheckCircleOutlined,
  CloseCircleOutlined,
  LoadingOutlined,
  RightOutlined,
} from "@ant-design/icons";
import type { ToolCallBlock } from "../../types";
import { ToolCallItem } from "./ToolCallItem";
import { ToolCallStatus } from "./ToolCallStatus";

interface ToolProgressBarProps {
  toolCalls: ToolCallBlock[];
}

const formatToolName = (name: string) => {
  const cleanName = name.replace(/^mcp__[^_]+__/, "");
  return cleanName.replace(/_/g, " ");
};

const formatDuration = (ms: number) => {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

export function ToolProgressBar({ toolCalls }: ToolProgressBarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [collapsedIds, setCollapsedIds] = useState<Record<string, boolean>>({});

  if (toolCalls.length === 0) return null;

  const hasRunning = toolCalls.some(
    (toolCall) =>
      toolCall.status === "running" || toolCall.status === "pending",
  );
  const hasError = toolCalls.some((toolCall) => toolCall.status === "error");

  const totalDuration = toolCalls.reduce(
    (sum, toolCall) => sum + (toolCall.duration || 0),
    0,
  );

  const statusColor = hasError ? "#dc2626" : hasRunning ? "#2563eb" : "#16a34a";
  const runningTool = useMemo(
    () =>
      toolCalls.find(
        (toolCall) =>
          toolCall.status === "running" || toolCall.status === "pending",
      ),
    [toolCalls],
  );

  return (
    <div
      style={{
        overflow: "hidden",
        marginBottom: "4px",
      }}
    >
      {runningTool && (
        <ToolCallStatus
          toolCall={{
            tool: runningTool.tool,
            status: runningTool.status,
            duration: runningTool.duration,
            args: runningTool.args,
          }}
        />
      )}

      <div
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          padding: "6px 0",
          cursor: "pointer",
          userSelect: "none",
        }}
        onMouseEnter={(e) =>
          (e.currentTarget.style.background = "var(--bg-subtle)")
        }
        onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
      >
        <span
          style={{
            color: "var(--text-secondary)",
            fontSize: "10px",
            transition: "transform 0.2s ease",
            transform: isExpanded ? "rotate(90deg)" : "rotate(0deg)",
          }}
        >
          <RightOutlined />
        </span>

        <span
          style={{
            fontSize: "13px",
            fontWeight: 500,
            color: "var(--text-primary)",
          }}
        >
          {hasRunning ? "运行中..." : `已使用 ${toolCalls.length} 个工具`}
        </span>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px",
            flex: 1,
          }}
        >
          {toolCalls.map((toolCall) => (
            <span
              key={toolCall.id}
              style={{
                padding: "3px 8px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 500,
                background:
                  toolCall.status === "completed"
                    ? "rgba(22, 163, 74, 0.1)"
                    : toolCall.status === "error"
                      ? "rgba(220, 38, 38, 0.1)"
                      : "rgba(59, 130, 246, 0.1)",
                color:
                  toolCall.status === "completed"
                    ? "#16a34a"
                    : toolCall.status === "error"
                      ? "#dc2626"
                      : "#2563eb",
                display: "inline-flex",
                alignItems: "center",
                gap: "4px",
                maxWidth: "140px",
                overflow: "hidden",
                textOverflow: "ellipsis",
                whiteSpace: "nowrap",
              }}
            >
              {toolCall.status === "running" || toolCall.status === "pending" ? (
                <LoadingOutlined spin style={{ fontSize: "10px" }} />
              ) : toolCall.status === "completed" ? (
                <CheckCircleOutlined style={{ fontSize: "10px" }} />
              ) : (
                <CloseCircleOutlined style={{ fontSize: "10px" }} />
              )}
              {formatToolName(toolCall.tool)}
            </span>
          ))}
        </div>

        {totalDuration > 0 && (
          <span
            style={{
              fontSize: "12px",
              color: "var(--text-secondary)",
              fontFamily: "var(--font-mono)",
              flexShrink: 0,
            }}
          >
            {formatDuration(totalDuration)}
          </span>
        )}

        <span
          style={{
            width: "8px",
            height: "8px",
            borderRadius: "50%",
            background: statusColor,
            flexShrink: 0,
            animation: hasRunning ? "pulse 1.5s infinite" : "none",
          }}
        />
      </div>

      {isExpanded && (
        <div
          style={{
            borderTop: "1px dashed var(--border-color)",
            padding: "8px 0",
            marginTop: "4px",
            display: "flex",
            flexDirection: "column",
            gap: "8px",
          }}
        >
          {toolCalls.map((toolCall) => {
            const collapsed = collapsedIds[toolCall.id] ?? true;
            return (
              <ToolCallItem
                key={toolCall.id}
                toolCall={{ ...toolCall, isCollapsed: collapsed }}
                onToggleCollapse={() =>
                  setCollapsedIds((current) => ({
                    ...current,
                    [toolCall.id]: !collapsed,
                  }))
                }
              />
            );
          })}
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }
      `}</style>
    </div>
  );
}

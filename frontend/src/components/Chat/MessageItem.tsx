/**
 * Message Item Component
 * Single message display with role-based styling
 * Supports unified assistant message with thinking, tool calls, text, and charts
 */

import { useState, useCallback, useMemo } from "react";
import { Avatar, message as antMessage } from "antd";
import {
  UserOutlined,
  RobotOutlined,
  CopyOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import type {
  ChatUserMessageItem,
  ChatAssistantMessageItem,
  ChartConfig,
} from "../../types";
import { ToolProgressBar } from "./ToolProgressBar";
import { InlineChartPreview } from "../Charts/InlineChartPreview";

// Content segment type for interleaved rendering
type ContentSegment =
  | { type: "text"; content: string }
  | { type: "chart"; chart: ChartConfig; index: number };

// Chart marker pattern: [[CHART]] or [[CHART:N]]
const CHART_MARKER_PATTERN = /\[\[CHART(?::(\d+))?\]\]/g;

// Parse text with chart markers and interleave with charts
function interleaveContent(
  text: string,
  charts: ChartConfig[],
): ContentSegment[] {
  if (!text && charts.length === 0) return [];
  if (!text) {
    return charts.map((chart, index) => ({
      type: "chart" as const,
      chart,
      index,
    }));
  }
  if (charts.length === 0) {
    // Remove any chart markers if no charts available
    const cleanText = text.replace(CHART_MARKER_PATTERN, "").trim();
    return cleanText ? [{ type: "text" as const, content: cleanText }] : [];
  }

  // Check if text contains chart markers
  const hasMarkers = CHART_MARKER_PATTERN.test(text);
  CHART_MARKER_PATTERN.lastIndex = 0; // Reset regex state

  if (hasMarkers) {
    // Parse markers and create segments
    return parseChartMarkers(text, charts);
  }

  // Fallback: no markers, append all charts at the end
  return [
    { type: "text" as const, content: text },
    ...charts.map((chart, index) => ({
      type: "chart" as const,
      chart,
      index,
    })),
  ];
}

// Parse text with [[CHART]] markers
function parseChartMarkers(
  text: string,
  charts: ChartConfig[],
): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const usedChartIndices = new Set<number>();
  let lastIndex = 0;
  let chartCounter = 0;

  // Find all markers and split text
  let match;
  while ((match = CHART_MARKER_PATTERN.exec(text)) !== null) {
    // Add text before marker
    const textBefore = text.slice(lastIndex, match.index).trim();
    if (textBefore) {
      segments.push({ type: "text" as const, content: textBefore });
    }

    // Determine which chart to use
    let chartIndex: number;
    if (match[1] !== undefined) {
      // Explicit index: [[CHART:N]]
      chartIndex = parseInt(match[1], 10);
    } else {
      // Sequential: [[CHART]]
      chartIndex = chartCounter++;
    }

    // Add chart if valid index
    if (chartIndex >= 0 && chartIndex < charts.length) {
      segments.push({
        type: "chart" as const,
        chart: charts[chartIndex],
        index: chartIndex,
      });
      usedChartIndices.add(chartIndex);
    }

    lastIndex = match.index + match[0].length;
  }

  // Add remaining text after last marker
  const textAfter = text.slice(lastIndex).trim();
  if (textAfter) {
    segments.push({ type: "text" as const, content: textAfter });
  }

  // Add any unused charts at the end
  charts.forEach((chart, index) => {
    if (!usedChartIndices.has(index)) {
      segments.push({
        type: "chart" as const,
        chart,
        index,
      });
    }
  });

  return segments;
}

interface UserMessageProps {
  message: ChatUserMessageItem;
}

function UserMessage({ message }: UserMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      antMessage.success("已复制");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      antMessage.error("复制失败");
    }
  }, [message.content]);

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "4px 0",
        flexDirection: "row-reverse",
        alignSelf: "flex-end",
        maxWidth: "760px",
        width: "100%",
      }}
    >
      <Avatar
        icon={<UserOutlined />}
        style={{
          backgroundColor: "var(--accent-color)",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          maxWidth: "80%",
          display: "flex",
          gap: "8px",
          alignItems: "center",
          minWidth: 0,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        {/* Copy button on the left */}
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: "transparent",
            border: "none",
            borderRadius: "6px",
            padding: "6px",
            cursor: "pointer",
            color: "var(--text-secondary)",
            fontSize: "14px",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s, background-color 0.2s",
            flexShrink: 0,
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--hover-bg)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          title="复制"
        >
          {copied ? <CheckOutlined /> : <CopyOutlined />}
        </button>
        <div
          className="user-message-bubble"
          style={{
            padding: "14px 18px",
            borderRadius: "16px 16px 6px 16px",
            backgroundColor: "var(--accent-color)",
            color: "white",
          }}
        >
          <div className="markdown" style={{ color: "inherit" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

interface AssistantMessageProps {
  message: ChatAssistantMessageItem;
}

function AssistantMessage({ message }: AssistantMessageProps) {
  const [copied, setCopied] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content || "");
      setCopied(true);
      antMessage.success("已复制");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      antMessage.error("复制失败");
    }
  }, [message.content]);

  // Interleave text and charts for better reading flow
  const contentSegments = useMemo(
    () => interleaveContent(message.content || "", message.charts),
    [message.content, message.charts],
  );

  // Render a text segment
  const renderTextSegment = (content: string, isLast: boolean) => (
    <div
      style={{
        display: "flex",
        gap: "8px",
        alignItems: "flex-start",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          padding: "8px 0",
          color: "var(--text-primary)",
          flex: 1,
          minWidth: 0,
        }}
      >
        <div className="markdown" style={{ color: "inherit" }}>
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
          {message.isStreaming && isLast && (
            <span
              style={{
                display: "inline-block",
                width: "4px",
                height: "16px",
                backgroundColor: "currentColor",
                marginLeft: "2px",
                animation: "blink 1s infinite",
              }}
            />
          )}
        </div>
      </div>
      {/* Copy button - only show on last text segment when not streaming */}
      {isLast && !message.isStreaming && message.content && (
        <button
          type="button"
          onClick={handleCopy}
          style={{
            background: "transparent",
            border: "none",
            borderRadius: "6px",
            padding: "6px",
            cursor: "pointer",
            color: "var(--text-secondary)",
            fontSize: "14px",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s, background-color 0.2s",
            flexShrink: 0,
            marginTop: "4px",
          }}
          onMouseEnter={(e) =>
            (e.currentTarget.style.backgroundColor = "var(--hover-bg)")
          }
          onMouseLeave={(e) =>
            (e.currentTarget.style.backgroundColor = "transparent")
          }
          title="复制"
        >
          {copied ? <CheckOutlined /> : <CopyOutlined />}
        </button>
      )}
    </div>
  );

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        padding: "4px 0",
        flexDirection: "row",
        alignSelf: "flex-start",
        width: "100%",
      }}
    >
      <Avatar
        icon={<RobotOutlined />}
        style={{
          backgroundColor: "#3b82f6",
          flexShrink: 0,
        }}
      />
      <div
        style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          minWidth: 0,
        }}
      >
        {/* Tool Progress Bar - compact, collapsible (exclude todo_write) */}
        {message.toolCalls.filter((tc) => tc.tool !== "todo_write").length >
          0 && (
          <ToolProgressBar
            toolCalls={message.toolCalls.filter(
              (tc) => tc.tool !== "todo_write",
            )}
          />
        )}

        {/* Interleaved content: text and charts */}
        {contentSegments.length > 0
          ? contentSegments.map((segment, i) => {
              if (segment.type === "text") {
                const isLastText = !contentSegments
                  .slice(i + 1)
                  .some((s) => s.type === "text");
                return (
                  <div key={`text-${i}`}>
                    {renderTextSegment(segment.content, isLastText)}
                  </div>
                );
              } else {
                return (
                  <InlineChartPreview
                    key={`chart-${segment.index}`}
                    chart={segment.chart}
                  />
                );
              }
            })
          : message.isStreaming
            ? // Show streaming indicator when no content yet
              renderTextSegment("思考中...", true)
            : null}
      </div>

      <style>{`
        @keyframes blink {
          0%, 50% { opacity: 1; }
          51%, 100% { opacity: 0; }
        }
      `}</style>
    </div>
  );
}

// Export both components for use in MessageList
export { UserMessage, AssistantMessage };

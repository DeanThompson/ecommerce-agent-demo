/**
 * Session List Component
 * List of all sessions
 */

import { Spin } from "antd";
import { HistoryOutlined } from "@ant-design/icons";
import type { SessionSummary } from "../../types";
import { SessionItem } from "./SessionItem";

interface SessionListProps {
  sessions: SessionSummary[];
  activeSessionId?: string | null;
  isLoading?: boolean;
  isCollapsed?: boolean;
  onSelect?: (sessionId: string) => void;
  onDelete?: (sessionId: string) => void;
}

export function SessionList({
  sessions,
  activeSessionId,
  isLoading,
  isCollapsed,
  onSelect,
  onDelete,
}: SessionListProps) {
  if (isLoading) {
    return (
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          padding: "48px",
        }}
      >
        <Spin />
      </div>
    );
  }

  if (sessions.length === 0) {
    return (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: isCollapsed ? "24px 8px" : "48px 16px",
          color: "var(--text-sidebar-muted)",
        }}
      >
        <HistoryOutlined style={{ fontSize: "32px", marginBottom: "12px" }} />
        {!isCollapsed && <div>暂无历史会话</div>}
      </div>
    );
  }

  return (
    <div style={{ overflowY: "auto" }}>
      {sessions.map((session) => (
        <SessionItem
          key={session.id}
          session={session}
          isActive={session.id === activeSessionId}
          isCollapsed={isCollapsed}
          onClick={() => onSelect?.(session.id)}
          onDelete={() => onDelete?.(session.id)}
        />
      ))}
    </div>
  );
}

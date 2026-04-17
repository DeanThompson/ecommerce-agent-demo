/**
 * Sidebar Component
 * Contains session list and new chat button
 */

import { Button, Typography } from "antd";
import {
  PlusOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from "@ant-design/icons";
import type { SessionSummary } from "../../types";
import { SessionList } from "../Session/SessionList";
import { useChatStore } from "../../stores/chatStore";

const { Title } = Typography;

interface SidebarProps {
  sessions: SessionSummary[];
  activeSessionId?: string | null;
  isLoading?: boolean;
  onNewChat?: () => void;
  onSelectSession?: (sessionId: string) => void;
  onDeleteSession?: (sessionId: string) => void;
}

export function Sidebar({
  sessions,
  activeSessionId,
  isLoading,
  onNewChat,
  onSelectSession,
  onDeleteSession,
}: SidebarProps) {
  const { isSidebarCollapsed, toggleSidebar } = useChatStore();

  return (
    <aside
      style={{
        width: isSidebarCollapsed
          ? "var(--sidebar-collapsed-width)"
          : "var(--sidebar-width)",
        backgroundColor: "var(--bg-sidebar)",
        borderRight: "1px solid rgba(255, 255, 255, 0.08)",
        display: "flex",
        flexDirection: "column",
        height: "100%",
        transition: "width var(--transition-normal)",
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: isSidebarCollapsed ? "12px 10px" : "16px",
          borderBottom: "1px solid rgba(255, 255, 255, 0.08)",
          display: "flex",
          flexDirection: "column",
          gap: "12px",
        }}
      >
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={onNewChat}
          block
          style={{
            color: "var(--text-sidebar)",
            border: "1px solid rgba(255, 255, 255, 0.16)",
            background: "rgba(255, 255, 255, 0.03)",
            borderRadius: "10px",
            height: "40px",
            justifyContent: isSidebarCollapsed ? "center" : "flex-start",
            paddingInline: isSidebarCollapsed ? 0 : 12,
          }}
        >
          {!isSidebarCollapsed && "新对话"}
        </Button>
        <Button
          type="text"
          icon={
            isSidebarCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />
          }
          onClick={toggleSidebar}
          style={{
            color: "var(--text-sidebar-muted)",
            borderRadius: "10px",
            height: "36px",
            textAlign: "left",
            justifyContent: isSidebarCollapsed ? "center" : "flex-start",
            paddingInline: isSidebarCollapsed ? 0 : 12,
          }}
        >
          {!isSidebarCollapsed && "折叠侧栏"}
        </Button>
      </div>

      {/* Session List */}
      <div
        style={{
          flex: 1,
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {!isSidebarCollapsed && (
          <div
            style={{
              padding: "12px 16px 8px",
            }}
          >
            <Title
              level={5}
              style={{ margin: 0, color: "var(--text-sidebar-muted)" }}
            >
              历史会话
            </Title>
          </div>
        )}
        <div style={{ flex: 1, overflowY: "auto", padding: "8px" }}>
          <SessionList
            sessions={sessions}
            activeSessionId={activeSessionId}
            isLoading={isLoading}
            isCollapsed={isSidebarCollapsed}
            onSelect={onSelectSession}
            onDelete={onDeleteSession}
          />
        </div>
      </div>
    </aside>
  );
}

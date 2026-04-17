/**
 * Session Item Component
 * Single session in the list
 */

import { useState } from "react";
import { Typography, Dropdown } from "antd";
import {
  MoreOutlined,
  MessageOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import type { SessionSummary } from "../../types";

const { Paragraph } = Typography;

interface SessionItemProps {
  session: SessionSummary;
  isActive?: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
  onDelete?: () => void;
}

export function SessionItem({
  session,
  isActive,
  isCollapsed,
  onClick,
  onDelete,
}: SessionItemProps) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      onClick={onClick}
      style={{
        padding: isCollapsed ? "12px 10px" : "10px 12px",
        cursor: "pointer",
        backgroundColor: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
        borderRadius: "8px",
        transition: "all var(--transition-fast)",
        display: "flex",
        alignItems: "center",
        gap: "10px",
      }}
      title={isCollapsed ? session.title : undefined}
      onMouseEnter={(e) => {
        setIsHovered(true);
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "rgba(255, 255, 255, 0.06)";
        }
      }}
      onMouseLeave={(e) => {
        setIsHovered(false);
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "transparent";
        }
      }}
    >
      <MessageOutlined
        style={{
          color: "var(--text-sidebar-muted)",
          fontSize: "14px",
          flexShrink: 0,
        }}
      />

      {!isCollapsed && (
        <>
          <Paragraph
            ellipsis={{ rows: 1 }}
            style={{
              margin: 0,
              flex: 1,
              fontSize: "14px",
              color: "var(--text-sidebar)",
              lineHeight: "20px",
            }}
          >
            {session.title}
          </Paragraph>

          <Dropdown
            menu={{
              items: [
                {
                  key: "delete",
                  label: "删除会话",
                  icon: <DeleteOutlined />,
                  danger: true,
                  onClick: ({ domEvent }) => {
                    domEvent.stopPropagation();
                    onDelete?.();
                  },
                },
              ],
            }}
            trigger={["click"]}
            placement="bottomRight"
          >
            <div
              onClick={(e) => e.stopPropagation()}
              style={{
                width: "24px",
                height: "24px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: "4px",
                opacity: isHovered ? 1 : 0,
                transition: "opacity var(--transition-fast)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor =
                  "rgba(255, 255, 255, 0.1)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <MoreOutlined
                style={{
                  color: "var(--text-sidebar-muted)",
                  fontSize: "14px",
                }}
              />
            </div>
          </Dropdown>
        </>
      )}
    </div>
  );
}

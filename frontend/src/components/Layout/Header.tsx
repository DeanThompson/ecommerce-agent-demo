/**
 * Header Component
 * App header with title and actions
 */

import { Button, Space, Typography } from "antd";
import { PlusOutlined } from "@ant-design/icons";

const { Title } = Typography;

interface HeaderProps {
  onNewChat?: () => void;
}

export function Header({ onNewChat }: HeaderProps) {
  return (
    <header
      style={{
        height: "var(--header-height)",
        padding: "0 24px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <Title
        level={4}
        style={{
          margin: 0,
          fontFamily: "var(--font-display)",
          fontWeight: 600,
        }}
      >
        E-Commerce Insight Agent
      </Title>

      <Space size={12}>
        <Button
          type="text"
          icon={<PlusOutlined />}
          onClick={onNewChat}
          style={{
            borderRadius: "12px",
            color: "var(--text-secondary)",
          }}
        >
          新对话
        </Button>
      </Space>
    </header>
  );
}

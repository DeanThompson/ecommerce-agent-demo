/**
 * Tool Call Status Component
 * Shows current tool execution status
 */

import { Tag, Space } from "antd";
import {
  LoadingOutlined,
  CheckCircleOutlined,
  DatabaseOutlined,
  BarChartOutlined,
} from "@ant-design/icons";
import type { ToolCall } from "../../types";

interface ToolCallStatusProps {
  toolCall: ToolCall;
}

const toolIcons: Record<string, React.ReactNode> = {
  query_sales: <DatabaseOutlined />,
  generate_chart: <BarChartOutlined />,
  get_data_info: <DatabaseOutlined />,
};

const toolNames: Record<string, string> = {
  query_sales: "查询销售数据",
  generate_chart: "生成图表",
  get_data_info: "获取数据信息",
};

export function ToolCallStatus({ toolCall }: ToolCallStatusProps) {
  const isRunning =
    toolCall.status === "running" || toolCall.status === "pending";
  const isCompleted = toolCall.status === "completed";

  return (
    <div
      style={{
        padding: "8px 20px",
        backgroundColor: "var(--bg-secondary)",
        borderBottom: "1px solid var(--border-color)",
      }}
    >
      <Space>
        <Tag
          icon={
            isRunning ? (
              <LoadingOutlined spin />
            ) : isCompleted ? (
              <CheckCircleOutlined />
            ) : null
          }
          color={isRunning ? "processing" : isCompleted ? "success" : "default"}
          style={{
            borderRadius: "999px",
            paddingInline: "10px",
          }}
        >
          {toolIcons[toolCall.tool] || <DatabaseOutlined />}
          <span style={{ marginLeft: "4px" }}>
            {toolNames[toolCall.tool] || toolCall.tool}
          </span>
        </Tag>
        {toolCall.duration && (
          <span style={{ fontSize: "12px", color: "var(--text-secondary)" }}>
            {toolCall.duration}ms
          </span>
        )}
      </Space>
    </div>
  );
}

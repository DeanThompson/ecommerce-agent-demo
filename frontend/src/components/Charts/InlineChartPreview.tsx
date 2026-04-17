/**
 * Inline Chart Preview Component
 * Renders chart content directly in chat message flow
 */

import {
  BarChartOutlined,
  LineChartOutlined,
  PieChartOutlined,
  TableOutlined,
  AreaChartOutlined,
} from "@ant-design/icons";
import type { ReactNode } from "react";
import type { ChartConfig } from "../../types";
import { ChartRenderer } from "./ChartRenderer";

interface InlineChartPreviewProps {
  chart: ChartConfig;
}

const chartIcons: Record<ChartConfig["type"], ReactNode> = {
  metric: <AreaChartOutlined />,
  table: <TableOutlined />,
  line: <LineChartOutlined />,
  bar: <BarChartOutlined />,
  pie: <PieChartOutlined />,
};

export function InlineChartPreview({ chart }: InlineChartPreviewProps) {
  return (
    <div
      style={{
        background: "var(--bg-secondary)",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "10px",
          padding: "10px 12px",
        }}
      >
        <div
          style={{
            width: "28px",
            height: "28px",
            borderRadius: "8px",
            background: "rgba(217, 119, 87, 0.1)",
            color: "var(--accent-color)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: "14px",
            flexShrink: 0,
          }}
        >
          {chartIcons[chart.type]}
        </div>
        <div
          style={{
            fontSize: "14px",
            fontWeight: 600,
            color: "var(--text-primary)",
            flex: 1,
          }}
        >
          {chart.title}
        </div>
      </div>

      <div style={{ padding: "0 8px 10px" }}>
        <ChartRenderer chart={chart} />
      </div>
    </div>
  );
}

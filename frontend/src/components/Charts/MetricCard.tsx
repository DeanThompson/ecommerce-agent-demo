/**
 * Metric Card Component
 * Displays a single metric value with optional comparison
 */

import { Card, Statistic, Typography } from "antd";
import { ArrowUpOutlined, ArrowDownOutlined } from "@ant-design/icons";
import type { ChartConfig, MetricConfig } from "../../types";

const { Text } = Typography;

interface MetricCardProps {
  chart: ChartConfig;
}

export function MetricCard({ chart }: MetricCardProps) {
  const config = chart.config as MetricConfig | undefined;
  const value = config?.value ?? 0;
  const unit = config?.unit ?? "";
  const compareValue = config?.compareValue;
  const compareLabel = config?.compareLabel;
  const trend = config?.trend;

  // Format value with thousand separators
  const formattedValue = value.toLocaleString("pt-BR", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return (
    <Card
      size="small"
      style={{
        borderRadius: "var(--border-radius-md)",
        boxShadow: "var(--shadow-sm)",
      }}
    >
      <Statistic
        title={chart.title}
        value={formattedValue}
        prefix={unit}
        valueStyle={{
          fontSize: "28px",
          fontWeight: 600,
          color: "var(--color-text-primary)",
        }}
      />
      {compareValue !== undefined && (
        <div style={{ marginTop: "8px" }}>
          <Text
            style={{
              color:
                trend === "up"
                  ? "var(--color-success)"
                  : trend === "down"
                    ? "var(--color-error)"
                    : "var(--color-text-secondary)",
            }}
          >
            {trend === "up" && <ArrowUpOutlined />}
            {trend === "down" && <ArrowDownOutlined />}
            <span style={{ marginLeft: "4px" }}>
              {compareValue > 0 ? "+" : ""}
              {compareValue.toFixed(1)}%
            </span>
            {compareLabel && (
              <span
                style={{
                  marginLeft: "8px",
                  color: "var(--color-text-tertiary)",
                }}
              >
                {compareLabel}
              </span>
            )}
          </Text>
        </div>
      )}
    </Card>
  );
}

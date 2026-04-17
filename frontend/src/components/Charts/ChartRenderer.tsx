/**
 * Chart Renderer Component
 * Dispatches to appropriate chart component based on type
 */

import type {
  ChartConfig,
  LineConfig,
  BarConfig,
  PieConfig,
} from "../../types";
import { MetricCard } from "./MetricCard";
import { DataTable } from "./DataTable";
import { LineChart } from "./LineChart";
import { BarChart } from "./BarChart";
import { PieChart } from "./PieChart";

interface ChartRendererProps {
  chart: ChartConfig;
}

export function ChartRenderer({ chart }: ChartRendererProps) {
  switch (chart.type) {
    case "metric":
      return <MetricCard chart={chart} />;
    case "table":
      return <DataTable chart={chart} />;
    case "line":
      return (
        <LineChart
          chart={chart as ChartConfig & { type: "line"; config: LineConfig }}
        />
      );
    case "bar":
      return (
        <BarChart
          chart={chart as ChartConfig & { type: "bar"; config: BarConfig }}
        />
      );
    case "pie":
      return (
        <PieChart
          chart={chart as ChartConfig & { type: "pie"; config: PieConfig }}
        />
      );
    default:
      return (
        <div style={{ padding: "16px", color: "var(--color-text-tertiary)" }}>
          不支持的图表类型: {chart.type}
        </div>
      );
  }
}

/**
 * Generate Chart Tool
 * Helper function for chart generation
 */

import type {
  ChartConfig,
  MetricConfig,
  TableConfig,
  TableColumn,
  LineConfig,
  BarConfig,
  PieConfig,
} from "../../types/index.js";

export interface GenerateChartParams {
  chart_type: "metric" | "table" | "line" | "bar" | "pie";
  title: string;
  data: unknown[];
  config?: {
    // Metric config
    value?: number;
    unit?: string;
    compareValue?: number;
    compareLabel?: string;
    trend?: "up" | "down";
    // Table config
    columns?: { key: string; title: string; format?: string }[];
    // Line/Bar config
    xField?: string;
    yField?: string;
    seriesField?: string;
    smooth?: boolean;
    showArea?: boolean;
    yAxisLabel?: string;
    xAxisLabel?: string;
    horizontal?: boolean;
    showLabel?: boolean;
    barWidth?: number;
    // Pie config
    nameField?: string;
    valueField?: string;
    showPercent?: boolean;
    innerRadius?: number;
    legendPosition?: "left" | "right" | "top" | "bottom";
  };
}

export function generateChart(params: GenerateChartParams): ChartConfig {
  const { chart_type, title, data, config } = params;

  switch (chart_type) {
    case "metric": {
      const metricConfig: MetricConfig = {
        value: config?.value,
        unit: config?.unit,
        compareValue: config?.compareValue,
        compareLabel: config?.compareLabel,
        trend: config?.trend,
      };
      return { type: "metric", title, data, config: metricConfig };
    }

    case "table": {
      const columns: TableColumn[] =
        config?.columns?.map((col) => ({
          key: col.key,
          title: col.title,
          dataType:
            col.format === "currency" ||
            col.format === "number" ||
            col.format === "percent"
              ? "number"
              : "string",
          format: col.format,
        })) || [];
      const tableConfig: TableConfig = { columns };
      return { type: "table", title, data, config: tableConfig };
    }

    case "line": {
      const lineConfig: LineConfig = {
        xField: config?.xField || "x",
        yField: config?.yField || "y",
        seriesField: config?.seriesField,
        smooth: config?.smooth,
        showArea: config?.showArea,
        yAxisLabel: config?.yAxisLabel,
        xAxisLabel: config?.xAxisLabel,
      };
      return { type: "line", title, data, config: lineConfig };
    }

    case "bar": {
      const barConfig: BarConfig = {
        xField: config?.xField || "x",
        yField: config?.yField || "y",
        seriesField: config?.seriesField,
        horizontal: config?.horizontal,
        showLabel: config?.showLabel,
        yAxisLabel: config?.yAxisLabel,
        xAxisLabel: config?.xAxisLabel,
        barWidth: config?.barWidth,
      };
      return { type: "bar", title, data, config: barConfig };
    }

    case "pie": {
      const pieConfig: PieConfig = {
        nameField: config?.nameField || "name",
        valueField: config?.valueField || "value",
        showPercent: config?.showPercent,
        showLabel: config?.showLabel,
        innerRadius: config?.innerRadius,
        legendPosition: config?.legendPosition,
      };
      return { type: "pie", title, data, config: pieConfig };
    }

    default:
      // Fallback to table
      return { type: "table", title, data, config: { columns: [] } };
  }
}

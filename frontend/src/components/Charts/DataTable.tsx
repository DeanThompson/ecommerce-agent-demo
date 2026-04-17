/**
 * Data Table Component
 * Displays tabular data using Ant Design Table
 */

import { Table, Card } from "antd";
import type { ColumnsType } from "antd/es/table";
import type { ChartConfig, TableConfig, TableColumn } from "../../types";

interface DataTableProps {
  chart: ChartConfig;
}

export function DataTable({ chart }: DataTableProps) {
  const config = chart.config as TableConfig | undefined;
  const data = chart.data as Record<string, unknown>[];

  // Generate columns from config or infer from data
  const columns: ColumnsType<Record<string, unknown>> =
    config?.columns?.map((col: TableColumn) => ({
      title: col.title,
      dataIndex: col.key,
      key: col.key,
      render: (value: unknown) => formatValue(value, col.format),
      sorter:
        col.dataType === "number"
          ? (a: Record<string, unknown>, b: Record<string, unknown>) =>
              (Number(a[col.key]) || 0) - (Number(b[col.key]) || 0)
          : undefined,
    })) || inferColumns(data);

  return (
    <Card
      title={chart.title}
      size="small"
      style={{
        borderRadius: "var(--border-radius-md)",
        boxShadow: "var(--shadow-sm)",
      }}
      styles={{
        body: { padding: 0 },
      }}
    >
      <Table
        columns={columns}
        dataSource={data.map((row, index) => ({ ...row, key: index }))}
        pagination={data.length > 10 ? { pageSize: 10, size: "small" } : false}
        size="small"
        scroll={{ x: "max-content" }}
      />
    </Card>
  );
}

function formatValue(value: unknown, format?: string): string {
  if (value === null || value === undefined) return "-";

  if (typeof value === "number") {
    switch (format) {
      case "currency":
        return `R$ ${value.toLocaleString("pt-BR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
      case "percent":
        return `${value.toFixed(1)}%`;
      case "number":
        return value.toLocaleString("pt-BR");
      default:
        return typeof value === "number" && !Number.isInteger(value)
          ? value.toLocaleString("pt-BR", {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })
          : value.toLocaleString("pt-BR");
    }
  }

  return String(value);
}

function inferColumns(
  data: Record<string, unknown>[],
): ColumnsType<Record<string, unknown>> {
  if (data.length === 0) return [];

  const firstRow = data[0];
  return Object.keys(firstRow).map((key) => ({
    title: key,
    dataIndex: key,
    key,
    render: (value: unknown) => formatValue(value),
  }));
}

/**
 * PieChart Component
 * Renders pie charts using ECharts
 */

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { Spin } from "antd";
import type { ChartConfig, PieConfig } from "../../types";

interface PieChartProps {
  chart: ChartConfig & { type: "pie"; config: PieConfig };
}

export function PieChart({ chart }: PieChartProps) {
  const chartRef = useRef<HTMLDivElement>(null);
  const echartsInstance = useRef<echarts.ECharts | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!chartRef.current) return;

    // Initialize ECharts instance
    if (!echartsInstance.current) {
      echartsInstance.current = echarts.init(chartRef.current);
    }

    const config = chart.config;
    const data = chart.data as Record<string, unknown>[];

    // Transform data for pie chart
    const pieData = data.map((d) => ({
      name: String(d[config.nameField]),
      value: Number(d[config.valueField]),
    }));

    // Determine legend orientation and position
    const legendPosition = config.legendPosition ?? "right";
    const isVertical = legendPosition === "left" || legendPosition === "right";

    const option: echarts.EChartsOption = {
      title: {
        text: chart.title,
        left: "center",
        textStyle: { fontSize: 14 },
      },
      tooltip: {
        trigger: "item",
        formatter:
          config.showPercent !== false ? "{b}: {c} ({d}%)" : "{b}: {c}",
      },
      legend: {
        orient: isVertical ? "vertical" : "horizontal",
        [legendPosition]: 10,
        top: isVertical ? "middle" : undefined,
        bottom: !isVertical && legendPosition === "bottom" ? 10 : undefined,
      },
      series: [
        {
          type: "pie",
          radius: config.innerRadius
            ? [`${config.innerRadius * 50}%`, "70%"]
            : "70%",
          center: ["50%", "55%"],
          data: pieData,
          label: {
            show: config.showLabel !== false,
            formatter: config.showPercent !== false ? "{b}: {d}%" : "{b}",
          },
          emphasis: {
            itemStyle: {
              shadowBlur: 10,
              shadowOffsetX: 0,
              shadowColor: "rgba(0, 0, 0, 0.5)",
            },
          },
        },
      ],
    };

    echartsInstance.current.setOption(option);
    setLoading(false);

    return () => {
      // Don't dispose on every render
    };
  }, [chart]);

  // Handle resize
  useEffect(() => {
    const handleResize = () => {
      echartsInstance.current?.resize();
    };
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
      echartsInstance.current?.dispose();
      echartsInstance.current = null;
    };
  }, []);

  return (
    <Spin spinning={loading} tip="加载图表...">
      <div
        ref={chartRef}
        style={{
          width: "100%",
          height: "300px",
          minHeight: "300px",
        }}
      />
    </Spin>
  );
}

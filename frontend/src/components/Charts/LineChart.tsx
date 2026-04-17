/**
 * LineChart Component
 * Renders line charts using ECharts
 */

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { Spin } from "antd";
import type { ChartConfig, LineConfig } from "../../types";

interface LineChartProps {
  chart: ChartConfig & { type: "line"; config: LineConfig };
}

export function LineChart({ chart }: LineChartProps) {
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

    // Extract X axis data
    const xData = data.map((d) => String(d[config.xField]));

    // Handle multi-series or single series
    let series: echarts.SeriesOption[];
    let legendData: string[] | undefined;

    if (config.seriesField) {
      // Group data by series field
      const groups = new Map<string, Record<string, unknown>[]>();
      data.forEach((d) => {
        const key = String(d[config.seriesField!]);
        if (!groups.has(key)) {
          groups.set(key, []);
        }
        groups.get(key)!.push(d);
      });

      legendData = Array.from(groups.keys());
      series = Array.from(groups.entries()).map(([name, items]) => ({
        name,
        type: "line" as const,
        data: items.map((d) => Number(d[config.yField])),
        smooth: config.smooth ?? true,
        areaStyle: config.showArea ? {} : undefined,
      }));
    } else {
      series = [
        {
          type: "line" as const,
          data: data.map((d) => Number(d[config.yField])),
          smooth: config.smooth ?? true,
          areaStyle: config.showArea ? {} : undefined,
        },
      ];
    }

    const option: echarts.EChartsOption = {
      title: {
        text: chart.title,
        left: "center",
        textStyle: { fontSize: 14 },
      },
      tooltip: {
        trigger: "axis",
        axisPointer: { type: "cross" },
      },
      legend: legendData
        ? {
            data: legendData,
            bottom: 0,
          }
        : undefined,
      grid: {
        left: "3%",
        right: "4%",
        bottom: legendData ? "15%" : "3%",
        containLabel: true,
      },
      xAxis: {
        type: "category",
        data: xData,
        name: config.xAxisLabel,
        boundaryGap: false,
      },
      yAxis: {
        type: "value",
        name: config.yAxisLabel,
      },
      series,
    };

    echartsInstance.current.setOption(option);
    setLoading(false);

    // Cleanup
    return () => {
      // Don't dispose on every render, only on unmount
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

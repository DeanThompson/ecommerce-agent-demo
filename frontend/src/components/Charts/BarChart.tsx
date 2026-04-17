/**
 * BarChart Component
 * Renders bar charts using ECharts
 */

import { useEffect, useRef, useState } from "react";
import * as echarts from "echarts";
import { Spin } from "antd";
import type { ChartConfig, BarConfig } from "../../types";

interface BarChartProps {
  chart: ChartConfig & { type: "bar"; config: BarConfig };
}

export function BarChart({ chart }: BarChartProps) {
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

    // Check if we have multi-series data
    const hasSeriesField =
      config.seriesField && data.length > 0 && config.seriesField in data[0];

    let option: echarts.EChartsOption;

    if (hasSeriesField) {
      // Multi-series bar chart
      const seriesField = config.seriesField!;

      // Get unique x values and series values
      const xValues = [...new Set(data.map((d) => String(d[config.xField])))];
      const seriesValues = [
        ...new Set(data.map((d) => String(d[seriesField]))),
      ];

      // Build data map for quick lookup
      const dataMap = new Map<string, number>();
      data.forEach((d) => {
        const key = `${d[config.xField]}-${d[seriesField]}`;
        dataMap.set(key, Number(d[config.yField]));
      });

      // Create series for each unique series value
      const series: echarts.BarSeriesOption[] = seriesValues.map(
        (seriesName) => ({
          name: seriesName,
          type: "bar",
          data: xValues.map((x) => dataMap.get(`${x}-${seriesName}`) ?? 0),
          barWidth: config.barWidth ? `${config.barWidth}%` : undefined,
          label: config.showLabel
            ? {
                show: true,
                position: config.horizontal ? "right" : "top",
                formatter: "{c}",
              }
            : undefined,
          itemStyle: {
            borderRadius: config.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
          },
        }),
      );

      const categoryAxis:
        | echarts.XAXisComponentOption
        | echarts.YAXisComponentOption = {
        type: "category",
        data: xValues,
        name: config.xAxisLabel,
        axisLabel: {
          rotate: config.horizontal ? 0 : xValues.length > 10 ? 45 : 0,
        },
      };

      const valueAxis:
        | echarts.XAXisComponentOption
        | echarts.YAXisComponentOption = {
        type: "value",
        name: config.yAxisLabel,
      };

      option = {
        title: {
          text: chart.title,
          left: "center",
          textStyle: { fontSize: 14 },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
        },
        legend: {
          top: 30,
          data: seriesValues,
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          top: 80,
          containLabel: true,
        },
        xAxis: config.horizontal
          ? (valueAxis as echarts.XAXisComponentOption)
          : (categoryAxis as echarts.XAXisComponentOption),
        yAxis: config.horizontal
          ? (categoryAxis as echarts.YAXisComponentOption)
          : (valueAxis as echarts.YAXisComponentOption),
        series,
      };
    } else {
      // Single series bar chart (original behavior)
      const xData = data.map((d) => String(d[config.xField]));
      const yData = data.map((d) => Number(d[config.yField]));

      const categoryAxis:
        | echarts.XAXisComponentOption
        | echarts.YAXisComponentOption = {
        type: "category",
        data: xData,
        name: config.xAxisLabel,
        axisLabel: {
          rotate: config.horizontal ? 0 : xData.length > 10 ? 45 : 0,
        },
      };

      const valueAxis:
        | echarts.XAXisComponentOption
        | echarts.YAXisComponentOption = {
        type: "value",
        name: config.yAxisLabel,
      };

      option = {
        title: {
          text: chart.title,
          left: "center",
          textStyle: { fontSize: 14 },
        },
        tooltip: {
          trigger: "axis",
          axisPointer: { type: "shadow" },
        },
        grid: {
          left: "3%",
          right: "4%",
          bottom: "3%",
          containLabel: true,
        },
        xAxis: config.horizontal
          ? (valueAxis as echarts.XAXisComponentOption)
          : (categoryAxis as echarts.XAXisComponentOption),
        yAxis: config.horizontal
          ? (categoryAxis as echarts.YAXisComponentOption)
          : (valueAxis as echarts.YAXisComponentOption),
        series: [
          {
            type: "bar",
            data: yData,
            barWidth: config.barWidth ? `${config.barWidth}%` : undefined,
            label: config.showLabel
              ? {
                  show: true,
                  position: config.horizontal ? "right" : "top",
                  formatter: "{c}",
                }
              : undefined,
            itemStyle: {
              borderRadius: config.horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0],
            },
          },
        ],
      };
    }

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

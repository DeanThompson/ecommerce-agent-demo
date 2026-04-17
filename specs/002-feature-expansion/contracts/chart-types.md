# Chart Types Contract: 功能扩展

**Feature**: 002-feature-expansion
**Date**: 2026-02-05

## 1. 类型定义

### 1.1 ChartConfig 扩展

```typescript
// 图表类型枚举
export type ChartType = 'metric' | 'table' | 'line' | 'bar' | 'pie';

// 统一图表配置接口
export interface ChartConfig {
  type: ChartType;
  title: string;
  data: unknown[];
  config?: ChartTypeConfig;
}

// 配置类型联合
export type ChartTypeConfig =
  | MetricConfig
  | TableConfig
  | LineConfig
  | BarConfig
  | PieConfig;
```

### 1.2 新增配置类型

```typescript
// 折线图配置
export interface LineConfig {
  xField: string;           // X 轴数据字段名
  yField: string;           // Y 轴数据字段名
  seriesField?: string;     // 多系列分组字段名
  smooth?: boolean;         // 是否平滑曲线，默认 true
  showArea?: boolean;       // 是否显示面积，默认 false
  yAxisLabel?: string;      // Y 轴标签文字
  xAxisLabel?: string;      // X 轴标签文字
}

// 柱状图配置
export interface BarConfig {
  xField: string;           // X 轴数据字段名
  yField: string;           // Y 轴数据字段名
  seriesField?: string;     // 多系列分组字段名
  horizontal?: boolean;     // 是否横向柱状图，默认 false
  showLabel?: boolean;      // 是否显示数值标签，默认 false
  yAxisLabel?: string;      // Y 轴标签文字
  xAxisLabel?: string;      // X 轴标签文字
  barWidth?: number;        // 柱子宽度百分比 0-100
}

// 饼图配置
export interface PieConfig {
  nameField: string;        // 名称字段名
  valueField: string;       // 数值字段名
  showPercent?: boolean;    // 是否显示百分比，默认 true
  showLabel?: boolean;      // 是否显示标签，默认 true
  innerRadius?: number;     // 内半径比例 0-1（环形图）
  legendPosition?: 'left' | 'right' | 'top' | 'bottom';
}
```

## 2. 组件接口

### 2.1 LineChart 组件

```typescript
interface LineChartProps {
  chart: ChartConfig & { type: 'line'; config: LineConfig };
}

// 使用示例
<LineChart chart={{
  type: 'line',
  title: '月度销售趋势',
  data: [
    { month: '2017-01', sales: 523456.78 },
    { month: '2017-02', sales: 612345.67 },
  ],
  config: {
    xField: 'month',
    yField: 'sales',
    smooth: true,
    yAxisLabel: '销售额 (R$)'
  }
}} />
```

### 2.2 BarChart 组件

```typescript
interface BarChartProps {
  chart: ChartConfig & { type: 'bar'; config: BarConfig };
}

// 使用示例
<BarChart chart={{
  type: 'bar',
  title: '各州销售对比',
  data: [
    { state: 'SP', sales: 4123456.78 },
    { state: 'RJ', sales: 1234567.89 },
  ],
  config: {
    xField: 'state',
    yField: 'sales',
    horizontal: false,
    showLabel: true
  }
}} />
```

### 2.3 PieChart 组件

```typescript
interface PieChartProps {
  chart: ChartConfig & { type: 'pie'; config: PieConfig };
}

// 使用示例
<PieChart chart={{
  type: 'pie',
  title: '订单状态分布',
  data: [
    { status: 'delivered', count: 89941 },
    { status: 'shipped', count: 1107 },
    { status: 'canceled', count: 625 },
  ],
  config: {
    nameField: 'status',
    valueField: 'count',
    showPercent: true
  }
}} />
```

## 3. ECharts 配置映射

### 3.1 LineChart → ECharts Option

```typescript
function toLineChartOption(chart: ChartConfig): EChartsOption {
  const config = chart.config as LineConfig;
  const data = chart.data as Record<string, unknown>[];

  // 提取 X 轴数据
  const xData = data.map(d => d[config.xField]);

  // 处理多系列
  let series: SeriesOption[];
  if (config.seriesField) {
    const groups = groupBy(data, config.seriesField);
    series = Object.entries(groups).map(([name, items]) => ({
      name,
      type: 'line',
      data: items.map(d => d[config.yField]),
      smooth: config.smooth ?? true,
      areaStyle: config.showArea ? {} : undefined,
    }));
  } else {
    series = [{
      type: 'line',
      data: data.map(d => d[config.yField]),
      smooth: config.smooth ?? true,
      areaStyle: config.showArea ? {} : undefined,
    }];
  }

  return {
    title: { text: chart.title },
    tooltip: { trigger: 'axis' },
    legend: config.seriesField ? { data: Object.keys(groups) } : undefined,
    xAxis: {
      type: 'category',
      data: xData,
      name: config.xAxisLabel,
    },
    yAxis: {
      type: 'value',
      name: config.yAxisLabel,
    },
    series,
  };
}
```

### 3.2 BarChart → ECharts Option

```typescript
function toBarChartOption(chart: ChartConfig): EChartsOption {
  const config = chart.config as BarConfig;
  const data = chart.data as Record<string, unknown>[];

  const xData = data.map(d => d[config.xField]);
  const yData = data.map(d => d[config.yField]);

  const baseAxis = {
    type: 'category' as const,
    data: xData,
    name: config.xAxisLabel,
  };

  const valueAxis = {
    type: 'value' as const,
    name: config.yAxisLabel,
  };

  return {
    title: { text: chart.title },
    tooltip: { trigger: 'axis' },
    xAxis: config.horizontal ? valueAxis : baseAxis,
    yAxis: config.horizontal ? baseAxis : valueAxis,
    series: [{
      type: 'bar',
      data: yData,
      barWidth: config.barWidth ? `${config.barWidth}%` : undefined,
      label: config.showLabel ? {
        show: true,
        position: config.horizontal ? 'right' : 'top',
      } : undefined,
    }],
  };
}
```

### 3.3 PieChart → ECharts Option

```typescript
function toPieChartOption(chart: ChartConfig): EChartsOption {
  const config = chart.config as PieConfig;
  const data = chart.data as Record<string, unknown>[];

  const pieData = data.map(d => ({
    name: String(d[config.nameField]),
    value: Number(d[config.valueField]),
  }));

  return {
    title: { text: chart.title },
    tooltip: {
      trigger: 'item',
      formatter: config.showPercent
        ? '{b}: {c} ({d}%)'
        : '{b}: {c}',
    },
    legend: {
      orient: config.legendPosition === 'left' || config.legendPosition === 'right'
        ? 'vertical'
        : 'horizontal',
      [config.legendPosition ?? 'right']: 10,
    },
    series: [{
      type: 'pie',
      radius: config.innerRadius
        ? [`${config.innerRadius * 50}%`, '70%']
        : '70%',
      data: pieData,
      label: {
        show: config.showLabel ?? true,
        formatter: config.showPercent ? '{b}: {d}%' : '{b}',
      },
      emphasis: {
        itemStyle: {
          shadowBlur: 10,
          shadowOffsetX: 0,
          shadowColor: 'rgba(0, 0, 0, 0.5)',
        },
      },
    }],
  };
}
```

## 4. ChartRenderer 扩展

```typescript
// 更新后的 ChartRenderer
export function ChartRenderer({ chart }: { chart: ChartConfig }) {
  switch (chart.type) {
    case 'metric':
      return <MetricCard chart={chart} />;
    case 'table':
      return <DataTable chart={chart} />;
    case 'line':
      return <LineChart chart={chart} />;
    case 'bar':
      return <BarChart chart={chart} />;
    case 'pie':
      return <PieChart chart={chart} />;
    default:
      return (
        <div style={{ padding: '16px', color: 'var(--color-text-tertiary)' }}>
          不支持的图表类型: {(chart as ChartConfig).type}
        </div>
      );
  }
}
```

## 5. 样式规范

### 5.1 图表容器

```css
.chart-container {
  width: 100%;
  min-height: 300px;
  padding: 16px;
  background: var(--color-bg-container);
  border-radius: 8px;
}
```

### 5.2 颜色主题

使用 Ant Design 默认色板，确保与整体 UI 一致：

```typescript
const chartColors = [
  '#1890ff', // 主色
  '#52c41a', // 成功色
  '#faad14', // 警告色
  '#f5222d', // 错误色
  '#722ed1', // 紫色
  '#13c2c2', // 青色
  '#eb2f96', // 粉色
  '#fa8c16', // 橙色
];
```

### 5.3 响应式

图表组件应响应容器宽度变化：

```typescript
// 使用 ResizeObserver 或 ECharts 内置 resize
useEffect(() => {
  const handleResize = () => {
    chartRef.current?.getEchartsInstance().resize();
  };
  window.addEventListener('resize', handleResize);
  return () => window.removeEventListener('resize', handleResize);
}, []);
```

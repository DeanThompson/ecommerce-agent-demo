# Research: 功能扩展 - 多维度查询与可视化

**Feature**: 002-feature-expansion
**Date**: 2026-02-05
**Status**: Complete

## 1. 现有架构分析

### 1.1 MCP 工具模式

**现有实现** (`backend/src/mcp/tools/index.ts`):
- 使用 `@modelcontextprotocol/sdk` 的 `McpServer.tool()` 方法注册工具
- 使用 `zod` 定义输入参数 schema
- 返回格式为 `{ content: [{ type: 'text', text: JSON.stringify(result) }] }`

**Decision**: 新工具将遵循相同模式，保持一致性。

### 1.2 数据库查询模式

**现有实现** (`backend/src/db/queries.ts`):
- 使用 `v_order_details` 视图进行销售查询
- 支持动态构建 SQL（GROUP BY、WHERE、ORDER BY）
- 返回 `{ success, data, summary, metadata }` 结构

**Decision**: 新查询工具将复用此模式，针对不同实体创建专用查询函数。

### 1.3 图表组件模式

**现有实现** (`frontend/src/components/Charts/`):
- `ChartRenderer` 作为分发器，根据 `chart.type` 渲染对应组件
- `ChartConfig` 类型定义图表配置
- 已有 `metric` 和 `table` 两种类型

**Decision**: 新图表组件（line, bar, pie）将遵循相同模式，扩展 `ChartConfig` 类型。

## 2. 新 MCP 工具设计

### 2.1 query_orders 工具

**需求**: 查询订单数据，支持状态筛选、配送时效分析

**SQL 基础**:
```sql
-- 订单状态分布
SELECT order_status, COUNT(*) as count
FROM orders
WHERE order_purchase_timestamp BETWEEN ? AND ?
GROUP BY order_status;

-- 配送时效计算
SELECT
  AVG(julianday(order_delivered_customer_date) - julianday(order_purchase_timestamp)) as avg_delivery_days
FROM orders
WHERE order_status = 'delivered';

-- 配送超时订单
SELECT COUNT(*) as overdue_count
FROM orders
WHERE order_delivered_customer_date > order_estimated_delivery_date;
```

**Decision**: 创建 `queryOrders` 函数，支持 `analysis_type` 参数区分不同分析场景。

### 2.2 query_customers 工具

**需求**: 客户分布、复购分析、客单价分析

**SQL 基础**:
```sql
-- 客户地域分布
SELECT customer_state, COUNT(DISTINCT customer_unique_id) as customer_count
FROM customers
GROUP BY customer_state;

-- 复购客户识别
SELECT customer_unique_id, COUNT(DISTINCT order_id) as order_count
FROM orders o
JOIN customers c ON o.customer_id = c.customer_id
GROUP BY customer_unique_id
HAVING order_count > 1;

-- 客单价分布
SELECT
  CASE
    WHEN total_value < 50 THEN '0-50'
    WHEN total_value < 100 THEN '50-100'
    WHEN total_value < 200 THEN '100-200'
    ELSE '200+'
  END as price_range,
  COUNT(*) as count
FROM (
  SELECT order_id, SUM(price) as total_value
  FROM order_items
  GROUP BY order_id
) t
GROUP BY price_range;
```

**Decision**: 创建 `queryCustomers` 函数，使用 `analysis_type` 参数（distribution/repurchase/value_segment）。

### 2.3 query_reviews 工具

**需求**: 评分分布、差评分析

**SQL 基础**:
```sql
-- 评分分布
SELECT review_score, COUNT(*) as count
FROM order_reviews
GROUP BY review_score;

-- 差评品类分析
SELECT
  COALESCE(t.product_category_name_english, p.product_category_name) as category,
  COUNT(*) as bad_review_count,
  AVG(r.review_score) as avg_score
FROM order_reviews r
JOIN orders o ON r.order_id = o.order_id
JOIN order_items oi ON o.order_id = oi.order_id
JOIN products p ON oi.product_id = p.product_id
LEFT JOIN product_category_name_translation t ON p.product_category_name = t.product_category_name
WHERE r.review_score <= 2
GROUP BY category
ORDER BY bad_review_count DESC;
```

**Decision**: 创建 `queryReviews` 函数，支持 `score_filter` 和 `group_by` 参数。

### 2.4 query_sellers 工具

**需求**: 卖家排名、地域分布、绩效查询

**SQL 基础**:
```sql
-- 卖家销量排名
SELECT
  s.seller_id,
  s.seller_city,
  s.seller_state,
  COUNT(DISTINCT oi.order_id) as order_count,
  SUM(oi.price) as total_sales
FROM sellers s
JOIN order_items oi ON s.seller_id = oi.seller_id
GROUP BY s.seller_id
ORDER BY total_sales DESC
LIMIT 10;

-- 卖家地域分布
SELECT seller_state, COUNT(*) as seller_count
FROM sellers
GROUP BY seller_state;

-- 卖家评分
SELECT
  s.seller_id,
  AVG(r.review_score) as avg_score,
  COUNT(r.review_id) as review_count
FROM sellers s
JOIN order_items oi ON s.seller_id = oi.seller_id
JOIN order_reviews r ON oi.order_id = r.order_id
GROUP BY s.seller_id
HAVING review_count >= 10
ORDER BY avg_score ASC
LIMIT 10;
```

**Decision**: 创建 `querySellers` 函数，支持 `analysis_type` 参数（ranking/distribution/performance）。

### 2.5 analyze_trend 工具

**需求**: 时间序列趋势分析，同比/环比计算

**算法设计**:
- 同比 (YoY): `(current_period - same_period_last_year) / same_period_last_year * 100`
- 环比 (MoM/QoQ): `(current_period - previous_period) / previous_period * 100`

**Decision**: 创建 `analyzeTrend` 函数，复用 `querySales` 获取数据，增加同比/环比计算逻辑。

## 3. 新图表组件设计

### 3.1 ECharts 集成

**现有依赖**: `echarts` 5.4.3, `echarts-for-react` 3.0.2

**最佳实践**:
- 使用 `ReactECharts` 组件包装 ECharts
- 配置 `option` 对象定义图表
- 支持 `onEvents` 处理交互事件

### 3.2 LineChart 组件

**ECharts 配置**:
```typescript
const option = {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: xData },
  yAxis: { type: 'value' },
  series: [{ type: 'line', data: yData, smooth: true }]
};
```

**多系列支持**: 通过 `series` 数组添加多条线

### 3.3 BarChart 组件

**ECharts 配置**:
```typescript
const option = {
  tooltip: { trigger: 'axis' },
  xAxis: { type: 'category', data: xData },
  yAxis: { type: 'value' },
  series: [{ type: 'bar', data: yData }]
};
```

**横向柱状图**: 交换 xAxis 和 yAxis 配置

### 3.4 PieChart 组件

**ECharts 配置**:
```typescript
const option = {
  tooltip: { trigger: 'item' },
  legend: { orient: 'vertical', left: 'left' },
  series: [{
    type: 'pie',
    radius: '50%',
    data: pieData, // [{ value: 100, name: 'A' }, ...]
    emphasis: { itemStyle: { shadowBlur: 10 } }
  }]
};
```

## 4. ChartConfig 类型扩展

**Decision**: 扩展 `ChartConfig` 类型支持新图表类型

```typescript
export interface ChartConfig {
  type: 'metric' | 'table' | 'line' | 'bar' | 'pie';
  title: string;
  data: unknown[];
  config?: MetricConfig | TableConfig | LineConfig | BarConfig | PieConfig;
}

export interface LineConfig {
  xField: string;           // X 轴字段名
  yField: string;           // Y 轴字段名
  seriesField?: string;     // 多系列字段名
  smooth?: boolean;         // 平滑曲线
}

export interface BarConfig {
  xField: string;
  yField: string;
  seriesField?: string;
  horizontal?: boolean;     // 横向柱状图
}

export interface PieConfig {
  nameField: string;        // 名称字段
  valueField: string;       // 数值字段
  showPercent?: boolean;    // 显示百分比
}
```

## 5. generate_chart 工具扩展

**Decision**: 扩展 `generate_chart` 工具支持新图表类型

```typescript
server.tool(
  'generate_chart',
  '生成图表配置，支持 metric, table, line, bar, pie 五种类型。',
  {
    chart_type: z.enum(['metric', 'table', 'line', 'bar', 'pie']),
    // ... 其他参数
    config: z.object({
      // 现有配置...
      // 新增配置
      xField: z.string().optional(),
      yField: z.string().optional(),
      seriesField: z.string().optional(),
      nameField: z.string().optional(),
      valueField: z.string().optional(),
      horizontal: z.boolean().optional(),
      smooth: z.boolean().optional(),
    }).optional(),
  },
  // ...
);
```

## 6. 测试策略

### 6.1 MCP 工具测试

**测试文件**: `backend/tests/mcp/tools.test.ts`

**测试用例**:
- 各工具基本查询功能
- 参数验证（无效日期、无效状态等）
- 边界条件（空结果、大数据量）

### 6.2 图表组件测试

**测试文件**: `frontend/tests/components/Charts.test.tsx`

**测试用例**:
- 各图表类型正确渲染
- 数据格式转换
- 交互事件响应

## 7. 总结

| 决策项 | 选择 | 理由 |
|--------|------|------|
| MCP 工具模式 | 复用现有模式 | 保持一致性，降低学习成本 |
| 查询函数设计 | 每个实体独立函数 | 职责单一，便于维护 |
| 图表组件 | 基于 ECharts | 已有依赖，功能丰富 |
| 类型扩展 | 扩展 ChartConfig | 向后兼容，类型安全 |
| 测试策略 | 集成测试为主 | 符合 Constitution 要求 |

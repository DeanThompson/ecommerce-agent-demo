# Data Model: 功能扩展 - 多维度查询与可视化

**Feature**: 002-feature-expansion
**Date**: 2026-02-05

## 1. 现有数据模型（来自 Olist 数据集）

本功能扩展基于已导入的 Olist 数据集，不新增数据表，仅定义查询接口和前端类型。

### 1.1 核心实体关系

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   orders    │────▶│ order_items │◀────│  products   │
│             │     │             │     │             │
│ order_id    │     │ order_id    │     │ product_id  │
│ customer_id │     │ product_id  │     │ category    │
│ status      │     │ seller_id   │     └─────────────┘
│ timestamps  │     │ price       │
└──────┬──────┘     └──────┬──────┘
       │                   │
       ▼                   ▼
┌─────────────┐     ┌─────────────┐
│  customers  │     │   sellers   │
│             │     │             │
│ customer_id │     │ seller_id   │
│ unique_id   │     │ city/state  │
│ city/state  │     └─────────────┘
└─────────────┘
       │
       ▼
┌─────────────┐
│order_reviews│
│             │
│ order_id    │
│ score (1-5) │
│ comment     │
└─────────────┘
```

### 1.2 关键字段说明

| 实体 | 字段 | 类型 | 说明 |
|------|------|------|------|
| orders | order_status | enum | delivered, shipped, canceled, processing, etc. |
| orders | order_purchase_timestamp | datetime | 下单时间 |
| orders | order_delivered_customer_date | datetime | 实际送达时间 |
| orders | order_estimated_delivery_date | datetime | 预计送达时间 |
| customers | customer_unique_id | string | 客户唯一标识（用于复购分析） |
| order_reviews | review_score | int | 评分 1-5 |
| order_items | price | decimal | 商品价格 |
| order_items | freight_value | decimal | 运费 |

## 2. 查询结果类型定义

### 2.1 订单查询结果

```typescript
// 订单状态分布
interface OrderStatusDistribution {
  order_status: string;
  count: number;
  percentage: number;
}

// 配送时效分析
interface DeliveryAnalysis {
  avg_delivery_days: number;
  min_delivery_days: number;
  max_delivery_days: number;
  on_time_count: number;
  overdue_count: number;
  on_time_rate: number;
}

// 按地区配送时效
interface DeliveryByRegion {
  state: string;
  avg_delivery_days: number;
  order_count: number;
}
```

### 2.2 客户查询结果

```typescript
// 客户地域分布
interface CustomerDistribution {
  state: string;
  city?: string;
  customer_count: number;
  percentage: number;
}

// 复购分析
interface RepurchaseAnalysis {
  total_customers: number;
  repurchase_customers: number;
  repurchase_rate: number;
  avg_orders_per_customer: number;
}

// 客单价分布
interface OrderValueDistribution {
  price_range: string;
  order_count: number;
  percentage: number;
}
```

### 2.3 评价查询结果

```typescript
// 评分分布
interface ScoreDistribution {
  review_score: number;
  count: number;
  percentage: number;
}

// 品类评分分析
interface CategoryReviewAnalysis {
  category: string;
  avg_score: number;
  review_count: number;
  bad_review_count: number;
  bad_review_rate: number;
}
```

### 2.4 卖家查询结果

```typescript
// 卖家排名
interface SellerRanking {
  seller_id: string;
  seller_city: string;
  seller_state: string;
  order_count: number;
  total_sales: number;
  avg_score?: number;
}

// 卖家地域分布
interface SellerDistribution {
  state: string;
  seller_count: number;
  percentage: number;
}
```

### 2.5 趋势分析结果

```typescript
// 趋势数据点
interface TrendDataPoint {
  period: string;
  value: number;
  compare_value?: number;  // 对比期数值
  change_rate?: number;    // 变化率 (%)
}

// 趋势分析结果
interface TrendAnalysisResult {
  metric: string;
  period_type: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  data: TrendDataPoint[];
  summary: {
    total: number;
    avg: number;
    max: number;
    min: number;
    overall_change_rate?: number;
  };
}
```

## 3. 图表配置类型扩展

### 3.1 扩展后的 ChartConfig

```typescript
export type ChartType = 'metric' | 'table' | 'line' | 'bar' | 'pie';

export interface ChartConfig {
  type: ChartType;
  title: string;
  data: unknown[];
  config?: ChartTypeConfig;
}

export type ChartTypeConfig =
  | MetricConfig
  | TableConfig
  | LineConfig
  | BarConfig
  | PieConfig;
```

### 3.2 新增图表配置类型

```typescript
// 折线图配置
export interface LineConfig {
  xField: string;           // X 轴数据字段
  yField: string;           // Y 轴数据字段
  seriesField?: string;     // 多系列分组字段
  smooth?: boolean;         // 是否平滑曲线，默认 true
  showArea?: boolean;       // 是否显示面积，默认 false
  yAxisLabel?: string;      // Y 轴标签
}

// 柱状图配置
export interface BarConfig {
  xField: string;           // X 轴数据字段
  yField: string;           // Y 轴数据字段
  seriesField?: string;     // 多系列分组字段
  horizontal?: boolean;     // 是否横向，默认 false
  showLabel?: boolean;      // 是否显示数值标签
  yAxisLabel?: string;      // Y 轴标签
}

// 饼图配置
export interface PieConfig {
  nameField: string;        // 名称字段
  valueField: string;       // 数值字段
  showPercent?: boolean;    // 是否显示百分比，默认 true
  innerRadius?: number;     // 内半径（环形图），0-1
}
```

## 4. 状态转换规则

### 4.1 订单状态流转

```
created → approved → invoiced → processing → shipped → delivered
                                    ↓
                               canceled
                                    ↓
                              unavailable
```

### 4.2 配送状态判定

| 条件 | 状态 |
|------|------|
| delivered_date <= estimated_date | 准时送达 |
| delivered_date > estimated_date | 超时送达 |
| delivered_date IS NULL | 未送达 |

### 4.3 评分等级划分

| 评分 | 等级 |
|------|------|
| 5 | 非常满意 |
| 4 | 满意 |
| 3 | 一般 |
| 1-2 | 差评 |

## 5. 数据验证规则

### 5.1 输入参数验证

| 参数 | 验证规则 |
|------|----------|
| start_date | 格式 YYYY-MM-DD，不早于 2016-09-01 |
| end_date | 格式 YYYY-MM-DD，不晚于 2018-08-31 |
| limit | 正整数，最大 1000 |
| score_filter.min/max | 1-5 整数 |
| state | 有效的巴西州代码（2 字母） |

### 5.2 输出数据格式

所有查询结果遵循统一格式：

```typescript
interface QueryResult<T> {
  success: boolean;
  data: T[];
  summary?: Record<string, number>;
  metadata: {
    query_time_ms: number;
    row_count: number;
  };
  error?: string;
}
```

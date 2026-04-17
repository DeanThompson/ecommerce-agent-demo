# MCP Tools Contract: 功能扩展

**Feature**: 002-feature-expansion
**Date**: 2026-02-05

## 1. query_orders

查询订单数据，支持状态分布、配送时效分析。

### Input Schema

```typescript
{
  start_date: string;           // 必填，格式 YYYY-MM-DD
  end_date: string;             // 必填，格式 YYYY-MM-DD
  analysis_type: 'status_distribution' | 'delivery_analysis' | 'delivery_by_region';
  filters?: {
    status?: string;            // 订单状态筛选
    state?: string;             // 州筛选
  };
  limit?: number;               // 返回记录数限制，默认 100
}
```

### Output Schema

```typescript
{
  success: boolean;
  data: OrderStatusDistribution[] | DeliveryAnalysis | DeliveryByRegion[];
  summary?: {
    total_orders: number;
    delivered_orders: number;
    on_time_rate?: number;
  };
  metadata: {
    query_time_ms: number;
    row_count: number;
  };
}
```

### Example

**Input**:
```json
{
  "start_date": "2017-01-01",
  "end_date": "2017-12-31",
  "analysis_type": "status_distribution"
}
```

**Output**:
```json
{
  "success": true,
  "data": [
    { "order_status": "delivered", "count": 89941, "percentage": 96.5 },
    { "order_status": "shipped", "count": 1107, "percentage": 1.2 },
    { "order_status": "canceled", "count": 625, "percentage": 0.7 }
  ],
  "summary": { "total_orders": 93200 },
  "metadata": { "query_time_ms": 45, "row_count": 8 }
}
```

---

## 2. query_customers

查询客户数据，支持地域分布、复购分析、客单价分析。

### Input Schema

```typescript
{
  analysis_type: 'distribution' | 'repurchase' | 'value_segment';
  group_by?: 'state' | 'city';  // distribution 类型时使用
  filters?: {
    state?: string;
    min_orders?: number;        // repurchase 类型时使用
  };
  limit?: number;
}
```

### Output Schema

```typescript
{
  success: boolean;
  data: CustomerDistribution[] | RepurchaseAnalysis | OrderValueDistribution[];
  summary?: {
    total_customers: number;
    repurchase_rate?: number;
    avg_order_value?: number;
  };
  metadata: {
    query_time_ms: number;
    row_count: number;
  };
}
```

### Example

**Input**:
```json
{
  "analysis_type": "repurchase"
}
```

**Output**:
```json
{
  "success": true,
  "data": {
    "total_customers": 96096,
    "repurchase_customers": 2997,
    "repurchase_rate": 3.12,
    "avg_orders_per_customer": 1.03
  },
  "metadata": { "query_time_ms": 120, "row_count": 1 }
}
```

---

## 3. query_reviews

查询评价数据，支持评分分布、差评分析。

### Input Schema

```typescript
{
  score_filter?: {
    min?: number;               // 最低评分 1-5
    max?: number;               // 最高评分 1-5
  };
  group_by?: 'score' | 'category' | 'month';
  include_comments?: boolean;   // 是否包含评论内容
  limit?: number;
}
```

### Output Schema

```typescript
{
  success: boolean;
  data: ScoreDistribution[] | CategoryReviewAnalysis[];
  summary?: {
    total_reviews: number;
    avg_score: number;
    bad_review_count: number;
    bad_review_rate: number;
  };
  metadata: {
    query_time_ms: number;
    row_count: number;
  };
}
```

### Example

**Input**:
```json
{
  "group_by": "score"
}
```

**Output**:
```json
{
  "success": true,
  "data": [
    { "review_score": 5, "count": 57328, "percentage": 57.8 },
    { "review_score": 4, "count": 19142, "percentage": 19.3 },
    { "review_score": 3, "count": 8179, "percentage": 8.2 },
    { "review_score": 2, "count": 3151, "percentage": 3.2 },
    { "review_score": 1, "count": 11424, "percentage": 11.5 }
  ],
  "summary": { "total_reviews": 99224, "avg_score": 4.09 },
  "metadata": { "query_time_ms": 35, "row_count": 5 }
}
```

---

## 4. query_sellers

查询卖家数据，支持排名、地域分布、绩效查询。

### Input Schema

```typescript
{
  analysis_type: 'ranking' | 'distribution' | 'performance';
  sort_by?: 'sales' | 'orders' | 'score';  // ranking 类型时使用
  filters?: {
    state?: string;
    min_orders?: number;        // performance 类型时使用
  };
  limit?: number;
}
```

### Output Schema

```typescript
{
  success: boolean;
  data: SellerRanking[] | SellerDistribution[];
  summary?: {
    total_sellers: number;
    avg_sales_per_seller?: number;
    avg_score?: number;
  };
  metadata: {
    query_time_ms: number;
    row_count: number;
  };
}
```

### Example

**Input**:
```json
{
  "analysis_type": "ranking",
  "sort_by": "sales",
  "limit": 5
}
```

**Output**:
```json
{
  "success": true,
  "data": [
    { "seller_id": "abc123", "seller_city": "sao paulo", "seller_state": "SP", "order_count": 2033, "total_sales": 229471.50 },
    { "seller_id": "def456", "seller_city": "ibitinga", "seller_state": "SP", "order_count": 1987, "total_sales": 198234.80 }
  ],
  "summary": { "total_sellers": 3095 },
  "metadata": { "query_time_ms": 85, "row_count": 5 }
}
```

---

## 5. analyze_trend

分析时间序列趋势，支持同比、环比计算。

### Input Schema

```typescript
{
  metric: 'sales' | 'orders' | 'customers' | 'avg_score';
  period: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  start_date: string;           // 必填，格式 YYYY-MM-DD
  end_date: string;             // 必填，格式 YYYY-MM-DD
  compare_with?: 'previous_period' | 'same_period_last_year';
  filters?: {
    category?: string;
    state?: string;
  };
}
```

### Output Schema

```typescript
{
  success: boolean;
  data: TrendDataPoint[];
  summary: {
    total: number;
    avg: number;
    max: number;
    min: number;
    overall_change_rate?: number;
  };
  metadata: {
    query_time_ms: number;
    row_count: number;
  };
}
```

### Example

**Input**:
```json
{
  "metric": "sales",
  "period": "monthly",
  "start_date": "2017-01-01",
  "end_date": "2017-12-31",
  "compare_with": "same_period_last_year"
}
```

**Output**:
```json
{
  "success": true,
  "data": [
    { "period": "2017-01", "value": 523456.78, "compare_value": 312345.67, "change_rate": 67.5 },
    { "period": "2017-02", "value": 612345.67, "compare_value": 398765.43, "change_rate": 53.6 }
  ],
  "summary": {
    "total": 8234567.89,
    "avg": 686213.99,
    "max": 1234567.89,
    "min": 423456.78,
    "overall_change_rate": 45.2
  },
  "metadata": { "query_time_ms": 150, "row_count": 12 }
}
```

---

## 6. generate_chart (扩展)

扩展现有工具，支持 line、bar、pie 图表类型。

### Input Schema (新增部分)

```typescript
{
  chart_type: 'metric' | 'table' | 'line' | 'bar' | 'pie';
  title: string;
  data: any[];
  config?: {
    // 现有配置...

    // Line/Bar 配置
    xField?: string;
    yField?: string;
    seriesField?: string;
    smooth?: boolean;           // line only
    horizontal?: boolean;       // bar only
    showLabel?: boolean;
    yAxisLabel?: string;

    // Pie 配置
    nameField?: string;
    valueField?: string;
    showPercent?: boolean;
    innerRadius?: number;
  };
}
```

### Example - Line Chart

**Input**:
```json
{
  "chart_type": "line",
  "title": "2017年月度销售趋势",
  "data": [
    { "month": "2017-01", "sales": 523456.78 },
    { "month": "2017-02", "sales": 612345.67 }
  ],
  "config": {
    "xField": "month",
    "yField": "sales",
    "smooth": true,
    "yAxisLabel": "销售额 (R$)"
  }
}
```

### Example - Bar Chart

**Input**:
```json
{
  "chart_type": "bar",
  "title": "各州销售对比",
  "data": [
    { "state": "SP", "sales": 4123456.78 },
    { "state": "RJ", "sales": 1234567.89 }
  ],
  "config": {
    "xField": "state",
    "yField": "sales",
    "horizontal": false,
    "showLabel": true
  }
}
```

### Example - Pie Chart

**Input**:
```json
{
  "chart_type": "pie",
  "title": "订单状态分布",
  "data": [
    { "status": "delivered", "count": 89941 },
    { "status": "shipped", "count": 1107 },
    { "status": "canceled", "count": 625 }
  ],
  "config": {
    "nameField": "status",
    "valueField": "count",
    "showPercent": true
  }
}
```

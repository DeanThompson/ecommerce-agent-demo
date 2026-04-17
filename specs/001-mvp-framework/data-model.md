# Data Model: E-Commerce Insight Agent MVP

**Feature**: 001-mvp-framework
**Date**: 2026-02-05

## Overview

本文档定义 MVP 阶段的数据模型，包括：
1. Olist 数据集表结构（已有）
2. 应用层实体（Session, Message, ChartConfig）

---

## 1. Olist 数据集（已有数据）

### 表关系图

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  customers  │◄────│   orders    │────►│  payments   │
└─────────────┘     └──────┬──────┘     └─────────────┘
                           │
                           ▼
                    ┌─────────────┐
                    │ order_items │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              ▼            ▼            ▼
       ┌──────────┐  ┌──────────┐  ┌──────────┐
       │ products │  │ sellers  │  │ reviews  │
       └──────────┘  └──────────┘  └──────────┘
```

### 核心表

| 表名 | 记录数 | 主键 | 说明 |
|------|--------|------|------|
| orders | ~100k | order_id | 订单主表 |
| order_items | ~110k | order_id + order_item_id | 订单明细 |
| products | ~33k | product_id | 商品信息 |
| customers | ~100k | customer_id | 客户信息 |
| sellers | ~3k | seller_id | 卖家信息 |
| order_payments | ~100k | order_id + payment_sequential | 支付信息 |
| order_reviews | ~100k | review_id | 评价信息 |
| geolocation | ~1M | zip_code_prefix | 地理位置 |
| product_category_name_translation | ~71 | product_category_name | 品类翻译 |

### 预定义视图

#### v_order_details
订单详情宽表，用于销售查询。

| 字段 | 类型 | 来源 |
|------|------|------|
| order_id | VARCHAR(32) | orders |
| order_status | VARCHAR(20) | orders |
| order_purchase_timestamp | DATETIME | orders |
| customer_city | VARCHAR(50) | customers |
| customer_state | VARCHAR(2) | customers |
| product_id | VARCHAR(32) | order_items |
| price | DECIMAL(10,2) | order_items |
| freight_value | DECIMAL(10,2) | order_items |
| product_category_name | VARCHAR(50) | products |
| category_english | VARCHAR(50) | translation |
| seller_city | VARCHAR(50) | sellers |
| seller_state | VARCHAR(2) | sellers |
| review_score | INT | reviews |

#### v_daily_sales
每日销售汇总，用于趋势分析。

| 字段 | 类型 | 说明 |
|------|------|------|
| sale_date | DATE | 销售日期 |
| order_count | INT | 订单数 |
| total_sales | DECIMAL | 销售额 |
| total_freight | DECIMAL | 运费 |
| avg_score | DECIMAL | 平均评分 |

---

## 2. 应用层实体

### Session（会话）

代表一次完整的对话上下文。

```typescript
interface Session {
  id: string;              // UUID
  messages: Message[];     // 消息列表
  createdAt: Date;         // 创建时间
  updatedAt: Date;         // 更新时间
}
```

**存储**: 内存 Map
**生命周期**: 服务重启后清空
**约束**: 无持久化

### Message（消息）

代表对话中的单条消息。

```typescript
interface Message {
  id: string;                    // UUID
  role: 'user' | 'assistant';    // 角色
  content: string;               // 文本内容
  charts?: ChartConfig[];        // 图表配置（仅 assistant）
  toolCalls?: ToolCall[];        // 工具调用记录（仅 assistant）
  timestamp: Date;               // 时间戳
}

interface ToolCall {
  tool: string;                  // 工具名称
  args: Record<string, any>;     // 调用参数
  result?: any;                  // 返回结果
  duration?: number;             // 执行耗时(ms)
}
```

**关系**: Message 属于 Session (1:N)

### ChartConfig（图表配置）

代表图表渲染所需的配置。

```typescript
interface ChartConfig {
  type: 'metric' | 'table';      // MVP 仅支持这两种
  title: string;                 // 图表标题
  data: any[];                   // 图表数据
  config?: {
    // metric 类型
    value?: number;              // 主数值
    unit?: string;               // 单位 (如 "R$")
    compareValue?: number;       // 对比值
    compareLabel?: string;       // 对比标签 (如 "vs 2016")
    trend?: 'up' | 'down';       // 趋势方向

    // table 类型
    columns?: TableColumn[];     // 列定义
  };
}

interface TableColumn {
  key: string;                   // 字段名
  title: string;                 // 显示名
  dataType?: 'string' | 'number' | 'date';
  format?: string;               // 格式化 (如 "currency", "percent")
}
```

**示例 - Metric**:
```json
{
  "type": "metric",
  "title": "2017年销售额",
  "data": [],
  "config": {
    "value": 8234567.89,
    "unit": "R$",
    "compareValue": 23.5,
    "compareLabel": "vs 2016",
    "trend": "up"
  }
}
```

**示例 - Table**:
```json
{
  "type": "table",
  "title": "2017年各月销售额",
  "data": [
    { "month": "2017-01", "sales": 523456.78, "orders": 4521 },
    { "month": "2017-02", "sales": 612345.67, "orders": 5234 }
  ],
  "config": {
    "columns": [
      { "key": "month", "title": "月份", "dataType": "string" },
      { "key": "sales", "title": "销售额", "dataType": "number", "format": "currency" },
      { "key": "orders", "title": "订单数", "dataType": "number" }
    ]
  }
}
```

---

## 3. MCP 工具输入/输出

### query_sales 输入

```typescript
interface QuerySalesInput {
  start_date: string;            // 必填，YYYY-MM-DD
  end_date: string;              // 必填，YYYY-MM-DD
  group_by?: 'day' | 'week' | 'month' | 'year' | 'category' | 'state' | 'city';
  filters?: {
    category?: string;           // 品类筛选
    state?: string;              // 州筛选
    city?: string;               // 城市筛选
  };
  metrics?: ('total_sales' | 'order_count' | 'avg_order_value' | 'total_freight')[];
  limit?: number;                // 默认 100
}
```

### query_sales 输出

```typescript
interface QuerySalesOutput {
  success: boolean;
  data: Record<string, any>[];   // 查询结果
  summary?: {
    total_sales?: number;
    total_orders?: number;
    avg_order_value?: number;
  };
  metadata?: {
    query_time_ms: number;
    row_count: number;
  };
}
```

### generate_chart 输入

```typescript
interface GenerateChartInput {
  chart_type: 'metric' | 'table';
  title: string;
  data: any[];
  config?: {
    // metric
    value?: number;
    unit?: string;
    compareValue?: number;
    compareLabel?: string;

    // table
    columns?: { key: string; title: string; format?: string }[];
  };
}
```

### generate_chart 输出

```typescript
interface GenerateChartOutput {
  success: boolean;
  chart: ChartConfig;            // 直接返回 ChartConfig
}
```

---

## 4. 数据验证规则

### Session
- `id`: 必须是有效 UUID
- `messages`: 数组，可为空
- `createdAt`, `updatedAt`: 有效日期

### Message
- `role`: 必须是 'user' 或 'assistant'
- `content`: 非空字符串
- `charts`: 仅当 role='assistant' 时有效

### ChartConfig
- `type`: 必须是 'metric' 或 'table'
- `title`: 非空字符串
- `data`: 数组

### query_sales
- `start_date`, `end_date`: 必须是 YYYY-MM-DD 格式
- `start_date` <= `end_date`
- 日期范围应在 2016-09-01 到 2018-08-31 之间

---

## 5. 索引建议

为优化查询性能，建议在 SQLite 中创建以下索引：

```sql
-- orders 表
CREATE INDEX idx_orders_purchase_timestamp ON orders(order_purchase_timestamp);
CREATE INDEX idx_orders_status ON orders(order_status);

-- order_items 表
CREATE INDEX idx_order_items_order_id ON order_items(order_id);
CREATE INDEX idx_order_items_product_id ON order_items(product_id);
CREATE INDEX idx_order_items_seller_id ON order_items(seller_id);

-- products 表
CREATE INDEX idx_products_category ON products(product_category_name);

-- customers 表
CREATE INDEX idx_customers_state ON customers(customer_state);
CREATE INDEX idx_customers_city ON customers(customer_city);
```

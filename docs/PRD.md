# E-Commerce Insight Agent - 产品需求文档 (PRD)

> 版本: 1.0.0
> 更新日期: 2026-02-05
> 状态: Draft

---

## 目录

1. [产品概述](#1-产品概述)
2. [目标与范围](#2-目标与范围)
3. [用户场景](#3-用户场景)
4. [功能需求](#4-功能需求)
5. [数据模型](#5-数据模型)
6. [技术架构](#6-技术架构)
7. [API 设计](#7-api-设计)
8. [UI/UX 设计](#8-uiux-设计)
9. [MCP 工具设计](#9-mcp-工具设计)
10. [开发计划](#10-开发计划)
11. [附录](#11-附录)

---

## 1. 产品概述

### 1.1 产品名称

**E-Commerce Insight Agent** (电商洞察助手)

### 1.2 产品定位

基于 Claude Agent SDK 构建的电商数据分析智能助手，通过自然语言对话实现数据查询、分析和可视化。

### 1.3 核心价值

- **零门槛数据分析**: 无需 SQL 或编程知识，用自然语言即可完成复杂查询
- **智能洞察**: AI 自动识别数据趋势、异常和关联
- **可视化呈现**: 自动生成图表，直观展示分析结果

### 1.4 数据来源

使用 Kaggle 公开数据集: **Brazilian E-Commerce Public Dataset by Olist**

- 来源: https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce
- 规模: 约 10 万订单，2016-2018 年真实交易数据
- 许可: CC BY-NC-SA 4.0

---

## 2. 目标与范围

### 2.1 项目目标

1. **演示 Agent 能力**: 展示 Claude Agent SDK 在数据分析场景的应用
2. **端到端实现**: 完成从数据到可视化的完整链路
3. **可扩展架构**: 便于后续添加更多分析能力

### 2.2 范围界定

#### 包含 (In Scope)

| 功能 | 说明 |
|------|------|
| 自然语言查询 | 支持中英文数据查询 |
| 多维度分析 | 销售、订单、客户、评价、卖家分析 |
| 数据可视化 | 折线图、柱状图、饼图、表格、地图 |
| 多轮对话 | 支持上下文关联的连续对话 |
| 流式响应 | 实时展示 Agent 思考和输出过程 |

#### 不包含 (Out of Scope)

| 功能 | 原因 |
|------|------|
| 用户认证 | Demo 项目，简化实现 |
| 数据写入 | 只读分析，不修改数据 |
| 多租户 | 单用户场景 |
| 大数据处理 | 数据量有限，无需分布式 |
| 实时数据 | 使用静态历史数据 |

---

## 3. 用户场景

### 3.1 场景概览

```
┌─────────────────────────────────────────────────────────────────┐
│                        用户场景地图                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  销售分析   │  │  订单分析   │  │  客户分析   │              │
│  │             │  │             │  │             │              │
│  │ • 销售趋势  │  │ • 订单状态  │  │ • 客户分布  │              │
│  │ • 品类占比  │  │ • 配送时效  │  │ • 复购分析  │              │
│  │ • 地区销售  │  │ • 取消分析  │  │ • 客单价    │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐              │
│  │  评价分析   │  │  卖家分析   │  │  综合洞察   │              │
│  │             │  │             │  │             │              │
│  │ • 评分分布  │  │ • 卖家排名  │  │ • 经营概览  │              │
│  │ • 差评分析  │  │ • 地域分布  │  │ • 异常检测  │              │
│  │ • 情感分析  │  │ • 绩效对比  │  │ • 趋势预测  │              │
│  └─────────────┘  └─────────────┘  └─────────────┘              │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 详细场景

#### 场景 1: 销售数据查询

**用户故事**: 作为运营人员，我想快速了解销售情况，以便制定运营策略。

| 对话示例 | 预期输出 |
|----------|----------|
| "2017年的总销售额是多少？" | 数字卡片 + 同比数据 |
| "按月展示2017年的销售趋势" | 折线图 |
| "销售额最高的5个品类" | 柱状图 + 表格 |
| "各州的销售分布" | 地图 + 饼图 |

#### 场景 2: 订单分析

**用户故事**: 作为物流负责人，我想了解订单配送情况，以便优化物流效率。

| 对话示例 | 预期输出 |
|----------|----------|
| "平均配送时间是多少天？" | 数字卡片 |
| "配送超时的订单有多少？" | 数字 + 占比 |
| "各州的平均配送时间对比" | 柱状图 |
| "订单状态分布" | 饼图 |

#### 场景 3: 客户分析

**用户故事**: 作为市场人员，我想了解客户特征，以便精准营销。

| 对话示例 | 预期输出 |
|----------|----------|
| "客户主要分布在哪些城市？" | 地图 + TOP10 表格 |
| "客单价的分布情况" | 直方图 |
| "有多少客户进行了复购？" | 数字 + 占比 |
| "高价值客户的特征是什么？" | 分析报告 |

#### 场景 4: 评价分析

**用户故事**: 作为品控人员，我想了解客户反馈，以便改进产品和服务。

| 对话示例 | 预期输出 |
|----------|----------|
| "平均评分是多少？" | 数字卡片 |
| "评分分布情况" | 柱状图 |
| "差评主要集中在哪些品类？" | 表格 + 分析 |
| "分析差评的主要原因" | 关键词云 + 摘要 |

#### 场景 5: 卖家分析

**用户故事**: 作为平台运营，我想了解卖家表现，以便优化平台生态。

| 对话示例 | 预期输出 |
|----------|----------|
| "销量最高的10个卖家" | 表格 |
| "卖家的地域分布" | 地图 |
| "评分最低的卖家有哪些？" | 表格 + 预警 |
| "对比头部卖家和尾部卖家的差异" | 对比分析 |

#### 场景 6: 多轮对话

**用户故事**: 作为分析师，我想通过连续对话深入分析问题。

```
用户: 2017年销售额最高的品类是什么？
Agent: 2017年销售额最高的品类是 "bed_bath_table"（床上用品），
       销售额为 R$ 1,234,567。[显示柱状图]

用户: 这个品类的月度趋势怎么样？
Agent: bed_bath_table 品类2017年月度销售趋势如下：
       [显示折线图]
       可以看到 11-12 月有明显增长，可能与节日促销有关。

用户: 和去年同期对比呢？
Agent: 2017 vs 2016 年 bed_bath_table 品类对比：
       [显示对比柱状图]
       2017年同比增长 45.2%，增长主要来自 Q4。
```

---

## 4. 功能需求

### 4.1 功能列表

| 模块 | 功能 | 优先级 | 描述 |
|------|------|--------|------|
| **对话交互** | 自然语言输入 | P0 | 支持中英文自然语言查询 |
| | 流式响应 | P0 | 实时展示 Agent 输出 |
| | 多轮对话 | P0 | 保持上下文，支持追问 |
| | 对话历史 | P1 | 展示历史对话记录 |
| **数据查询** | 销售查询 | P0 | 按时间、品类、地区查询销售数据 |
| | 订单查询 | P0 | 查询订单状态、配送信息 |
| | 客户查询 | P0 | 查询客户分布、行为数据 |
| | 评价查询 | P1 | 查询评分、评论内容 |
| | 卖家查询 | P1 | 查询卖家信息和绩效 |
| **数据分析** | 趋势分析 | P0 | 时间序列趋势分析 |
| | 对比分析 | P0 | 同比、环比、分组对比 |
| | 排名分析 | P0 | TOP N 排名 |
| | 分布分析 | P1 | 数据分布统计 |
| | 异常检测 | P2 | 识别异常数据点 |
| **数据可视化** | 折线图 | P0 | 趋势展示 |
| | 柱状图 | P0 | 对比展示 |
| | 饼图 | P0 | 占比展示 |
| | 数据表格 | P0 | 明细数据 |
| | 数字卡片 | P0 | 关键指标 |
| | 地图 | P2 | 地理分布 |

### 4.2 功能详细说明

#### 4.2.1 对话交互

**自然语言输入**
- 支持中文和英文输入
- 支持模糊查询（如"最近"、"上个月"）
- 自动识别查询意图和实体

**流式响应**
- 使用 SSE (Server-Sent Events) 实现
- 分段展示：思考过程 → 工具调用 → 结果输出
- 支持中断当前响应

**多轮对话**
- 自动关联上下文（如"这个品类"指代上一轮提到的品类）
- 支持追问和深入分析
- 会话超时自动清理（30分钟）

#### 4.2.2 数据查询

**通用查询能力**
- 时间范围筛选（支持自然语言如"去年"、"最近30天"）
- 多维度筛选（品类、地区、状态等）
- 聚合统计（SUM、AVG、COUNT、MAX、MIN）
- 分组查询（GROUP BY）
- 排序和限制（ORDER BY、LIMIT）

**查询示例映射**

| 自然语言 | 转换后的查询意图 |
|----------|------------------|
| "2017年销售额" | 时间=2017, 指标=销售额, 聚合=SUM |
| "各品类销售占比" | 分组=品类, 指标=销售额, 聚合=SUM |
| "SP州的订单数" | 筛选=州=SP, 指标=订单数, 聚合=COUNT |
| "评分低于3的订单" | 筛选=评分<3, 返回=订单列表 |

#### 4.2.3 数据可视化

**图表类型选择逻辑**

| 数据特征 | 推荐图表 |
|----------|----------|
| 单一数值 | 数字卡片 (Metric) |
| 时间序列 | 折线图 (Line) |
| 分类对比 | 柱状图 (Bar) |
| 占比分布 | 饼图 (Pie) |
| 明细数据 | 表格 (Table) |
| 地理分布 | 地图 (Map) |

**图表配置**
```typescript
interface ChartConfig {
  type: 'line' | 'bar' | 'pie' | 'table' | 'metric' | 'map';
  title: string;
  data: any[];
  xField?: string;      // X轴字段
  yField?: string;      // Y轴字段
  seriesField?: string; // 系列字段（多线/多柱）
  colorField?: string;  // 颜色映射字段
}
```

---

## 5. 数据模型

### 5.1 数据源概览

**Olist 数据集包含 9 张表：**

```
┌─────────────────────────────────────────────────────────────────────┐
│                         数据关系图                                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌───────────────┐                      ┌───────────────┐           │
│  │   sellers     │                      │   products    │           │
│  │   (卖家)      │                      │   (商品)      │           │
│  │               │                      │               │           │
│  │ • seller_id   │                      │ • product_id  │           │
│  │ • city        │                      │ • category    │           │
│  │ • state       │                      │ • weight      │           │
│  └───────┬───────┘                      └───────┬───────┘           │
│          │                                      │                    │
│          │         ┌───────────────┐            │                    │
│          └────────►│  order_items  │◄───────────┘                    │
│                    │  (订单明细)    │                                 │
│                    │               │                                 │
│                    │ • order_id    │                                 │
│                    │ • product_id  │                                 │
│                    │ • seller_id   │                                 │
│                    │ • price       │                                 │
│                    │ • freight     │                                 │
│                    └───────┬───────┘                                 │
│                            │                                         │
│                            ▼                                         │
│  ┌───────────────┐  ┌───────────────┐  ┌───────────────┐            │
│  │   customers   │  │    orders     │  │   payments    │            │
│  │   (客户)      │◄─│   (订单)      │─►│   (支付)      │            │
│  │               │  │               │  │               │            │
│  │ • customer_id │  │ • order_id    │  │ • order_id    │            │
│  │ • city        │  │ • customer_id │  │ • payment_type│            │
│  │ • state       │  │ • status      │  │ • value       │            │
│  │ • zip_code    │  │ • timestamps  │  │ • installments│            │
│  └───────────────┘  └───────┬───────┘  └───────────────┘            │
│                             │                                        │
│                             ▼                                        │
│                    ┌───────────────┐                                 │
│                    │    reviews    │                                 │
│                    │   (评价)      │                                 │
│                    │               │                                 │
│                    │ • order_id    │                                 │
│                    │ • score       │                                 │
│                    │ • comment     │                                 │
│                    └───────────────┘                                 │
│                                                                      │
│  ┌───────────────┐  ┌───────────────────────┐                       │
│  │  geolocation  │  │  category_translation │                       │
│  │  (地理位置)    │  │  (品类翻译)            │                       │
│  └───────────────┘  └───────────────────────┘                       │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 5.2 表结构详情

#### orders (订单主表)

| 字段 | 类型 | 说明 |
|------|------|------|
| order_id | VARCHAR(32) | 订单ID (PK) |
| customer_id | VARCHAR(32) | 客户ID (FK) |
| order_status | VARCHAR(20) | 订单状态 |
| order_purchase_timestamp | DATETIME | 下单时间 |
| order_approved_at | DATETIME | 审核通过时间 |
| order_delivered_carrier_date | DATETIME | 发货时间 |
| order_delivered_customer_date | DATETIME | 送达时间 |
| order_estimated_delivery_date | DATETIME | 预计送达时间 |

**order_status 枚举值:**
- `delivered` - 已送达
- `shipped` - 已发货
- `canceled` - 已取消
- `unavailable` - 不可用
- `invoiced` - 已开票
- `processing` - 处理中
- `created` - 已创建
- `approved` - 已审核

#### order_items (订单明细)

| 字段 | 类型 | 说明 |
|------|------|------|
| order_id | VARCHAR(32) | 订单ID (FK) |
| order_item_id | INT | 订单内商品序号 |
| product_id | VARCHAR(32) | 商品ID (FK) |
| seller_id | VARCHAR(32) | 卖家ID (FK) |
| shipping_limit_date | DATETIME | 发货截止时间 |
| price | DECIMAL(10,2) | 商品价格 |
| freight_value | DECIMAL(10,2) | 运费 |

#### products (商品)

| 字段 | 类型 | 说明 |
|------|------|------|
| product_id | VARCHAR(32) | 商品ID (PK) |
| product_category_name | VARCHAR(50) | 品类名称(葡语) |
| product_name_length | INT | 商品名长度 |
| product_description_length | INT | 描述长度 |
| product_photos_qty | INT | 图片数量 |
| product_weight_g | INT | 重量(克) |
| product_length_cm | INT | 长度(厘米) |
| product_height_cm | INT | 高度(厘米) |
| product_width_cm | INT | 宽度(厘米) |

#### customers (客户)

| 字段 | 类型 | 说明 |
|------|------|------|
| customer_id | VARCHAR(32) | 客户ID (PK) |
| customer_unique_id | VARCHAR(32) | 客户唯一标识 |
| customer_zip_code_prefix | VARCHAR(5) | 邮编前缀 |
| customer_city | VARCHAR(50) | 城市 |
| customer_state | VARCHAR(2) | 州 |

#### sellers (卖家)

| 字段 | 类型 | 说明 |
|------|------|------|
| seller_id | VARCHAR(32) | 卖家ID (PK) |
| seller_zip_code_prefix | VARCHAR(5) | 邮编前缀 |
| seller_city | VARCHAR(50) | 城市 |
| seller_state | VARCHAR(2) | 州 |

#### order_payments (支付)

| 字段 | 类型 | 说明 |
|------|------|------|
| order_id | VARCHAR(32) | 订单ID (FK) |
| payment_sequential | INT | 支付序号 |
| payment_type | VARCHAR(20) | 支付方式 |
| payment_installments | INT | 分期数 |
| payment_value | DECIMAL(10,2) | 支付金额 |

**payment_type 枚举值:**
- `credit_card` - 信用卡
- `boleto` - 银行票据
- `voucher` - 代金券
- `debit_card` - 借记卡

#### order_reviews (评价)

| 字段 | 类型 | 说明 |
|------|------|------|
| review_id | VARCHAR(32) | 评价ID (PK) |
| order_id | VARCHAR(32) | 订单ID (FK) |
| review_score | INT | 评分 (1-5) |
| review_comment_title | TEXT | 评价标题 |
| review_comment_message | TEXT | 评价内容 |
| review_creation_date | DATETIME | 创建时间 |
| review_answer_timestamp | DATETIME | 回复时间 |

#### geolocation (地理位置)

| 字段 | 类型 | 说明 |
|------|------|------|
| geolocation_zip_code_prefix | VARCHAR(5) | 邮编前缀 |
| geolocation_lat | DECIMAL(10,6) | 纬度 |
| geolocation_lng | DECIMAL(10,6) | 经度 |
| geolocation_city | VARCHAR(50) | 城市 |
| geolocation_state | VARCHAR(2) | 州 |

#### product_category_name_translation (品类翻译)

| 字段 | 类型 | 说明 |
|------|------|------|
| product_category_name | VARCHAR(50) | 葡语品类名 |
| product_category_name_english | VARCHAR(50) | 英语品类名 |

### 5.3 常用查询视图

为简化查询，预定义以下视图：

#### v_order_details (订单详情视图)

```sql
CREATE VIEW v_order_details AS
SELECT
  o.order_id,
  o.order_status,
  o.order_purchase_timestamp,
  o.order_delivered_customer_date,
  o.order_estimated_delivery_date,
  c.customer_city,
  c.customer_state,
  oi.product_id,
  oi.price,
  oi.freight_value,
  p.product_category_name,
  t.product_category_name_english as category_english,
  s.seller_city,
  s.seller_state,
  r.review_score
FROM orders o
LEFT JOIN customers c ON o.customer_id = c.customer_id
LEFT JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN products p ON oi.product_id = p.product_id
LEFT JOIN product_category_name_translation t
  ON p.product_category_name = t.product_category_name
LEFT JOIN sellers s ON oi.seller_id = s.seller_id
LEFT JOIN order_reviews r ON o.order_id = r.order_id;
```

#### v_daily_sales (每日销售汇总)

```sql
CREATE VIEW v_daily_sales AS
SELECT
  DATE(o.order_purchase_timestamp) as sale_date,
  COUNT(DISTINCT o.order_id) as order_count,
  SUM(oi.price) as total_sales,
  SUM(oi.freight_value) as total_freight,
  AVG(r.review_score) as avg_score
FROM orders o
JOIN order_items oi ON o.order_id = oi.order_id
LEFT JOIN order_reviews r ON o.order_id = r.order_id
WHERE o.order_status = 'delivered'
GROUP BY DATE(o.order_purchase_timestamp);
```

---

## 6. 技术架构

### 6.1 整体架构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              系统架构图                                  │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                        Frontend (React)                          │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │    │
│  │  │  ChatPanel  │  │ ChartViewer │  │     SessionManager      │  │    │
│  │  │  (对话面板)  │  │  (图表展示)  │  │      (会话管理)         │  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────────────────┘  │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │ SSE / HTTP                                 │
│                             ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     Backend (Node.js)                            │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐  │    │
│  │  │   Express   │  │   Session   │  │    Claude Agent SDK     │  │    │
│  │  │   Router    │  │    Store    │  │                         │  │    │
│  │  └─────────────┘  └─────────────┘  └───────────┬─────────────┘  │    │
│  └────────────────────────────────────────────────┼────────────────┘    │
│                                                   │ MCP Protocol        │
│                                                   ▼                     │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      MCP Tool Server                             │    │
│  │  ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────────┐   │    │
│  │  │  query_   │ │  query_   │ │  analyze_ │ │   generate_   │   │    │
│  │  │  sales    │ │  orders   │ │  trend    │ │    chart      │   │    │
│  │  └───────────┘ └───────────┘ └───────────┘ └───────────────┘   │    │
│  └──────────────────────────┬──────────────────────────────────────┘    │
│                             │ SQL                                        │
│                             ▼                                            │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                      SQLite Database                             │    │
│  │                    (Olist E-Commerce Data)                       │    │
│  └─────────────────────────────────────────────────────────────────┘    │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 6.2 技术选型

| 层级 | 技术 | 版本 | 说明 |
|------|------|------|------|
| **前端框架** | React | 18.x | 组件化开发 |
| **UI 组件库** | Ant Design | 5.x | 企业级 UI |
| **图表库** | ECharts | 5.x | 丰富的图表类型 |
| **状态管理** | Zustand | 4.x | 轻量级状态管理 |
| **后端框架** | Express | 4.x | Node.js Web 框架 |
| **Agent SDK** | Claude Agent SDK | latest | Anthropic 官方 SDK |
| **数据库** | SQLite | 3.x | 轻量级嵌入式数据库 |
| **ORM** | better-sqlite3 | 9.x | 同步 SQLite 驱动 |
| **构建工具** | Vite | 5.x | 快速开发构建 |
| **语言** | TypeScript | 5.x | 类型安全 |

### 6.3 项目结构

```
ecommerce-agent/
├── frontend/                          # 前端项目
│   ├── src/
│   │   ├── components/
│   │   │   ├── ChatPanel/             # 对话面板
│   │   │   │   ├── index.tsx
│   │   │   │   ├── MessageList.tsx    # 消息列表
│   │   │   │   ├── MessageItem.tsx    # 单条消息
│   │   │   │   ├── InputArea.tsx      # 输入区域
│   │   │   │   └── styles.css
│   │   │   ├── Charts/                # 图表组件
│   │   │   │   ├── index.tsx
│   │   │   │   ├── LineChart.tsx
│   │   │   │   ├── BarChart.tsx
│   │   │   │   ├── PieChart.tsx
│   │   │   │   ├── DataTable.tsx
│   │   │   │   └── MetricCard.tsx
│   │   │   └── Layout/                # 布局组件
│   │   │       ├── Header.tsx
│   │   │       └── Sidebar.tsx
│   │   ├── hooks/
│   │   │   ├── useChat.ts             # 对话 Hook
│   │   │   └── useSSE.ts              # SSE 连接 Hook
│   │   ├── stores/
│   │   │   └── chatStore.ts           # 对话状态
│   │   ├── types/
│   │   │   └── index.ts               # 类型定义
│   │   ├── utils/
│   │   │   └── chartUtils.ts          # 图表工具函数
│   │   ├── App.tsx
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── backend/                           # 后端项目
│   ├── src/
│   │   ├── agent/
│   │   │   ├── index.ts               # Agent 配置
│   │   │   └── systemPrompt.ts        # 系统提示词
│   │   ├── mcp/
│   │   │   ├── server.ts              # MCP 服务器
│   │   │   └── tools/
│   │   │       ├── index.ts           # 工具注册
│   │   │       ├── querySales.ts      # 销售查询
│   │   │       ├── queryOrders.ts     # 订单查询
│   │   │       ├── queryCustomers.ts  # 客户查询
│   │   │       ├── queryReviews.ts    # 评价查询
│   │   │       ├── querySellers.ts    # 卖家查询
│   │   │       ├── analyzeTrend.ts    # 趋势分析
│   │   │       └── generateChart.ts   # 图表生成
│   │   ├── db/
│   │   │   ├── index.ts               # 数据库连接
│   │   │   └── queries.ts             # 预定义查询
│   │   ├── routes/
│   │   │   ├── chat.ts                # 对话路由
│   │   │   └── health.ts              # 健康检查
│   │   ├── types/
│   │   │   └── index.ts
│   │   └── index.ts                   # 入口文件
│   ├── package.json
│   └── tsconfig.json
│
├── data/
│   ├── raw/                           # 原始 CSV 文件
│   │   ├── olist_orders_dataset.csv
│   │   ├── olist_order_items_dataset.csv
│   │   ├── olist_products_dataset.csv
│   │   ├── olist_customers_dataset.csv
│   │   ├── olist_sellers_dataset.csv
│   │   ├── olist_order_payments_dataset.csv
│   │   ├── olist_order_reviews_dataset.csv
│   │   ├── olist_geolocation_dataset.csv
│   │   └── product_category_name_translation.csv
│   ├── ecommerce.db                   # SQLite 数据库
│   └── scripts/
│       └── import.ts                  # 数据导入脚本
│
├── docs/
│   └── PRD.md                         # 本文档
│
├── package.json                       # 根目录 package.json
├── pnpm-workspace.yaml                # pnpm workspace 配置
└── README.md
```

### 6.4 数据流

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              数据流图                                    │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  1. 用户输入                                                             │
│  ┌─────────┐                                                            │
│  │  User   │ ──"2017年销售额是多少？"──►                                 │
│  └─────────┘                                                            │
│                                                                          │
│  2. 前端发送请求                                                         │
│  ┌─────────┐     POST /api/chat                    ┌─────────┐         │
│  │ Frontend│ ─────────────────────────────────────►│ Backend │         │
│  └─────────┘     { message, sessionId }            └─────────┘         │
│                                                                          │
│  3. Agent 处理                                                           │
│  ┌─────────┐     调用 Claude API                   ┌─────────┐         │
│  │ Backend │ ─────────────────────────────────────►│  Claude │         │
│  └─────────┘     { messages, tools }               └─────────┘         │
│                                                                          │
│  4. 工具调用                                                             │
│  ┌─────────┐     MCP: query_sales                  ┌─────────┐         │
│  │  Claude │ ─────────────────────────────────────►│MCP Tools│         │
│  └─────────┘     { year: 2017 }                    └─────────┘         │
│                                                                          │
│  5. 数据库查询                                                           │
│  ┌─────────┐     SQL Query                         ┌─────────┐         │
│  │MCP Tools│ ─────────────────────────────────────►│ SQLite  │         │
│  └─────────┘                                       └─────────┘         │
│                                                                          │
│  6. 返回结果                                                             │
│  ┌─────────┐     { total: 8234567.89 }             ┌─────────┐         │
│  │ SQLite  │ ─────────────────────────────────────►│MCP Tools│         │
│  └─────────┘                                       └─────────┘         │
│                                                                          │
│  7. 生成图表配置                                                         │
│  ┌─────────┐     generate_chart                    ┌─────────┐         │
│  │  Claude │ ─────────────────────────────────────►│MCP Tools│         │
│  └─────────┘     { type: 'metric', ... }           └─────────┘         │
│                                                                          │
│  8. 流式响应                                                             │
│  ┌─────────┐     SSE: text + chart                 ┌─────────┐         │
│  │ Backend │ ─────────────────────────────────────►│ Frontend│         │
│  └─────────┘                                       └─────────┘         │
│                                                                          │
│  9. 渲染展示                                                             │
│  ┌─────────┐     显示文字 + 图表                    ┌─────────┐         │
│  │ Frontend│ ─────────────────────────────────────►│  User   │         │
│  └─────────┘                                       └─────────┘         │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 7. API 设计

### 7.1 HTTP API

#### POST /api/chat

发送对话消息并获取流式响应。

**请求:**
```typescript
interface ChatRequest {
  message: string;      // 用户消息
  sessionId?: string;   // 会话ID（可选，不传则创建新会话）
}
```

**响应 (SSE):**
```typescript
// 事件类型
type SSEEventType =
  | 'thinking'    // Agent 思考中
  | 'tool_call'   // 工具调用
  | 'tool_result' // 工具结果
  | 'text'        // 文本输出
  | 'chart'       // 图表数据
  | 'done'        // 完成
  | 'error';      // 错误

interface SSEEvent {
  type: SSEEventType;
  data: any;
}

// 示例事件流
// event: thinking
// data: {"content": "正在分析您的问题..."}

// event: tool_call
// data: {"tool": "query_sales", "args": {"year": 2017}}

// event: tool_result
// data: {"tool": "query_sales", "result": {"total": 8234567.89}}

// event: text
// data: {"content": "2017年的总销售额为"}

// event: chart
// data: {"type": "metric", "title": "2017年销售额", "value": 8234567.89, "unit": "R$"}

// event: done
// data: {"sessionId": "abc123"}
```

#### GET /api/sessions/:sessionId

获取会话历史。

**响应:**
```typescript
interface SessionResponse {
  sessionId: string;
  messages: Message[];
  createdAt: string;
  updatedAt: string;
}

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  charts?: ChartConfig[];
  timestamp: string;
}
```

#### DELETE /api/sessions/:sessionId

删除会话。

#### GET /api/health

健康检查。

**响应:**
```json
{
  "status": "ok",
  "version": "1.0.0",
  "database": "connected"
}
```

### 7.2 SSE 消息格式

```typescript
// 完整的 SSE 消息类型定义
interface ThinkingEvent {
  type: 'thinking';
  data: {
    content: string;
  };
}

interface ToolCallEvent {
  type: 'tool_call';
  data: {
    tool: string;
    args: Record<string, any>;
  };
}

interface ToolResultEvent {
  type: 'tool_result';
  data: {
    tool: string;
    result: any;
    duration: number; // 执行耗时(ms)
  };
}

interface TextEvent {
  type: 'text';
  data: {
    content: string;
    isPartial?: boolean; // 是否为部分内容
  };
}

interface ChartEvent {
  type: 'chart';
  data: ChartConfig;
}

interface DoneEvent {
  type: 'done';
  data: {
    sessionId: string;
    totalDuration: number;
  };
}

interface ErrorEvent {
  type: 'error';
  data: {
    code: string;
    message: string;
  };
}
```

---

## 8. UI/UX 设计

### 8.1 页面布局

```
┌─────────────────────────────────────────────────────────────────────────┐
│  E-Commerce Insight Agent                              [新对话] [历史]   │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ 👤 2017年的销售额是多少？                                    │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ 🤖 正在查询销售数据...                                       │  │  │
│  │  │                                                              │  │  │
│  │  │    2017年的总销售额为 R$ 8,234,567.89                        │  │  │
│  │  │                                                              │  │  │
│  │  │    ┌─────────────────────────────────────────────────────┐  │  │  │
│  │  │    │                                                      │  │  │  │
│  │  │    │              R$ 8,234,567.89                         │  │  │  │
│  │  │    │              2017年销售额                             │  │  │  │
│  │  │    │              ↑ 23.5% vs 2016                         │  │  │  │
│  │  │    │                                                      │  │  │  │
│  │  │    └─────────────────────────────────────────────────────┘  │  │  │
│  │  │                                                              │  │  │
│  │  │    相比2016年增长了23.5%，主要增长来自Q4季度。               │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ 👤 按月展示销售趋势                                          │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  │  ┌─────────────────────────────────────────────────────────────┐  │  │
│  │  │ 🤖 以下是2017年各月销售趋势：                                │  │  │
│  │  │                                                              │  │  │
│  │  │    ┌─────────────────────────────────────────────────────┐  │  │  │
│  │  │    │     📈 2017年月度销售趋势                            │  │  │  │
│  │  │    │                                              ╱──    │  │  │  │
│  │  │    │                                         ╱───╱       │  │  │  │
│  │  │    │                                    ╱───╱            │  │  │  │
│  │  │    │     ───────────────────────────────                 │  │  │  │
│  │  │    │     1  2  3  4  5  6  7  8  9  10 11 12              │  │  │  │
│  │  │    └─────────────────────────────────────────────────────┘  │  │  │
│  │  │                                                              │  │  │
│  │  │    可以看到11-12月销售额明显上升，与年末促销季相关。          │  │  │
│  │  └─────────────────────────────────────────────────────────────┘  │  │
│  │                                                                    │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
│  ┌───────────────────────────────────────────────────────────────────┐  │
│  │  💬 输入您的问题...                                      [发送]   │  │
│  └───────────────────────────────────────────────────────────────────┘  │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 8.2 组件设计

#### 消息气泡

```typescript
interface MessageBubbleProps {
  role: 'user' | 'assistant';
  content: string;
  charts?: ChartConfig[];
  isLoading?: boolean;
  timestamp?: string;
}
```

**用户消息样式:**
- 右对齐
- 蓝色背景
- 白色文字

**助手消息样式:**
- 左对齐
- 灰色背景
- 黑色文字
- 可包含图表

#### 图表组件

**数字卡片 (MetricCard)**
```
┌─────────────────────────┐
│                         │
│    R$ 8,234,567.89      │  <- 主数值（大字体）
│    2017年销售额          │  <- 标题
│    ↑ 23.5% vs 2016      │  <- 对比（绿色/红色）
│                         │
└─────────────────────────┘
```

**折线图 (LineChart)**
- 支持多系列
- 支持缩放
- 悬停显示数值

**柱状图 (BarChart)**
- 支持横向/纵向
- 支持堆叠
- 支持分组

**饼图 (PieChart)**
- 显示百分比
- 支持图例
- 支持点击高亮

**数据表格 (DataTable)**
- 支持排序
- 支持分页
- 支持导出

### 8.3 交互设计

#### 输入交互
- Enter 发送消息
- Shift+Enter 换行
- 发送后自动清空输入框
- 发送中禁用输入

#### 加载状态
- 显示"正在思考..."动画
- 显示工具调用过程
- 流式显示文字

#### 错误处理
- 网络错误提示重试
- 超时提示
- 友好的错误信息

### 8.4 响应式设计

| 断点 | 布局调整 |
|------|----------|
| >= 1200px | 完整布局 |
| 768-1199px | 隐藏侧边栏 |
| < 768px | 移动端布局，全屏对话 |

---

## 9. MCP 工具设计

### 9.1 工具列表

| 工具名 | 功能 | 优先级 |
|--------|------|--------|
| `query_sales` | 查询销售数据 | P0 |
| `query_orders` | 查询订单数据 | P0 |
| `query_customers` | 查询客户数据 | P0 |
| `query_products` | 查询商品数据 | P1 |
| `query_reviews` | 查询评价数据 | P1 |
| `query_sellers` | 查询卖家数据 | P1 |
| `analyze_trend` | 趋势分析 | P0 |
| `analyze_compare` | 对比分析 | P1 |
| `generate_chart` | 生成图表配置 | P0 |

### 9.2 工具详细定义

#### query_sales

```typescript
{
  name: "query_sales",
  description: "查询销售数据，支持按时间、品类、地区等维度筛选和聚合",
  inputSchema: {
    type: "object",
    properties: {
      start_date: {
        type: "string",
        description: "开始日期，格式 YYYY-MM-DD"
      },
      end_date: {
        type: "string",
        description: "结束日期，格式 YYYY-MM-DD"
      },
      group_by: {
        type: "string",
        enum: ["day", "week", "month", "year", "category", "state", "city"],
        description: "分组维度"
      },
      filters: {
        type: "object",
        properties: {
          category: { type: "string", description: "品类筛选" },
          state: { type: "string", description: "州筛选" },
          city: { type: "string", description: "城市筛选" }
        }
      },
      metrics: {
        type: "array",
        items: {
          type: "string",
          enum: ["total_sales", "order_count", "avg_order_value", "total_freight"]
        },
        description: "需要返回的指标"
      },
      limit: {
        type: "integer",
        description: "返回记录数限制",
        default: 100
      }
    },
    required: ["start_date", "end_date"]
  }
}
```

**返回示例:**
```json
{
  "success": true,
  "data": [
    { "month": "2017-01", "total_sales": 523456.78, "order_count": 4521 },
    { "month": "2017-02", "total_sales": 612345.67, "order_count": 5234 }
  ],
  "summary": {
    "total_sales": 8234567.89,
    "total_orders": 65432,
    "avg_order_value": 125.89
  }
}
```

#### query_orders

```typescript
{
  name: "query_orders",
  description: "查询订单数据，支持按状态、时间、配送情况筛选",
  inputSchema: {
    type: "object",
    properties: {
      start_date: { type: "string" },
      end_date: { type: "string" },
      status: {
        type: "string",
        enum: ["delivered", "shipped", "canceled", "processing", "all"]
      },
      delivery_analysis: {
        type: "boolean",
        description: "是否包含配送时效分析"
      },
      group_by: {
        type: "string",
        enum: ["day", "week", "month", "status", "state"]
      }
    },
    required: ["start_date", "end_date"]
  }
}
```

#### query_customers

```typescript
{
  name: "query_customers",
  description: "查询客户数据，支持地域分布、复购分析",
  inputSchema: {
    type: "object",
    properties: {
      analysis_type: {
        type: "string",
        enum: ["distribution", "repurchase", "value_segment"],
        description: "分析类型"
      },
      group_by: {
        type: "string",
        enum: ["state", "city"]
      },
      limit: { type: "integer" }
    },
    required: ["analysis_type"]
  }
}
```

#### query_reviews

```typescript
{
  name: "query_reviews",
  description: "查询评价数据，支持评分分布、差评分析",
  inputSchema: {
    type: "object",
    properties: {
      score_filter: {
        type: "object",
        properties: {
          min: { type: "integer", minimum: 1, maximum: 5 },
          max: { type: "integer", minimum: 1, maximum: 5 }
        }
      },
      group_by: {
        type: "string",
        enum: ["score", "category", "month"]
      },
      include_comments: {
        type: "boolean",
        description: "是否包含评论内容"
      },
      limit: { type: "integer" }
    }
  }
}
```

#### analyze_trend

```typescript
{
  name: "analyze_trend",
  description: "分析时间序列趋势，支持同比、环比计算",
  inputSchema: {
    type: "object",
    properties: {
      metric: {
        type: "string",
        enum: ["sales", "orders", "customers", "avg_score"],
        description: "分析指标"
      },
      period: {
        type: "string",
        enum: ["daily", "weekly", "monthly", "quarterly"],
        description: "时间粒度"
      },
      start_date: { type: "string" },
      end_date: { type: "string" },
      compare_with: {
        type: "string",
        enum: ["previous_period", "same_period_last_year"],
        description: "对比方式"
      }
    },
    required: ["metric", "period", "start_date", "end_date"]
  }
}
```

#### generate_chart

```typescript
{
  name: "generate_chart",
  description: "根据数据生成图表配置，前端将根据此配置渲染图表",
  inputSchema: {
    type: "object",
    properties: {
      chart_type: {
        type: "string",
        enum: ["line", "bar", "pie", "table", "metric"],
        description: "图表类型"
      },
      title: {
        type: "string",
        description: "图表标题"
      },
      data: {
        type: "array",
        description: "图表数据"
      },
      config: {
        type: "object",
        properties: {
          xField: { type: "string" },
          yField: { type: "string" },
          seriesField: { type: "string" },
          unit: { type: "string" },
          compareValue: { type: "number" },
          compareLabel: { type: "string" }
        }
      }
    },
    required: ["chart_type", "title", "data"]
  }
}
```

### 9.3 Agent System Prompt

```markdown
你是一个电商数据分析助手，帮助用户分析 Olist 电商平台的销售数据。

## 数据说明
- 数据来源：巴西电商平台 Olist
- 时间范围：2016年9月 - 2018年8月
- 数据规模：约10万订单
- 货币单位：巴西雷亚尔 (R$)

## 可用工具
1. query_sales - 查询销售数据
2. query_orders - 查询订单数据
3. query_customers - 查询客户数据
4. query_reviews - 查询评价数据
5. query_sellers - 查询卖家数据
6. analyze_trend - 趋势分析
7. generate_chart - 生成图表

## 回答规范
1. 先理解用户意图，选择合适的工具
2. 查询数据后，用简洁的语言总结关键发现
3. 适时生成图表辅助展示
4. 主动提供洞察和建议
5. 如果用户问题模糊，先确认再查询

## 图表使用建议
- 单一数值：使用 metric 类型
- 时间趋势：使用 line 类型
- 分类对比：使用 bar 类型
- 占比分布：使用 pie 类型
- 明细数据：使用 table 类型

## 注意事项
- 金额单位为巴西雷亚尔 (R$)
- 品类名称原始为葡萄牙语，已翻译为英语
- 地理位置为巴西各州
```

---

## 10. 开发计划

### 10.1 里程碑

| 阶段 | 名称 | 目标 | 预计工作量 |
|------|------|------|------------|
| M1 | 基础框架 | 搭建项目骨架，完成数据导入 | - |
| M2 | 核心功能 | 实现基础对话和查询 | - |
| M3 | 可视化 | 完成图表组件和展示 | - |
| M4 | 优化完善 | 优化体验，修复问题 | - |

### 10.2 详细任务

#### M1: 基础框架

- [ ] 初始化 monorepo 项目结构
- [ ] 配置 TypeScript、ESLint、Prettier
- [ ] 搭建前端 React + Vite 项目
- [ ] 搭建后端 Express 项目
- [ ] 下载 Olist 数据集
- [ ] 编写数据导入脚本
- [ ] 创建 SQLite 数据库和表
- [ ] 导入数据并验证

#### M2: 核心功能

- [ ] 实现 MCP 工具服务器
- [ ] 实现 query_sales 工具
- [ ] 实现 query_orders 工具
- [ ] 实现 query_customers 工具
- [ ] 配置 Claude Agent SDK
- [ ] 实现 /api/chat 接口
- [ ] 实现 SSE 流式响应
- [ ] 前端对话组件开发
- [ ] 前端 SSE 连接处理
- [ ] 端到端联调测试

#### M3: 可视化

- [ ] 实现 generate_chart 工具
- [ ] 开发 MetricCard 组件
- [ ] 开发 LineChart 组件
- [ ] 开发 BarChart 组件
- [ ] 开发 PieChart 组件
- [ ] 开发 DataTable 组件
- [ ] 图表与对话集成
- [ ] 实现 query_reviews 工具
- [ ] 实现 query_sellers 工具
- [ ] 实现 analyze_trend 工具

#### M4: 优化完善

- [ ] 会话管理功能
- [ ] 对话历史展示
- [ ] 错误处理优化
- [ ] 加载状态优化
- [ ] 响应式布局适配
- [ ] 性能优化
- [ ] 文档完善
- [ ] 部署配置

### 10.3 技术风险

| 风险 | 影响 | 缓解措施 |
|------|------|----------|
| Claude Agent SDK 兼容性 | 高 | 提前验证 SDK 功能，准备降级方案 |
| 数据量导致查询慢 | 中 | 建立索引，优化 SQL |
| SSE 连接不稳定 | 中 | 实现重连机制 |
| 图表渲染性能 | 低 | 数据量限制，懒加载 |

---

## 11. 附录

### 11.1 参考资料

- [Claude Agent SDK 文档](https://docs.anthropic.com/claude/docs/agent-sdk)
- [Olist 数据集](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)
- [MCP 协议规范](https://modelcontextprotocol.io/)
- [ECharts 文档](https://echarts.apache.org/)
- [Ant Design 文档](https://ant.design/)

### 11.2 术语表

| 术语 | 说明 |
|------|------|
| MCP | Model Context Protocol，模型上下文协议 |
| SSE | Server-Sent Events，服务器推送事件 |
| Agent | 智能代理，能够自主调用工具完成任务 |
| Tool | 工具，Agent 可调用的功能模块 |
| Session | 会话，一次完整的对话上下文 |

### 11.3 巴西州代码对照

| 代码 | 州名 | 代码 | 州名 |
|------|------|------|------|
| SP | São Paulo | RJ | Rio de Janeiro |
| MG | Minas Gerais | RS | Rio Grande do Sul |
| PR | Paraná | SC | Santa Catarina |
| BA | Bahia | GO | Goiás |
| DF | Distrito Federal | PE | Pernambuco |
| CE | Ceará | PA | Pará |
| MA | Maranhão | MT | Mato Grosso |
| ES | Espírito Santo | PB | Paraíba |
| MS | Mato Grosso do Sul | RN | Rio Grande do Norte |
| PI | Piauí | AL | Alagoas |
| SE | Sergipe | RO | Rondônia |
| TO | Tocantins | AM | Amazonas |
| AC | Acre | AP | Amapá |
| RR | Roraima | | |

### 11.4 品类英文对照 (部分)

| 英文 | 中文 |
|------|------|
| bed_bath_table | 床上用品/浴室/餐桌 |
| health_beauty | 健康美容 |
| sports_leisure | 运动休闲 |
| furniture_decor | 家具装饰 |
| computers_accessories | 电脑配件 |
| housewares | 家居用品 |
| watches_gifts | 手表礼品 |
| telephony | 电话通讯 |
| garden_tools | 园艺工具 |
| auto | 汽车用品 |
| toys | 玩具 |
| cool_stuff | 酷炫商品 |
| perfumery | 香水 |
| baby | 母婴用品 |
| electronics | 电子产品 |

---

**文档结束**

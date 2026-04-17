# Quickstart: 功能扩展 - 多维度查询与可视化

**Feature**: 002-feature-expansion
**Date**: 2026-02-05

## 概述

本功能扩展在 Spec 1 MVP 基础上添加：
- 4 个新 MCP 查询工具：`query_orders`, `query_customers`, `query_reviews`, `query_sellers`
- 1 个趋势分析工具：`analyze_trend`
- 3 种新图表组件：折线图、柱状图、饼图

## 前置条件

确保 Spec 1 MVP 已完成：
- [x] 项目结构搭建完成
- [x] 数据库已导入 Olist 数据集
- [x] 基础对话功能可用
- [x] `query_sales` 和 `generate_chart` 工具可用
- [x] `metric` 和 `table` 图表组件可用

## 开发顺序

### Phase 1: 后端 MCP 工具 (P1)

1. **创建查询函数** (`backend/src/db/queries.ts`)
   - `queryOrders()` - 订单查询
   - `queryCustomers()` - 客户查询
   - `queryReviews()` - 评价查询
   - `querySellers()` - 卖家查询
   - `analyzeTrend()` - 趋势分析

2. **注册 MCP 工具** (`backend/src/mcp/tools/`)
   - 创建 `queryOrders.ts`
   - 创建 `queryCustomers.ts`
   - 创建 `queryReviews.ts`
   - 创建 `querySellers.ts`
   - 创建 `analyzeTrend.ts`
   - 更新 `index.ts` 注册新工具

3. **扩展 generate_chart** (`backend/src/mcp/tools/index.ts`)
   - 添加 `line`, `bar`, `pie` 类型支持

### Phase 2: 前端图表组件 (P1)

1. **扩展类型定义** (`frontend/src/types/index.ts`)
   - 添加 `LineConfig`, `BarConfig`, `PieConfig`
   - 扩展 `ChartConfig` 类型

2. **创建图表组件** (`frontend/src/components/Charts/`)
   - 创建 `LineChart.tsx`
   - 创建 `BarChart.tsx`
   - 创建 `PieChart.tsx`

3. **更新 ChartRenderer** (`frontend/src/components/Charts/ChartRenderer.tsx`)
   - 添加新图表类型分发

### Phase 3: 集成测试

1. **后端测试** (`backend/tests/mcp/`)
   - 各工具基本功能测试
   - 参数验证测试
   - 边界条件测试

2. **端到端验证**
   - 测试各用户场景对话
   - 验证图表正确渲染

## 关键文件清单

### 新增文件

```
backend/src/mcp/tools/
├── queryOrders.ts      # [NEW]
├── queryCustomers.ts   # [NEW]
├── queryReviews.ts     # [NEW]
├── querySellers.ts     # [NEW]
└── analyzeTrend.ts     # [NEW]

frontend/src/components/Charts/
├── LineChart.tsx       # [NEW]
├── BarChart.tsx        # [NEW]
└── PieChart.tsx        # [NEW]

backend/tests/mcp/
└── tools.test.ts       # [NEW]
```

### 修改文件

```
backend/src/db/queries.ts           # 添加新查询函数
backend/src/mcp/tools/index.ts      # 注册新工具，扩展 generate_chart
frontend/src/types/index.ts         # 扩展图表类型
frontend/src/components/Charts/ChartRenderer.tsx  # 添加新图表分发
```

## 验证检查点

### Checkpoint 1: 订单查询可用

```bash
# 启动开发服务器
pnpm dev

# 在对话中测试
> 2017年订单状态分布
# 预期：返回饼图显示各状态占比
```

### Checkpoint 2: 趋势分析可用

```bash
> 按月展示2017年销售趋势
# 预期：返回折线图显示12个月趋势
```

### Checkpoint 3: 客户分析可用

```bash
> 客户主要分布在哪些州
# 预期：返回柱状图显示各州客户数
```

### Checkpoint 4: 评价分析可用

```bash
> 评分分布情况
# 预期：返回柱状图显示1-5分分布
```

### Checkpoint 5: 卖家分析可用

```bash
> 销量最高的10个卖家
# 预期：返回表格显示TOP10卖家
```

## 常见问题

### Q: 图表不显示？

检查：
1. `ChartRenderer` 是否正确分发新类型
2. ECharts 配置是否正确
3. 浏览器控制台是否有错误

### Q: 查询返回空结果？

检查：
1. 日期范围是否在数据集范围内（2016-09 到 2018-08）
2. SQL 查询是否正确
3. 数据库连接是否正常

### Q: 同比/环比计算不正确？

检查：
1. 对比期数据是否存在
2. 计算公式是否正确
3. 空值处理是否正确

## 参考文档

- [spec.md](./spec.md) - 功能规格说明
- [research.md](./research.md) - 技术研究
- [data-model.md](./data-model.md) - 数据模型
- [contracts/mcp-tools.md](./contracts/mcp-tools.md) - MCP 工具合约
- [contracts/chart-types.md](./contracts/chart-types.md) - 图表类型合约

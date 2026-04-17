# Quickstart: E-Commerce Insight Agent MVP

本文档提供快速启动项目的步骤。

## 前置条件

- Node.js 18+
- pnpm 8+
- Anthropic API Key

## 1. 克隆项目

```bash
git clone <repo-url>
cd ecommerce-agent
```

## 2. 安装依赖

```bash
pnpm install
```

## 3. 配置环境变量

```bash
# 复制环境变量模板
cp .env.example .env

# 编辑 .env 文件，填入 API Key
ANTHROPIC_API_KEY=your-api-key-here
```

## 4. 准备数据

### 4.1 下载 Olist 数据集

从 Kaggle 下载数据集：
https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce

将 CSV 文件放入 `data/raw/` 目录：
```
data/raw/
├── olist_orders_dataset.csv
├── olist_order_items_dataset.csv
├── olist_products_dataset.csv
├── olist_customers_dataset.csv
├── olist_sellers_dataset.csv
├── olist_order_payments_dataset.csv
├── olist_order_reviews_dataset.csv
├── olist_geolocation_dataset.csv
└── product_category_name_translation.csv
```

### 4.2 导入数据到 SQLite

```bash
pnpm run import-data
```

这将创建 `data/ecommerce.db` 数据库文件。

## 5. 启动开发服务器

### 方式一：同时启动前后端

```bash
pnpm dev
```

### 方式二：分别启动

```bash
# 终端 1 - 启动后端
pnpm --filter backend dev

# 终端 2 - 启动前端
pnpm --filter frontend dev
```

## 6. 访问应用

- 前端：http://localhost:5173
- 后端 API：http://localhost:3001
- 健康检查：http://localhost:3001/api/health

## 7. 验证功能

1. 打开浏览器访问 http://localhost:5173
2. 在输入框输入："2017年销售额是多少？"
3. 观察流式响应和图表展示

## 常见问题

### Q: 数据导入失败
A: 确保 CSV 文件编码为 UTF-8，且文件名与上述列表一致。

### Q: API 调用失败
A: 检查 `.env` 文件中的 `ANTHROPIC_API_KEY` 是否正确。

### Q: 前端无法连接后端
A: 确保后端服务已启动，检查端口 3001 是否被占用。

## 项目脚本

| 命令 | 说明 |
|------|------|
| `pnpm dev` | 启动开发服务器 |
| `pnpm build` | 构建生产版本 |
| `pnpm import-data` | 导入数据到 SQLite |
| `pnpm lint` | 代码检查 |
| `pnpm test` | 运行测试 |

# E-Commerce Insight Agent

基于 Claude Agent SDK 构建的电商数据分析智能助手，通过自然语言对话实现数据查询、分析和可视化。

## 核心特性

- **自然语言查询** - 无需 SQL，用中英文自然语言完成复杂数据查询
- **智能分析** - AI 自动识别数据趋势、异常和关联
- **可视化呈现** - 自动生成图表，直观展示分析结果
- **流式响应** - 实时展示 Agent 思考和输出过程
- **多轮对话** - 支持上下文关联的连续对话

## 数据来源

使用 Kaggle 公开数据集 [Brazilian E-Commerce Public Dataset by Olist](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce)

- 约 10 万订单，2016-2018 年真实交易数据
- 包含订单、商品、客户、卖家、评价等 9 张数据表
- 许可：CC BY-NC-SA 4.0

会话历史默认存储在 `data/sessions/*.jsonl`（每个会话一个文件）。

## 技术栈

| 层级 | 技术 | 说明 |
|------|------|------|
| 语言 | TypeScript | 全栈类型安全 |
| 前端 | React 18 + Vite | 组件化开发 |
| UI | Ant Design 5 | 企业级组件库 |
| 图表 | ECharts 5 | 数据可视化 |
| 状态管理 | Zustand | 轻量级状态管理 |
| 后端 | Express 4 | Node.js Web 框架 |
| Agent | Claude Agent SDK | Anthropic 官方 SDK |
| 数据库 | DuckDB | 列式分析数据库 |
| 包管理 | pnpm workspace | Monorepo 管理 |

## 项目结构

```text
ecommerce-agent/
├── frontend/          # React 前端应用
├── backend/           # Express 后端服务
├── data/              # 数据文件和导入脚本
└── docs/              # 项目文档
```

## 快速开始

```bash
# 1. 初始化环境（安装依赖 + 创建 .env）
make setup

# 2. 编辑 .env，填入 ANTHROPIC_API_KEY

# 3. 下载数据（需要 kaggle CLI，或手动下载）
make download-data

# 4. 导入数据到 DuckDB
make import-data

# 5. 启动开发服务
make dev
```

## 生产部署

已提供基于 Docker Compose 的生产部署方案（支持服务器本地 build、`.env` 同步、`ecommerce.duckdb` 上传和 Basic Auth 保护）。

参考：`docs/DEPLOYMENT.md`

### 质量验证（CI 友好）

```bash
pnpm lint
pnpm build
pnpm test
pnpm --filter backend test:watch   # 仅本地调试时使用
```

### 数据下载

项目使用 [Olist Brazilian E-Commerce](https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce) 公开数据集。

**方式一：kaggle CLI（推荐）**

```bash
pip install kaggle
# 配置 ~/.kaggle/kaggle.json（从 https://www.kaggle.com/settings 获取）
make download-data
```

**方式二：手动下载**

1. 访问 https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce
2. 下载 ZIP 并解压所有 CSV 文件到 `data/raw/` 目录
3. 运行 `make import-data`

## 使用示例

```text
用户: 2017年的总销售额是多少？
Agent: 2017年的总销售额为 R$ 8,234,567.89，相比2016年增长了23.5%。

用户: 按月展示销售趋势
Agent: [展示折线图] 可以看到11-12月销售额明显上升，与年末促销季相关。

用户: 销售额最高的5个品类是什么？
Agent: [展示柱状图] 销售额TOP5品类依次为：床上用品、健康美容、运动休闲...
```

## License

MIT

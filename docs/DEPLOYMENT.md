# Docker Compose 部署指南

本文档对应一台可 SSH 访问的服务器：`your-server-host`。

## 1. 本地准备

确保本地已具备：

- 最新代码
- `.env`（包含 `ANTHROPIC_API_KEY`，并新增 Basic Auth 变量）
- `data/ecommerce.duckdb`
- `data/sessions/`（会话 JSONL 存储目录，首次部署可为空）

`.env` 最少应包含：

```bash
ANTHROPIC_API_KEY=...
BASIC_AUTH_USER=admin
BASIC_AUTH_PASSWORD=your-strong-password
WEB_PORT=8081
```

说明：`DATABASE_PATH` 可以保持当前本地 `.env` 的配置，`docker-compose.yml` 会在容器内覆盖为 `/app/data/ecommerce.duckdb`。

## 2. 服务器初始化（首次）

```bash
ssh your-server-host

# 选择你的部署目录
mkdir -p ~/apps/ecommerce-agent
cd ~/apps/ecommerce-agent

# 拉代码
git clone <your-repo-url> .
```

需要服务器安装 Docker 与 Compose 插件（`docker compose version` 可用）。

## 3. 上传配置与数据库

在本地仓库根目录执行：

```bash
# 复制配置文件（使用你当前本地 .env）
scp .env your-server-host:~/apps/ecommerce-agent/.env

# 复制数据库文件
scp data/ecommerce.duckdb your-server-host:~/apps/ecommerce-agent/data/ecommerce.duckdb

# 确保会话目录存在（可选：迁移旧会话文件）
ssh your-server-host 'mkdir -p ~/apps/ecommerce-agent/data/sessions'
```

## 4. 服务器构建并启动

```bash
ssh your-server-host
cd ~/apps/ecommerce-agent

# 如果代码有更新
git pull

# 在服务器本地 build + up
docker compose up -d --build
```

## 5. 验证

```bash
docker compose ps
docker compose logs -f --tail=100
curl -i http://127.0.0.1/api/health
```

- 浏览器访问 `http://服务器IP:WEB_PORT`（默认 `8081`）时，会先弹出 Basic Auth 登录框。
- 登录成功后才可访问前端页面与 `/api/*` 接口。

## 6. 常用运维命令

```bash
# 重启
docker compose restart

# 停止
docker compose down

# 更新后重建
git pull && docker compose up -d --build
```

## 7. 一键部署脚本（可选）

仓库内提供了 `deploy/deploy-remote.sh`，会自动执行：

- `scp .env`
- `scp data/ecommerce.duckdb`
- 远程 `git pull && docker compose up -d --build`

用法：

```bash
# 默认目标: your-server-host + ~/apps/ecommerce-agent
./deploy/deploy-remote.sh

# 指定主机和目录
./deploy/deploy-remote.sh your-server-host ~/apps/ecommerce-agent
```

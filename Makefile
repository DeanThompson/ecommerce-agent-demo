# E-Commerce Insight Agent Makefile
# 简化开发和运维操作

.PHONY: help install dev build start clean lint test test-ci test-watch format setup import-data clean-db \
        dev-frontend dev-backend build-frontend build-backend

# 默认目标
.DEFAULT_GOAL := help

# 颜色定义
CYAN := \033[36m
GREEN := \033[32m
YELLOW := \033[33m
RESET := \033[0m

#==============================================================================
# 帮助信息
#==============================================================================

help: ## 显示帮助信息
	@echo ""
	@echo "$(CYAN)E-Commerce Insight Agent$(RESET)"
	@echo "========================="
	@echo ""
	@echo "$(GREEN)开发命令:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(install|dev|build|start)' | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)代码质量:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(lint|test|format)' | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)数据管理:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(download|import|clean-db)' | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""
	@echo "$(GREEN)环境配置:$(RESET)"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | grep -E '(setup|clean)' | \
		awk 'BEGIN {FS = ":.*?## "}; {printf "  $(CYAN)%-18s$(RESET) %s\n", $$1, $$2}'
	@echo ""

#==============================================================================
# 开发命令
#==============================================================================

install: ## 安装所有依赖
	pnpm install

dev: ## 启动开发服务 (前后端并行)
	pnpm run dev

dev-frontend: ## 仅启动前端开发服务
	pnpm --filter frontend dev

dev-backend: ## 仅启动后端开发服务
	pnpm --filter backend dev

build: ## 构建生产版本
	pnpm run build

build-frontend: ## 仅构建前端
	pnpm --filter frontend build

build-backend: ## 仅构建后端
	pnpm --filter backend build

start: build ## 启动生产服务
	pnpm --filter backend start

preview: build-frontend ## 预览前端构建结果
	pnpm --filter frontend preview

#==============================================================================
# 代码质量
#==============================================================================

lint: ## 运行代码检查
	pnpm run lint

test: ## 运行测试（默认非 watch，适合 CI）
	pnpm run test

test-ci: ## CI 模式运行测试
	pnpm run test:ci

test-watch: ## 本地 watch 模式（仅后端）
	pnpm --filter backend test:watch

format: ## 格式化代码 (需要配置 prettier)
	@echo "$(YELLOW)提示: 请确保已安装 prettier$(RESET)"
	pnpm -r exec prettier --write "src/**/*.{ts,tsx}"

#==============================================================================
# 数据管理
#==============================================================================

download-data: ## 下载 Olist 电商数据集 (需要 kaggle CLI)
	bash data/scripts/download.sh

import-data: ## 导入电商数据到 DuckDB
	pnpm run import-data

clean-db: ## 清理数据库文件
	@echo "$(YELLOW)警告: 即将删除数据库文件$(RESET)"
	@read -p "确认删除? [y/N] " confirm && [ "$$confirm" = "y" ] && rm -f data/ecommerce.duckdb || echo "已取消"

#==============================================================================
# 环境配置
#==============================================================================

setup: ## 初始化开发环境
	@echo "$(GREEN)初始化开发环境...$(RESET)"
	@if [ ! -f .env ]; then \
		cp .env.example .env; \
		echo "$(CYAN)已创建 .env 文件，请配置 ANTHROPIC_API_KEY$(RESET)"; \
	else \
		echo "$(YELLOW).env 文件已存在$(RESET)"; \
	fi
	@$(MAKE) install
	@echo "$(GREEN)环境初始化完成!$(RESET)"
	@echo ""
	@echo "下一步:"
	@echo "  1. 编辑 .env 文件，配置 ANTHROPIC_API_KEY"
	@echo "  2. 运行 make dev 启动开发服务"

clean: ## 清理构建产物和缓存
	rm -rf node_modules
	rm -rf frontend/node_modules frontend/dist
	rm -rf backend/node_modules backend/dist
	rm -rf .pnpm-store

#==============================================================================
# 快捷命令
#==============================================================================

# 快速重置: 清理 + 安装 + 导入数据
reset: clean install import-data ## 完全重置项目

# 检查环境
check: ## 检查开发环境
	@echo "$(GREEN)检查开发环境...$(RESET)"
	@echo ""
	@echo "Node.js: $$(node --version 2>/dev/null || echo '$(YELLOW)未安装$(RESET)')"
	@echo "pnpm:    $$(pnpm --version 2>/dev/null || echo '$(YELLOW)未安装$(RESET)')"
	@echo ""
	@if [ -f .env ]; then \
		echo "$(GREEN).env 文件: 已配置$(RESET)"; \
	else \
		echo "$(YELLOW).env 文件: 未配置 (运行 make setup)$(RESET)"; \
	fi
	@if [ -f data/ecommerce.duckdb ]; then \
		echo "$(GREEN)数据库: 已存在 ($$(du -h data/ecommerce.duckdb | cut -f1))$(RESET)"; \
	else \
		echo "$(YELLOW)数据库: 未创建 (运行 make import-data)$(RESET)"; \
	fi

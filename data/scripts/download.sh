#!/usr/bin/env bash
#
# 下载 Olist 电商数据集
# 数据来源: https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce
#

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
RAW_DIR="$SCRIPT_DIR/../raw"
DATASET="olistbr/brazilian-ecommerce"

# 期望的 CSV 文件列表
EXPECTED_FILES=(
  olist_customers_dataset.csv
  olist_geolocation_dataset.csv
  olist_order_items_dataset.csv
  olist_order_payments_dataset.csv
  olist_order_reviews_dataset.csv
  olist_orders_dataset.csv
  olist_products_dataset.csv
  olist_sellers_dataset.csv
  product_category_name_translation.csv
)

check_data_exists() {
  local count=0
  for f in "${EXPECTED_FILES[@]}"; do
    [ -f "$RAW_DIR/$f" ] && ((count++))
  done
  if [ "$count" -eq "${#EXPECTED_FILES[@]}" ]; then
    return 0
  fi
  return 1
}

download_with_kaggle_cli() {
  echo "使用 kaggle CLI 下载数据集..."
  echo "数据集: $DATASET"
  echo ""

  # 检查 kaggle 认证
  if [ ! -f ~/.kaggle/kaggle.json ]; then
    echo "错误: 未找到 ~/.kaggle/kaggle.json"
    echo ""
    echo "请先配置 Kaggle API 认证:"
    echo "  1. 登录 https://www.kaggle.com/settings"
    echo "  2. 点击 'Create New Token' 下载 kaggle.json"
    echo "  3. 放置到 ~/.kaggle/kaggle.json"
    echo "  4. chmod 600 ~/.kaggle/kaggle.json"
    return 1
  fi

  mkdir -p "$RAW_DIR"
  kaggle datasets download -d "$DATASET" -p "$RAW_DIR" --unzip
  echo ""
  echo "下载完成!"
}

print_manual_instructions() {
  echo "============================================"
  echo "  手动下载指引"
  echo "============================================"
  echo ""
  echo "1. 访问 Kaggle 数据集页面:"
  echo "   https://www.kaggle.com/datasets/olistbr/brazilian-ecommerce"
  echo ""
  echo "2. 点击 'Download' 按钮下载 ZIP 文件"
  echo "   (需要 Kaggle 账号登录)"
  echo ""
  echo "3. 解压 CSV 文件到以下目录:"
  echo "   $RAW_DIR/"
  echo ""
  echo "4. 确认以下文件存在:"
  for f in "${EXPECTED_FILES[@]}"; do
    echo "   - $f"
  done
  echo ""
  echo "5. 运行数据导入:"
  echo "   make import-data"
}

main() {
  echo "============================================"
  echo "  Olist 电商数据集下载"
  echo "============================================"
  echo ""

  # 检查是否已有数据
  if check_data_exists; then
    echo "数据文件已存在于 $RAW_DIR/"
    echo "如需重新下载，请先删除 data/raw/ 目录下的 CSV 文件。"
    exit 0
  fi

  # 尝试使用 kaggle CLI
  if command -v kaggle &>/dev/null; then
    if download_with_kaggle_cli; then
      # 验证下载结果
      if check_data_exists; then
        echo ""
        echo "所有文件已就绪，可运行 make import-data 导入数据。"
        exit 0
      else
        echo "警告: 部分文件缺失，请检查下载内容。"
        exit 1
      fi
    fi
    echo ""
  else
    echo "未检测到 kaggle CLI 工具。"
    echo ""
    echo "安装方式: pip install kaggle"
    echo ""
  fi

  print_manual_instructions
  exit 1
}

main "$@"

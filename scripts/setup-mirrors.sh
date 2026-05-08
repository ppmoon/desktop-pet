#!/bin/bash
# 配置国内镜像加速依赖安装
# Usage: bash scripts/setup-mirrors.sh

echo "=== 配置 npm 镜像 (npmmirror) ==="
cat > .npmrc << 'EOF'
registry=https://registry.npmmirror.com
EOF

echo "=== 配置 Cargo 镜像 (tuna) ==="
mkdir -p ~/.cargo
if ! grep -q 'tuna' ~/.cargo/config.toml 2>/dev/null; then
  cat >> ~/.cargo/config.toml << 'EOF'

[source.crates-io]
replace-with = 'tuna'

[source.tuna]
registry = "https://mirrors.tuna.tsinghua.edu.cn/git/crates.io-index.git"
EOF
  echo "Cargo 镜像已添加"
else
  echo "Cargo 镜像已存在，跳过"
fi

echo "=== 镜像配置完成 ==="
echo "现在可以运行: npm install && cd src-tauri && cargo build"

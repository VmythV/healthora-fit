#!/bin/bash

# Healthora Fit - Android 签名密钥库生成脚本
# 使用方法: ./scripts/generate-keystore.sh

set -e

echo "=================================="
echo "  Healthora Fit - Android 签名配置"
echo "=================================="
echo ""

# 配置参数
KEYSTORE_FILE="healthora-fit.keystore"
KEY_ALIAS="healthora-fit"
VALIDITY=10000
KEY_SIZE=2048
KEY_ALG=RSA

# 创建 android/keystore 目录
KEYSTORE_DIR="android/keystore"
mkdir -p "$KEYSTORE_DIR"

KEYSTORE_PATH="$KEYSTORE_DIR/$KEYSTORE_FILE"

echo "📁 密钥库将保存到: $KEYSTORE_PATH"
echo ""

# 检查是否已存在
if [ -f "$KEYSTORE_PATH" ]; then
    echo "⚠️  警告: 密钥库文件已存在!"
    read -p "是否覆盖? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        echo "❌ 操作已取消"
        exit 1
    fi
fi

echo "🔐 生成签名密钥库..."
echo ""

# 生成密钥库
keytool -genkeypair \
    -v \
    -storetype PKCS12 \
    -keystore "$KEYSTORE_PATH" \
    -alias "$KEY_ALIAS" \
    -keyalg "$KEY_ALG" \
    -keysize "$KEY_SIZE" \
    -validity "$VALIDITY"

echo ""
echo "✅ 密钥库生成成功!"
echo ""

# 创建 keystore.properties 模板
PROPS_FILE="android/keystore.properties"
cat > "$PROPS_FILE" << EOF
# Healthora Fit - Android 签名配置
# ⚠️ 不要将此文件提交到 Git

storePassword=your_store_password
keyPassword=your_key_password
keyAlias=$KEY_ALIAS
storeFile=$KEYSTORE_PATH
EOF

echo "📝 已创建签名配置模板: $PROPS_FILE"
echo ""
echo "⚠️  重要提醒:"
echo "   1. 请编辑 $PROPS_FILE，填入正确的密码"
echo "   2. 请妥善保管密钥库文件和密码"
echo "   3. 密钥库丢失将无法更新应用"
echo ""
echo "📋 下一步:"
echo "   1. 编辑 $PROPS_FILE 填写密码"
echo "   2. 将密钥库文件添加到 .gitignore"
echo "   3. 运行构建命令生成签名 APK/AAB"
echo ""

# 更新 .gitignore
GITIGNORE=".gitignore"
if [ -f "$GITIGNORE" ]; then
    # 检查是否已包含
    if ! grep -q "$KEYSTORE_FILE" "$GITIGNORE"; then
        echo "" >> "$GITIGNORE"
        echo "# Android 签名文件" >> "$GITIGNORE"
        echo "android/keystore/" >> "$GITIGNORE"
        echo "android/keystore.properties" >> "$GITIGNORE"
        echo "*.keystore" >> "$GITIGNORE"
        echo "✅ 已更新 .gitignore"
    else
        echo "ℹ️  .gitignore 已包含相关规则"
    fi
fi

echo ""
echo "=================================="
echo "  ✅ 签名配置完成!"
echo "=================================="

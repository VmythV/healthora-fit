#!/bin/bash

# Healthora Fit - Android 构建脚本
# 使用方法: ./scripts/build-android.sh [build_type]

set -e

echo "=================================="
echo "  Healthora Fit - Android 构建"
echo "=================================="
echo ""

# 构建类型
BUILD_TYPE=${1:-"preview"}

# 验证构建类型
if [[ "$BUILD_TYPE" != "development" && "$BUILD_TYPE" != "preview" && "$BUILD_TYPE" != "production" ]]; then
    echo "❌ 无效的构建类型: $BUILD_TYPE"
    echo "   可选类型: development, preview, production"
    exit 1
fi

echo "📦 构建类型: $BUILD_TYPE"
echo ""

# 检查 EAS 登录状态
echo "🔍 检查 EAS 登录状态..."
if ! npx eas-cli whoami > /dev/null 2>&1; then
    echo "❌ 未登录 EAS"
    echo "   请先运行: npx eas-cli login"
    exit 1
fi

EAS_USER=$(npx eas-cli whoami 2>/dev/null)
echo "✅ 已登录: $EAS_USER"
echo ""

# 检查依赖
echo "🔍 检查项目依赖..."
if [ ! -d "node_modules" ]; then
    echo "📥 安装依赖..."
    npm install
fi
echo "✅ 依赖检查完成"
echo ""

# 显示构建信息
echo "=================================="
echo "  构建信息"
echo "=================================="
echo "应用名称: Healthora Fit"
echo "包名: com.healthora.fit"
echo "构建类型: $BUILD_TYPE"
echo "平台: Android"
echo ""

# 确认构建
read -p "是否开始构建? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ 构建已取消"
    exit 1
fi

echo ""
echo "🚀 开始构建..."
echo ""

# 执行构建
case "$BUILD_TYPE" in
    "development")
        echo "📱 构建开发版本 (APK)..."
        npx eas-cli build --platform android --profile development --non-interactive
        ;;
    "preview")
        echo "📱 构建预览版本 (APK)..."
        npx eas-cli build --platform android --profile preview --non-interactive
        ;;
    "production")
        echo "📱 构建生产版本 (AAB)..."
        npx eas-cli build --platform android --profile production --non-interactive
        ;;
esac

echo ""
echo "=================================="
echo "  ✅ 构建任务已提交!"
echo "=================================="
echo ""
echo "📋 构建状态:"
echo "   查看状态: npx eas-cli build:list"
echo "   下载构建: npx eas-cli build:view [BUILD_ID]"
echo ""
echo "📁 构建产物:"
if [ "$BUILD_TYPE" = "production" ]; then
    echo "   类型: AAB (Android App Bundle)"
    echo "   用途: Google Play 发布"
else
    echo "   类型: APK"
    echo "   用途: 测试安装"
fi
echo ""
echo "🔗 参考文档:"
echo "   docs/android-release/05-build-guide.md"
echo ""

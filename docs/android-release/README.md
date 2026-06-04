# Android 发布准备指南

## 📱 概述

本目录包含 Healthora Fit Android 应用发布所需的所有文档和配置。

---

## 📚 文档目录

| 文档 | 说明 |
|------|------|
| [01-icon-design.md](./01-icon-design.md) | 应用图标设计指南 |
| [02-signing-config.md](./02-signing-config.md) | 应用签名配置 |
| [03-store-listing.md](./03-store-listing.md) | Google Play 商店资料 |
| [04-privacy-policy.md](./04-privacy-policy.md) | 隐私政策 |
| [05-build-guide.md](./05-build-guide.md) | 构建指南 |

---

## 🚀 快速开始

### 1. 配置签名

```bash
# 生成签名密钥库
./scripts/generate-keystore.sh

# 填写签名配置
编辑 android/keystore.properties
```

### 2. 构建应用

```bash
# 预览构建（APK，用于测试）
./scripts/build-android.sh preview

# 生产构建（AAB，用于发布）
./scripts/build-android.sh production
```

### 3. 发布到 Google Play

1. 创建 Google Play 开发者账号
2. 上传 AAB 文件
3. 填写商店资料
4. 提交审核

---

## 📋 发布清单

### 应用配置

- ✅ 应用图标已配置（assets/icon.png）
- ✅ 启动画面已配置（assets/splash-icon.png）
- ✅ Android 配置已设置（app.json）
- ✅ 版本号已配置（1.0.0）

### 签名配置

- ⬜ 生成签名密钥库
- ⬜ 配置 keystore.properties
- ⬜ 测试签名构建

### 商店资料

- ✅ 应用描述已编写
- ✅ 隐私政策已编写
- ⬜ 截图已准备
- ⬜ 功能图片已准备

### 构建测试

- ⬜ 开发构建测试
- ⬜ 预览构建测试
- ⬜ 生产构建测试

---

## 🛠️ 工具和脚本

### 可用脚本

| 脚本 | 用途 |
|------|------|
| `scripts/generate-keystore.sh` | 生成签名密钥库 |
| `scripts/build-android.sh` | 构建 Android 应用 |

### EAS CLI 命令

```bash
# 登录
npx eas-cli login

# 查看构建列表
npx eas-cli build:list

# 查看构建状态
npx eas-cli build:view [BUILD_ID]

# 下载构建产物
npx eas-cli build:view [BUILD_ID] --json | jq -r '.artifacts.buildUrl'
```

---

## 📝 版本管理

### 版本号规则

- **version** (app.json): 用户可见版本号（如 1.0.0）
- **versionCode** (app.json): 内部版本号，每次发布递增

### 更新版本

1. 编辑 `app.json`
2. 更新 `version`（语义化版本）
3. 递增 `versionCode`
4. 提交代码
5. 执行构建

---

## 🔒 安全提示

### 签名密钥

- ⚠️ 妥善保管签名密钥库文件
- ⚠️ 不要将密钥库提交到 Git
- ⚠️ 备份密钥库和密码
- ⚠️ 密钥丢失将无法更新应用

### API 密钥

- ⚠️ 不要在代码中硬编码 API 密钥
- ⚠️ 使用环境变量或配置文件
- ⚠️ 不要提交包含密钥的文件

---

## 📞 常见问题

### Q1: 如何生成签名密钥库？

**A:** 运行 `./scripts/generate-keystore.sh`，按照提示操作。

### Q2: 如何构建 AAB 文件？

**A:** 运行 `./scripts/build-android.sh production`。

### Q3: 如何查看构建状态？

**A:** 运行 `npx eas-cli build:list` 或访问 [EAS Dashboard](https://expo.dev)。

### Q4: 如何更新应用版本？

**A:** 编辑 `app.json` 中的 `version` 和 `versionCode`。

---

## 📖 参考文档

- [Expo 构建文档](https://docs.expo.dev/build/introduction/)
- [EAS Build 文档](https://docs.expo.dev/eas/)
- [Google Play Console 帮助](https://support.google.com/googleplay/android-developer)
- [Android 开发者文档](https://developer.android.com/)

---

## 📅 更新记录

### 2026-06-04

- 创建 Android 发布准备文档
- 配置 EAS Build
- 编写商店资料和隐私政策
- 创建构建脚本

---

*文档版本：v1.0*
*最后更新：2026-06-04*

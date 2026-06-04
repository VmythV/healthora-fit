# Android 构建指南

## 📋 构建前准备

### 环境要求

- **Node.js**: 18.0 或更高版本
- **npm/yarn**: 最新版本
- **EAS CLI**: 7.0 或更高版本
- **Expo CLI**: 最新版本

### 安装依赖

```bash
# 安装 EAS CLI
npm install -g eas-cli

# 登录 Expo 账号
npx eas-cli login

# 安装项目依赖
npm install
```

---

## 🔐 签名配置

### 方式一：使用 EAS 签名（推荐）

EAS 会自动管理签名密钥，无需手动配置。

```bash
# 配置 EAS 签名
npx eas-cli build:configure
```

### 方式二：本地签名

1. **生成签名密钥库**
   ```bash
   ./scripts/generate-keystore.sh
   ```

2. **填写签名配置**
   编辑 `android/keystore.properties`：
   ```properties
   storePassword=your_password
   keyPassword=your_key_password
   keyAlias=healthora-fit
   storeFile=android/keystore/healthora-fit.keystore
   ```

---

## 🏗️ 构建方式

### 方式一：EAS Build（云端构建）

#### 开发构建（APK）

```bash
npx eas-cli build --platform android --profile development
```

**用途：**
- 开发测试
- 内部测试分发
- 功能验证

#### 预览构建（APK）

```bash
npx eas-cli build --platform android --profile preview
```

**用途：**
- 内部测试
- 小范围分发
- 收集反馈

#### 生产构建（AAB）

```bash
npx eas-cli build --platform android --profile production
```

**用途：**
- Google Play 发布
- 正式版本

#### 构建状态查看

```bash
# 查看构建列表
npx eas-cli build:list

# 查看特定构建
npx eas-cli build:view [BUILD_ID]
```

---

### 方式二：本地构建

#### 前置条件

- 安装 Android Studio
- 配置 Android SDK
- 配置 Java JDK

#### 生成 APK

```bash
# 进入 Android 目录
cd android

# 清理构建
./gradlew clean

# 生成 Debug APK
./gradlew assembleDebug

# 生成 Release APK
./gradlew assembleRelease
```

**APK 位置：**
```
android/app/build/outputs/apk/release/app-release.apk
```

#### 生成 AAB

```bash
# 进入 Android 目录
cd android

# 清理构建
./gradlew clean

# 生成 Release AAB
./gradlew bundleRelease
```

**AAB 位置：**
```
android/app/build/outputs/bundle/release/app-release.aab
```

---

## 🔧 配置文件说明

### app.json

```json
{
  "expo": {
    "android": {
      "package": "com.healthora.fit",
      "versionCode": 1,
      "adaptiveIcon": {
        "foregroundImage": "./assets/adaptive-icon.png",
        "backgroundColor": "#10B981"
      }
    }
  }
}
```

### eas.json

```json
{
  "build": {
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

---

## 📦 构建产物

### APK 文件

- **用途：** 直接安装测试
- **优势：** 可直接安装到设备
- **劣势：** 文件较大，不适合 Play 商店

### AAB 文件

- **用途：** Google Play 发布
- **优势：** 文件较小，支持动态交付
- **劣势：** 不能直接安装，需要上传到 Play 商店

---

## 🧪 测试构建

### 安装 APK 到设备

```bash
# 使用 ADB 安装
adb install app-release.apk

# 或者直接传输到设备安装
```

### 测试清单

- ⬜ 应用正常启动
- ⬜ 图标和启动画面显示正确
- ⬜ 所有功能正常工作
- ⬜ 数据库正常读写
- ⬜ AI 功能正常（如已配置）
- ⬜ 权限请求正常
- ⬜ 应用性能良好

---

## 🚀 发布到 Google Play

### 步骤 1：创建 Google Play 开发者账号

1. 访问 [Google Play Console](https://play.google.com/console)
2. 支付 $25 注册费
3. 完成账号设置

### 步骤 2：创建应用

1. 在 Google Play Console 中创建新应用
2. 填写应用信息
3. 上传应用描述和截图

### 步骤 3：上传构建产物

1. 选择"内部测试"轨道
2. 上传 AAB 文件
3. 填写版本说明

### 步骤 4：完成商店设置

1. 上传截图和功能图片
2. 填写应用描述
3. 设置内容分级
4. 设置定价和分发

### 步骤 5：提交审核

1. 检查所有设置
2. 提交审核
3. 等待审核通过（通常 1-3 天）

---

## 🔍 常见问题

### Q1: 构建失败怎么办？

**A:** 检查以下常见问题：
1. 依赖版本冲突
2. 签名配置错误
3. 网络连接问题
4. 资源文件缺失

### Q2: 如何查看构建日志？

**A:**
```bash
# EAS Build 日志
npx eas-cli build:view [BUILD_ID]

# 本地构建日志
cd android && ./gradlew assembleRelease --info
```

### Q3: APK 和 AAB 应该选哪个？

**A:**
- **APK：** 用于测试和直接分发
- **AAB：** 用于 Google Play 发布

### Q4: 如何更新版本号？

**A:** 编辑 `app.json`：
```json
{
  "expo": {
    "version": "1.1.0",
    "android": {
      "versionCode": 2
    }
  }
}
```

---

## 📚 参考文档

- [Expo 构建文档](https://docs.expo.dev/build/introduction/)
- [EAS Build 文档](https://docs.expo.dev/eas/)
- [Google Play Console 帮助](https://support.google.com/googleplay/android-developer)
- [Android 开发者文档](https://developer.android.com/)

---

## 📝 构建记录

### 版本 1.0.0

- **构建时间**：2026-06-04
- **构建方式**：EAS Build
- **构建产物**：AAB
- **版本号**：1.0.0
- **版本代码**：1

---

*文档版本：v1.0*
*创建日期：2026-06-04*

# Healthora Fit — 打包指南

> **最后更新**：2026-06-03

---

## 📋 打包方式总览

| 方式 | 用途 | 输出格式 | 说明 |
|------|------|---------|------|
| EAS Build (preview) | 测试分发 | APK | 云端构建，推荐 |
| EAS Build (production) | 上架 Google Play | AAB | 云端构建 |
| 本地构建 | 离线构建 | APK | 需要 Android Studio |

---

## 🚀 方式 1：EAS Build（推荐）

### 1.1 前置准备

#### 安装 EAS CLI

```bash
npm install -g eas-cli
```

#### 登录 Expo 账号

```bash
eas login
```

如果没有账号，先注册：

```bash
eas register
```

#### 配置项目

```bash
eas build:configure
```

### 1.2 构建 APK（测试用）

```bash
# 构建 preview 版本（APK）
eas build --platform android --profile preview
```

构建完成后，会提供下载链接。

### 1.3 构建 AAB（上架用）

```bash
# 构建 production 版本（AAB）
eas build --platform android --profile production
```

### 1.4 查看构建历史

```bash
eas build:list
```

### 1.5 下载构建产物

```bash
# 下载最新的 preview 构建
eas build:list --platform android --limit 1 --json | jq -r '.[0].artifacts.buildUrl'
```

---

## 🔧 方式 2：本地构建

### 2.1 前置准备

确保已安装：
- Android Studio
- JDK 17
- Android SDK

### 2.2 生成原生项目

```bash
npx expo prebuild --platform android
```

这会生成 `android/` 目录。

### 2.3 构建 Debug APK

```bash
cd android
./gradlew assembleDebug
```

输出位置：`android/app/build/outputs/apk/debug/app-debug.apk`

### 2.4 构建 Release APK

```bash
cd android
./gradlew assembleRelease
```

输出位置：`android/app/build/outputs/apk/release/app-release.apk`

### 2.5 构建 AAB（用于上架）

```bash
cd android
./gradlew bundleRelease
```

输出位置：`android/app/build/outputs/bundle/release/app-release.aab`

---

## 🔐 签名配置

### 生成签名密钥

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore healthora-fit.keystore -alias healthora-fit -keyalg RSA -keysize 2048 -validity 10000
```

### 配置签名（本地构建）

编辑 `android/app/build.gradle`：

```gradle
android {
    signingConfigs {
        release {
            storeFile file('healthora-fit.keystore')
            storePassword 'your-store-password'
            keyAlias 'healthora-fit'
            keyPassword 'your-key-password'
        }
    }
    buildTypes {
        release {
            signingConfig signingConfigs.release
        }
    }
}
```

### 配置签名（EAS Build）

```bash
eas credentials
```

按照提示配置 Android Keystore。

---

## 📱 安装 APK

### 使用 ADB 安装

```bash
# 连接设备
adb devices

# 安装 APK
adb install app-release.apk
```

### 直接传输

将 APK 文件传输到手机，点击安装。

---

## 🏪 上架 Google Play

### 1. 准备资料

- 应用图标（512x512）
- 截图（手机、平板）
- Feature Graphic（1024x500）
- 应用描述
- 隐私政策

### 2. 创建 Google Play 开发者账号

访问：https://play.google.com/console

### 3. 上传 AAB

```bash
# 使用 EAS Submit
eas submit --platform android --profile production
```

或手动上传到 Google Play Console。

### 4. 填写应用信息

- 应用名称
- 应用描述
- 分类
- 内容分级
- 定价

### 5. 提交审核

---

## ⚙️ eas.json 配置说明

```json
{
  "build": {
    // 开发版本（用于调试）
    "development": {
      "developmentClient": true,
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    // 预览版本（用于测试分发）
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    // 生产版本（用于上架）
    "production": {
      "android": {
        "buildType": "app-bundle"
      }
    }
  }
}
```

### buildType 选项

| 选项 | 说明 | 用途 |
|------|------|------|
| `apk` | Android Package | 测试分发、直接安装 |
| `app-bundle` | Android App Bundle | 上架 Google Play |

---

## 🔍 常见问题

### Q1: EAS Build 失败

```bash
# 查看构建日志
eas build:view
```

### Q2: 本地构建失败

```bash
# 清理构建缓存
cd android
./gradlew clean

# 重新构建
./gradlew assembleRelease
```

### Q3: APK 安装失败

- 检查设备是否开启「允许安装未知来源应用」
- 检查 APK 是否与设备架构兼容

### Q4: 签名错误

```bash
# 重新生成签名密钥
keytool -genkeypair -v -storetype PKCS12 -keystore healthora-fit.keystore -alias healthora-fit -keyalg RSA -keysize 2048 -validity 10000
```

---

## 📚 参考文档

- [Expo Build 文档](https://docs.expo.dev/build/introduction/)
- [EAS Submit 文档](https://docs.expo.dev/submit/introduction/)
- [Google Play Console](https://play.google.com/console)

---

*文档版本：v1.0*
*最后更新：2026-06-03*

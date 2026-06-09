# Healthora Fit — 打包指南

> **最后更新**：2026-06-03

---

## 📋 打包方式总览

| 方式      | 用途             | 输出格式 | 状态      | 说明                |
| --------- | ---------------- | -------- | --------- | ------------------- |
| 本地构建  | 测试分发         | APK      | ✅ 可用   | 推荐使用            |
| 本地构建  | 上架 Google Play | AAB      | ✅ 可用   | 需要 Android Studio |
| EAS Build | 云端构建         | APK/AAB  | ⚠️ 有问题 | 暂时不可用          |

---

## ⚠️ 已知问题

### EAS Build 问题

**状态**：暂时不可用

**问题描述**：

- `package-lock.json` 与 `package.json` 不同步
- 依赖版本冲突导致构建失败
- `react-native-worklets` 版本兼容性问题

**错误信息**：

```
npm error `npm ci` can only install packages when your package.json and package-lock.json or npm-shrinkwrap.json are in sync.
```

**临时解决方案**：使用本地构建

**待修复**：

- [ ] 解决依赖版本冲突
- [ ] 更新 package-lock.json
- [ ] 测试 EAS Build 兼容性

---

## ✅ 推荐方式：本地构建

### 前置准备

确保已安装：

- Node.js 18+
- Android Studio
- JDK 17
- Android SDK

### 构建步骤

#### 1. 生成原生项目

```bash
npx expo prebuild --platform android
```

#### 2. 构建 Debug APK（调试用）

```bash
cd android
./gradlew assembleDebug
```

输出位置：`android/app/build/outputs/apk/debug/app-debug.apk`

#### 3. 构建 Release APK（正式版）

```bash
cd android
./gradlew assembleRelease
```

输出位置：`android/app/build/outputs/apk/release/app-release.apk`

#### 4. 构建 AAB（上架 Google Play）

```bash
cd android
./gradlew bundleRelease
```

输出位置：`android/app/build/outputs/bundle/release/app-release.aab`

---

## 📱 安装 APK

### 方式 1：使用 ADB 安装

```bash
# 连接设备
adb devices

# 安装 APK
adb install app-release.apk
```

### 方式 2：直接传输

将 APK 文件传输到手机，点击安装。

**注意**：需要开启「允许安装未知来源应用」

---

## 🔐 签名配置

### 生成签名密钥

```bash
keytool -genkeypair -v -storetype PKCS12 -keystore healthora-fit.keystore -alias healthora-fit -keyalg RSA -keysize 2048 -validity 10000
```

### 配置签名

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

将 `app-release.aab` 上传到 Google Play Console。

### 4. 填写应用信息

- 应用名称
- 应用描述
- 分类
- 内容分级
- 定价

### 5. 提交审核

---

## 🔧 常见问题

### Q1: 构建失败

```bash
# 清理构建缓存
cd android
./gradlew clean

# 重新构建
./gradlew assembleRelease
```

### Q2: APK 安装失败

- 检查设备是否开启「允许安装未知来源应用」
- 检查 APK 是否与设备架构兼容

### Q3: 签名错误

```bash
# 重新生成签名密钥
keytool -genkeypair -v -storetype PKCS12 -keystore healthora-fit.keystore -alias healthora-fit -keyalg RSA -keysize 2048 -validity 10000
```

### Q4: react-native-worklets 版本错误

```bash
# 降级到兼容版本
npm install react-native-worklets@0.8.0 --legacy-peer-deps
```

---

## 📚 参考文档

- [Expo 本地构建文档](https://docs.expo.dev/guides/local-app-development/)
- [Android Studio 下载](https://developer.android.com/studio)
- [Google Play Console](https://play.google.com/console)

---

_文档版本：v1.1_
_最后更新：2026-06-03_
_状态：EAS Build 暂时不可用，推荐使用本地构建_

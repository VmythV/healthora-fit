# Healthora Fit — 开发环境配置指南

> **适用平台**：macOS（同时支持 Android + iOS 开发）
> **最后更新**：2026-06-03

---

## 📋 软件清单总览

| 软件              | 版本要求     | 用途              | 必装        |
| ----------------- | ------------ | ----------------- | ----------- |
| Node.js           | 18.x 或 20.x | JavaScript 运行时 | ✅          |
| npm / yarn / pnpm | 最新版       | 包管理器          | ✅          |
| Git               | 最新版       | 版本控制          | ✅          |
| VS Code           | 最新版       | 代码编辑器        | 推荐        |
| Android Studio    | 最新版       | Android 开发      | ✅          |
| Xcode             | 15+          | iOS 开发          | ✅（macOS） |
| npx expo          | 内置         | Expo 开发工具     | ✅          |
| Expo Go App       | 最新版       | 真机调试          | 推荐        |

---

## 1️⃣ 安装 Node.js

### 推荐方式：使用 nvm（Node Version Manager）

```bash
# 安装 nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.7/install.sh | bash

# 重启终端，或执行
source ~/.zshrc

# 安装 Node.js 20 LTS
nvm install 20

# 设置默认版本
nvm alias default 20

# 验证安装
node --version   # 应显示 v20.x.x
npm --version    # 应显示 10.x.x
```

### 备选方式：直接安装

访问 https://nodejs.org 下载 LTS 版本安装包。

---

## 2️⃣ 安装包管理器

npm 已随 Node.js 安装。推荐额外安装 pnpm（更快、更省空间）：

```bash
# 安装 pnpm
npm install -g pnpm

# 验证
pnpm --version
```

---

## 3️⃣ 安装 Git

```bash
# 检查是否已安装
git --version

# 如果未安装，使用 Homebrew
brew install git

# 配置用户信息
git config --global user.name "你的名字"
git config --global user.email "your@email.com"
```

---

## 4️⃣ 安装 Android Studio

### 下载安装

1. 访问 https://developer.android.com/studio
2. 下载 macOS 版本
3. 安装并打开

### 配置步骤

#### 4.1 安装 Android SDK

打开 Android Studio → Settings → Languages & Frameworks → Android SDK：

```
SDK Platforms 标签：
  ☑️ Android 14 (API 34)  ← 推荐
  ☑️ Android 13 (API 33)

SDK Tools 标签：
  ☑️ Android SDK Build-Tools 34
  ☑️ Android SDK Command-line Tools
  ☑️ Android Emulator
  ☑️ Android SDK Platform-Tools
```

#### 4.2 配置环境变量

编辑 `~/.zshrc` 文件：

```bash
# Android SDK 路径
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
export PATH=$PATH:$ANDROID_HOME/tools
export PATH=$PATH:$ANDROID_HOME/tools/bin
```

使配置生效：

```bash
source ~/.zshrc

# 验证
adb --version
emulator -list-avds
```

#### 4.3 创建 Android 模拟器

1. Android Studio → Tools → Device Manager
2. 点击 "Create Device"
3. 选择设备：Pixel 7（推荐）
4. 选择系统镜像：API 34 (Android 14)
5. 完成创建

---

## 5️⃣ 安装 Xcode（iOS 开发）

### 安装

```bash
# 从 App Store 安装 Xcode
# 或使用命令行
xcode-select --install
```

### 配置

```bash
# 打开 Xcode，同意许可协议
sudo xcodebuild -license accept

# 安装 iOS 模拟器
# Xcode → Settings → Platforms → 下载 iOS 17.x
```

### 安装 CocoaPods（iOS 依赖管理）

```bash
# 安装 CocoaPods
sudo gem install cocoapods

# 或使用 Homebrew
brew install cocoapods

# 验证
pod --version
```

---

## 6️⃣ Expo CLI 说明

> ⚠️ **重要**：新版 Expo 不再需要全局安装 `expo-cli`，直接使用 `npx expo` 即可。

### 使用方式

```bash
# 不需要全局安装，直接使用 npx
npx expo start          # 启动开发服务器
npx expo start --android  # 在 Android 运行
npx expo start --ios      # 在 iOS 运行

# 如果需要全局安装 eas-cli（用于构建和发布）
npm install -g eas-cli

# 验证
npx expo --version
eas --version
```

### 创建 Expo 账号（可选但推荐）

```bash
# 注册账号
npx expo register

# 或登录
npx expo login
```

---

## 7️⃣ 安装 VS Code 插件

### 必装插件

```
1. ESLint
   ID: dbaeumer.vscode-eslint
   用途：代码规范检查

2. Prettier
   ID: esbenp.prettier-vscode
   用途：代码格式化

3. TypeScript Importer
   ID: ms-vscode.vscode-typescript-next
   用途：TypeScript 支持

4. React Native Tools
   ID: msjsdiag.vscode-react-native
   用途：React Native 调试

5. Expo Tools
   ID: expo.vscode-expo-tools
   用途：Expo 配置支持

6. SQLite Viewer
   ID: qwtel.sqlite-viewer
   用途：查看数据库文件

7. Color Highlight
   ID: naumovs.color-highlight
   用途：颜色预览
```

### 推荐插件

```
1. GitLens
   ID: eamodio.gitlens
   用途：Git 历史查看

2. Error Lens
   ID: usernamehw.errorlens
   用途：行内错误显示

3. Auto Rename Tag
   ID: formulahendry.auto-rename-tag
   用途：自动重命名标签

4. Path Intellisense
   ID: christian-kohler.path-intellisense
   用途：路径自动补全
```

---

## 8️⃣ 安装手机调试 App

### Android 真机

1. 在手机上安装 **Expo Go**
   - Google Play 商店搜索 "Expo Go"
   - 或访问 https://expo.dev/go

### iOS 真机

1. 在 iPhone 上安装 **Expo Go**
   - App Store 搜索 "Expo Go"

### 真机调试配置

#### Android 真机

1. 手机开启「开发者选项」
   - 设置 → 关于手机 → 连续点击「版本号」7 次
2. 开启「USB 调试」
   - 设置 → 开发者选项 → USB 调试
3. 用 USB 线连接电脑
4. 手机上允许 USB 调试

#### iOS 真机

1. 用 USB 线连接 iPhone 到 Mac
2. 在 Xcode 中信任设备
3. 在 iPhone 上信任电脑

---

## 9️⃣ 验证环境

创建一个验证脚本：

```bash
#!/bin/bash
# save as check-env.sh

echo "=== Healthora Fit 环境检查 ==="
echo ""

# Node.js
echo "📦 Node.js:"
node --version
echo ""

# npm
echo "📦 npm:"
npm --version
echo ""

# Git
echo "📦 Git:"
git --version
echo ""

# Java
echo "☕ Java:"
java -version 2>&1 | head -1
echo ""

# Android SDK
echo "🤖 Android SDK:"
if [ -d "$ANDROID_HOME" ]; then
  echo "  ✅ ANDROID_HOME: $ANDROID_HOME"
  adb --version | head -1
else
  echo "  ❌ ANDROID_HOME 未设置"
fi
echo ""

# Xcode
echo "🍎 Xcode:"
xcodebuild -version 2>/dev/null | head -1 || echo "  ❌ 未安装"
echo ""

# CocoaPods
echo "📦 CocoaPods:"
pod --version 2>/dev/null || echo "  ❌ 未安装"
echo ""

# Expo CLI (npx expo)
echo "🚀 Expo CLI:"
npx expo --version 2>/dev/null || echo "  ❌ 需要运行 npx expo"
echo ""

# Android Emulator
echo "📱 Android Emulator:"
emulator -list-avds 2>/dev/null || echo "  ❌ 无模拟器"
echo ""

echo "=== 检查完成 ==="
```

运行验证：

```bash
chmod +x check-env.sh
./check-env.sh
```

---

## 🔟 项目初始化

环境准备好后，执行以下命令初始化项目：

```bash
# 进入项目目录
cd /Users/may/Documents/Mydata/programming/healthora-fit

# 创建 Expo 项目（如果还没有）
npx create-expo-app@latest . --template blank-typescript

# 安装核心依赖
npx expo install expo-router expo-sqlite expo-camera expo-image-picker expo-file-system expo-linear-gradient react-native-reanimated react-native-gesture-handler react-native-safe-area-context react-native-screens zustand date-fns

# 安装开发依赖
npm install -D @types/react typescript eslint prettier

# 启动开发服务器
npx expo start
```

---

## 📱 运行项目

### 在模拟器上运行

```bash
# 启动 Expo 开发服务器
npx expo start

# 按 a 在 Android 模拟器运行
# 按 i 在 iOS 模拟器运行
```

### 在真机上运行

```bash
# 启动 Expo 开发服务器
npx expo start

# 手机扫描终端中的二维码
# 确保手机和电脑在同一 WiFi 网络
```

---

## 🛠️ 常见问题

### Q1: Android 模拟器启动慢

```bash
# 启用硬件加速
# Android Studio → Settings → Emulator → Use Host GPU
```

### Q2: iOS 模拟器找不到

```bash
# 打开 Xcode → Settings → Platforms
# 下载需要的 iOS 版本
```

### Q3: Expo Go 连接失败

```bash
# 确保手机和电脑在同一 WiFi
# 尝试使用隧道模式
npx expo start --tunnel
```

### Q4: Java 版本问题

```bash
# 安装 Java 17
brew install openjdk@17

# 设置 JAVA_HOME
export JAVA_HOME=$(/usr/libexec/java_home -v 17)
```

### Q5: CocoaPods 安装失败

```bash
# 清除缓存
sudo gem cleanup cocoapods
pod cache clean --all

# 重新安装
sudo gem install cocoapods
```

---

## 📦 项目依赖说明

### 核心依赖

| 包名                           | 用途          |
| ------------------------------ | ------------- |
| expo                           | Expo 核心框架 |
| expo-router                    | 文件系统路由  |
| expo-sqlite                    | SQLite 数据库 |
| expo-camera                    | 相机功能      |
| expo-image-picker              | 图片选择      |
| expo-file-system               | 文件系统操作  |
| expo-linear-gradient           | 渐变效果      |
| react-native-reanimated        | 动画库        |
| react-native-gesture-handler   | 手势处理      |
| react-native-safe-area-context | 安全区域      |
| react-native-screens           | 原生屏幕      |
| zustand                        | 状态管理      |
| date-fns                       | 日期处理      |

### 可选依赖（后续安装）

| 包名                | 用途                   | 安装时机   |
| ------------------- | ---------------------- | ---------- |
| react-native-health | iOS HealthKit          | Phase 13   |
| expo-health-connect | Android Health Connect | Phase 13   |
| @shopify/flash-list | 高性能列表             | 性能优化时 |
| victory-native      | 图表库                 | Phase 11   |

---

## ✅ 安装检查清单

完成以下检查，确保环境就绪：

### 基础环境

- [ ] Node.js 18+ 已安装
- [ ] npm/pnpm 已安装
- [ ] Git 已安装并配置

### Android 开发

- [ ] Android Studio 已安装
- [ ] Android SDK (API 34) 已安装
- [ ] ANDROID_HOME 环境变量已设置
- [ ] Android 模拟器已创建
- [ ] adb 命令可用

### iOS 开发（macOS）

- [ ] Xcode 15+ 已安装
- [ ] iOS 模拟器已下载
- [ ] CocoaPods 已安装

### 开发工具

- [ ] VS Code 已安装
- [ ] 必装插件已安装
- [ ] npx expo 可用（无需全局安装）

### 调试设备

- [ ] Android 模拟器可启动
- [ ] iOS 模拟器可启动
- [ ] 或 Expo Go 已安装在手机上

---

_文档版本：v1.0_
_最后更新：2026-06-03_

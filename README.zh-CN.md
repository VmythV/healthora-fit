<div align="center">

# Healthora Fit

**Health + Aura = 健康光环 🌿**

一款智能健康管理应用，帮助你轻松追踪饮食、运动和体重，通过 AI 技术让记录更简单。

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) | [中文](README.zh-CN.md)

</div>

---

## ✨ 功能特性

### 🍽️ 饮食记录
- 拍照识别食物，AI 自动分析营养成分
- 记录每餐卡路里、蛋白质、碳水、脂肪
- 支持手动编辑修正识别结果

### 🏃 运动记录
- 支持多种运动类型（跑步、骑行、游泳、力量训练等）
- 截图识别运动数据
- 自动计算消耗卡路里

### ⚖️ 体重追踪
- 记录每日体重变化
- 设置目标体重，追踪进度
- 体重趋势图表展示

### 📊 数据分析
- 按周/月/年查看趋势
- 营养成分比例分析
- 运动类型分布统计

### 🤖 AI 配置
- 支持 OpenAI 协议的 API
- 可配置 API 地址、Key、模型
- 灵活对接不同 AI 服务

## 🛠️ 技术栈

| 技术 | 版本 | 用途 |
|------|------|------|
| Expo | SDK 54 | 开发框架 |
| React Native | 0.81.5 | 移动端框架 |
| React | 19.1.0 | UI 库 |
| TypeScript | 5.9.2 | 类型安全 |
| Expo Router | 6.0.24 | 文件路由 |
| SQLite | 16.0.10 | 本地存储 |
| Zustand | 5.0.14 | 状态管理 |

## 🚀 快速开始

### 环境要求

- Node.js 18+
- npm 或 pnpm
- Android Studio（Android 开发）
- Xcode（iOS 开发，仅 macOS）

### 安装

```bash
# 克隆项目
git clone https://github.com/your-username/healthora-fit.git
cd healthora-fit

# 安装依赖
npm install

# 启动开发服务器
npx expo start
```

### 运行

```bash
# Android 模拟器
npx expo start --android

# iOS 模拟器
npx expo start --ios

# 手机调试（扫描二维码）
npx expo start
```

## 📁 项目结构

```
healthora-fit/
├── app/                    # 页面（Expo Router）
│   ├── (tabs)/            # 底部导航页面
│   ├── diet/              # 饮食记录
│   ├── exercise/          # 运动记录
│   ├── weight/            # 体重记录
│   └── settings/          # 设置页面
├── components/            # 可复用组件
├── constants/             # 常量定义（主题、类型）
├── database/              # SQLite 数据库层
│   ├── schema.ts          # 表结构定义
│   ├── migrations.ts      # 数据库迁移
│   └── queries/           # 查询函数
├── hooks/                 # 自定义 Hooks
├── services/              # 服务层（AI、健康数据）
├── stores/                # 状态管理（Zustand）
├── types/                 # TypeScript 类型
└── utils/                 # 工具函数
```

## 📖 开发指南

### 路径别名

```typescript
@/components  → ./components
@/constants   → ./constants
@/database    → ./database
@/hooks       → ./hooks
@/services    → ./services
@/stores      → ./stores
@/types       → ./types
@/utils       → ./utils
```

### 数据库

使用 SQLite 本地存储，表结构定义在 `database/schema.ts`。

```typescript
import { database } from '@/database';
import { dietQueries } from '@/database/queries';

// 初始化数据库
await database.initialize();

// 查询今日饮食记录
const todayRecords = await dietQueries.getToday();
```

### 主题

```typescript
import { theme } from '@/constants/theme';

// 使用主题颜色
<View style={{ backgroundColor: theme.colors.primary.main }} />

// 使用间距
<View style={{ padding: theme.spacing.base }} />
```

## 📄 文档

详细文档位于 `docs/` 目录：

- [需求规格](docs/requirements.md)
- [设计规范](docs/design.md)
- [技术架构](docs/architecture.md)
- [数据库设计](docs/database.md)
- [开发任务](docs/todolist.md)
- [开发进度](docs/progress/)

## 🤝 贡献

欢迎提交 Pull Request！

## 📄 许可证

本项目基于 MIT 许可证 - 查看 [LICENSE](LICENSE) 文件了解详情。

---

<div align="center">

**Healthora Fit** - 让健康管理更简单 🌿

</div>

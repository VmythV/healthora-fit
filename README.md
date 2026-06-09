<div align="center">

# Healthora Fit

**Health + Aura = Healthy Aura 🌿**

An intelligent health tracking app that helps you effortlessly track diet, exercise, and weight with AI-powered food recognition.

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[![GitHub stars](https://img.shields.io/github/stars/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit/stargazers)
[![GitHub forks](https://img.shields.io/github/forks/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit/network/members)
[![GitHub issues](https://img.shields.io/github/issues/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit/issues)
[![GitHub PRs](https://img.shields.io/github/issues-pr/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit/pulls)
[![Last commit](https://img.shields.io/github/last-commit/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit/commits/main)
[![Commit activity](https://img.shields.io/github/commit-activity/m/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit/commits/main)
[![Contributors](https://img.shields.io/github/contributors/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit/graphs/contributors)

[English](README.md) | [中文](README.zh-CN.md)

</div>

---

## 📊 Repository Stats

<div align="center">

### 📈 Contribution Graph (Light)

![VmythV's GitHub Chart](https://ghchart.rshah.org/VmythV)

</div>

### 🛠️ Project Activity

[![Total Commits](https://img.shields.io/github/commit-count/total/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit/commits/main)
[![Commits This Year](https://img.shields.io/github/commit-activity/y/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit/commits/main)
[![Code Size](https://img.shields.io/github/languages/code-size/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit)
[![Repo Size](https://img.shields.io/github/repo-size/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit)
[![Closed Issues](https://img.shields.io/github/issues-closed-raw/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit/issues?q=is%3Aissue+is%3Aclosed)
[![Closed PRs](https://img.shields.io/github/issues-pr-closed/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit/pulls?q=is%3Apr+is%3Aclosed)
[![Top Language](https://img.shields.io/github/languages/top/VmythV/healthora-fit?style=flat&logo=typescript)](https://github.com/VmythV/healthora-fit)
[![Languages Count](https://img.shields.io/github/languages/count/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit)
[![Created](https://img.shields.io/github/created-at/VmythV/healthora-fit?style=flat&logo=github)](https://github.com/VmythV/healthora-fit)

📜 [View all commits →](https://github.com/VmythV/healthora-fit/commits/main) &nbsp;•&nbsp; 📈 [Repo Insights →](https://github.com/VmythV/healthora-fit/pulse)

## ✨ Features

### 🍽️ Diet Tracking

- Snap a photo to identify food with AI nutrition analysis
- Track calories, protein, carbs, and fat per meal
- Manual editing for correction

### 🏃 Exercise Logging

- Support multiple exercise types (running, cycling, swimming, strength training, etc.)
- Screenshot recognition for exercise data
- Automatic calorie burn calculation

### ⚖️ Weight Management

- Record daily weight changes
- Set target weight and track progress
- Weight trend visualization

### 📊 Data Analysis

- Weekly/Monthly/Yearly trend views
- Nutrition breakdown charts
- Exercise type distribution

### 🤖 AI Configuration

- OpenAI-compatible API support
- Configurable endpoint, API key, and model
- Flexible integration with various AI services

## 🛠️ Tech Stack

| Technology   | Version | Purpose               |
| ------------ | ------- | --------------------- |
| Expo         | SDK 54  | Development Framework |
| React Native | 0.81.5  | Mobile Framework      |
| React        | 19.1.0  | UI Library            |
| TypeScript   | 5.9.2   | Type Safety           |
| Expo Router  | 6.0.24  | File-based Routing    |
| SQLite       | 16.0.10 | Local Storage         |
| Zustand      | 5.0.14  | State Management      |

## 🚀 Quick Start

### Prerequisites

- Node.js 18+
- npm or pnpm
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-username/healthora-fit.git
cd healthora-fit

# Install dependencies
npm install

# Start development server
npx expo start
```

### Running

```bash
# Android emulator
npx expo start --android

# iOS simulator
npx expo start --ios

# Scan QR code with Expo Go app
npx expo start
```

## 📁 Project Structure

```
healthora-fit/
├── app/                    # Pages (Expo Router)
│   ├── (tabs)/            # Bottom tab navigation
│   ├── diet/              # Diet recording
│   ├── exercise/          # Exercise recording
│   ├── weight/            # Weight tracking
│   └── settings/          # Settings
├── components/            # Reusable components
├── constants/             # Constants (theme, types)
├── database/              # SQLite layer
│   ├── schema.ts          # Table definitions
│   ├── migrations.ts      # Database migrations
│   └── queries/           # CRUD operations
├── hooks/                 # Custom hooks
├── services/              # Services (AI, Health Connect)
├── stores/                # Zustand stores
├── types/                 # TypeScript types
└── utils/                 # Utility functions
```

## 📖 Development

### Path Aliases

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

### Database

Local SQLite storage with typed queries:

```typescript
import { database } from '@/database'
import { dietQueries } from '@/database/queries'

// Initialize database
await database.initialize()

// Query today's diet records
const todayRecords = await dietQueries.getToday()
```

### Theming

```typescript
import { theme } from '@/constants/theme';

// Use theme colors
<View style={{ backgroundColor: theme.colors.primary.main }} />

// Use spacing
<View style={{ padding: theme.spacing.base }} />
```

## 📚 Documentation

Detailed documentation is available in the `docs/` directory:

- [Requirements](docs/requirements.md)
- [Design Guidelines](docs/design.md)
- [Architecture](docs/architecture.md)
- [Database Design](docs/database.md)
- [Development Tasks](docs/todolist.md)
- [Progress Log](docs/progress/)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Healthora Fit** - Making health management simple 🌿

</div>

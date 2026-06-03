<div align="center">

# Healthora Fit

**Health + Aura = Healthy Aura 🌿**

An intelligent health tracking app that helps you effortlessly track diet, exercise, and weight with AI-powered food recognition.

[![Expo](https://img.shields.io/badge/Expo-SDK%2054-000020?style=flat&logo=expo)](https://expo.dev/)
[![React Native](https://img.shields.io/badge/React%20Native-0.81.5-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.2-3178C6?style=flat&logo=typescript)](https://www.typescriptlang.org/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[English](README.md) | [中文](README.zh-CN.md)

</div>

---

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

| Technology | Version | Purpose |
|------------|---------|---------|
| Expo | SDK 54 | Development Framework |
| React Native | 0.81.5 | Mobile Framework |
| React | 19.1.0 | UI Library |
| TypeScript | 5.9.2 | Type Safety |
| Expo Router | 6.0.24 | File-based Routing |
| SQLite | 16.0.10 | Local Storage |
| Zustand | 5.0.14 | State Management |

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
import { database } from '@/database';
import { dietQueries } from '@/database/queries';

// Initialize database
await database.initialize();

// Query today's diet records
const todayRecords = await dietQueries.getToday();
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

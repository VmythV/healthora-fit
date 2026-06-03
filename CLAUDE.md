# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Healthora Fit** is a health tracking mobile app for diet, exercise, and weight management. Built with React Native + Expo (SDK 54), it features AI-powered food recognition and cross-platform support (Android + iOS).

## Commands

```bash
# Development
npx expo start              # Start dev server
npx expo start --android    # Run on Android
npx expo start --ios        # Run on iOS
npx expo start --clear      # Clear cache and start

# No test/lint commands configured yet
```

## Architecture

### Tech Stack
- **Framework**: Expo SDK 54, React Native 0.81.5, React 19.1.0
- **Navigation**: Expo Router (file-based routing)
- **Database**: expo-sqlite (local SQLite)
- **State Management**: Zustand
- **Language**: TypeScript (strict mode)

### Path Aliases (tsconfig.json)
```
@/*           → ./*
@components/* → ./components/*
@constants/*  → ./constants/*
@database/*   → ./database/*
@hooks/*      → ./hooks/*
@services/*   → ./services/*
@stores/*     → ./stores/*
@types/*      → ./types/*
@utils/*      → ./utils/*
```

### Directory Structure
```
app/                    # Expo Router pages (file-based routing)
├── (tabs)/            # Bottom tab navigation screens
├── diet/              # Diet recording pages
├── exercise/          # Exercise recording pages
├── weight/            # Weight recording pages
└── settings/          # Settings pages

database/               # SQLite database layer
├── index.ts           # Database singleton, initialization
├── schema.ts          # Table definitions, indexes, triggers
├── migrations.ts      # Version management
└── queries/           # CRUD operations per entity

constants/              # Theme, exercise types, meal types
types/                  # TypeScript interfaces
stores/                 # Zustand state stores (pending)
services/               # AI, Health Connect, export (pending)
```

### Key Patterns

1. **Database Access**: Import `database` singleton from `@/database`, call `getDatabase()` for SQLite instance. Query functions are in `database/queries/`.

2. **Routing**: Expo Router file-based. Pages in `app/` directory. Tab screens in `app/(tabs)/`. Modal screens configured in `app/_layout.tsx`.

3. **Theming**: Import from `@/constants/theme`. Use `theme.colors`, `theme.spacing`, `theme.borderRadius`, `theme.fontSize`, `theme.shadow`.

4. **Type Safety**: All data models defined in `types/` directory. Database queries return typed results.

5. **Internationalization (i18n)**: All user-facing text must use i18n. See [Internationalization Guidelines](#internationalization-guidelines).

### Database Tables
- `diet_records` - Food intake with nutrition data (JSON foods field)
- `exercise_records` - Exercise with type, duration, calories
- `weight_records` - Weight measurements over time
- `goals` - User targets (weight, calories, exercise)
- `ai_config` - API configuration for AI food recognition
- `sync_log` - Health Connect sync tracking

## Development Workflow

Use `/iterate` skill for structured development cycles:
1. Reviews TODOLIST for next task
2. Confirms scope with user
3. Implements code
4. Updates TODOLIST and progress log (`docs/progress/YYYY-MM-DD.md`)
5. Git commits with conventional format

## Important Notes

- **Expo SDK 54**: Do not upgrade without checking Expo Go compatibility
- **No backend**: All data stored locally in SQLite
- **AI Config**: Users configure their own OpenAI-compatible API endpoint/key

## Internationalization Guidelines

### Principles

1. **All user-facing text must be internationalized**
   - No hardcoded strings in components
   - Use `t('key')` function for all text
   - Keep translations in `constants/locales/` directory

2. **Translation file structure**
   ```
   constants/
   ├── i18n.ts           # i18n configuration
   └── locales/
       ├── zh-CN.json    # Chinese translations
       └── en.json       # English translations
   ```

3. **How to use i18n in components**
   ```typescript
   import { useI18n } from '@/hooks/useI18n';

   export default function MyComponent() {
     const { t, locale, setLocale } = useI18n();

     return (
       <View>
         <Text>{t('home.title')}</Text>
         <Button onPress={() => setLocale('en')}>English</Button>
       </View>
     );
   }
   ```

4. **Translation key naming convention**
   - Use dot notation for hierarchy: `settings.ai.title`
   - Group by feature: `diet.*`, `exercise.*`, `weight.*`
   - Common strings: `common.ok`, `common.cancel`

5. **Adding new text**
   - Add key to both `zh-CN.json` and `en.json`
   - Use descriptive keys that indicate context
   - Keep translations in sync

6. **Supported languages**
   - `zh-CN` - Simplified Chinese (default)
   - `en` - English

7. **Language persistence**
   - User's language choice is saved in AsyncStorage
   - Default language follows device locale

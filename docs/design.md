# Healthora Fit — 设计规范文档 v1.0

> **设计理念**：简约但不简单，精致有品质感
> **设计风格**：扁平简洁 + 线条极简图标 + 克制优雅动画
> **最后更新**：2026-06-03

---

## 📐 设计原则

### 核心原则

1. **简约不简单**
   - 去除多余装饰，保留核心信息
   - 每个元素都有存在的意义
   - 留白是最好的设计

2. **一致性**
   - 统一的颜色、字体、间距
   - 统一的交互模式
   - 统一的视觉语言

3. **可读性**
   - 清晰的信息层级
   - 足够的对比度
   - 合适的字体大小

4. **品牌感**
   - Healthora 健康光环概念
   - 清新自然的视觉感受
   - 专业可信的健康管理工具

---

## 🎨 颜色系统

### 品牌色

```
主色（翡翠绿）：
  Primary 50:  #ECFDF5  ← 最浅背景
  Primary 100: #D1FAE5
  Primary 200: #A7F3D0
  Primary 300: #6EE7B7
  Primary 400: #34D399
  Primary 500: #10B981  ← 主色
  Primary 600: #059669
  Primary 700: #047857
  Primary 800: #065F46
  Primary 900: #064E3B  ← 最深

辅助色（天蓝色）：
  Secondary 50:  #EFF6FF
  Secondary 100: #DBEAFE
  Secondary 200: #BFDBFE
  Secondary 300: #93C5FD
  Secondary 400: #60A5FA
  Secondary 500: #3B82F6  ← 辅助色
  Secondary 600: #2563EB
  Secondary 700: #1D4ED8
  Secondary 800: #1E40AF
  Secondary 900: #1E3A8A

中性色：
  Gray 50:  #F9FAFB
  Gray 100: #F3F4F6
  Gray 200: #E5E7EB
  Gray 300: #D1D5DB
  Gray 400: #9CA3AF
  Gray 500: #6B7280
  Gray 600: #4B5563
  Gray 700: #374151
  Gray 800: #1F2937
  Gray 900: #111827
```

### 语义色

```
成功 Success：
  Light: #D1FAE5
  Main:  #10B981
  Dark:  #065F46

警告 Warning：
  Light: #FEF3C7
  Main:  #F59E0B
  Dark:  #92400E

错误 Error：
  Light: #FEE2E2
  Main:  #EF4444
  Dark:  #991B1B

信息 Info：
  Light: #DBEAFE
  Main:  #3B82F6
  Dark:  #1E40AF
```

### 浅色模式配色方案

```typescript
export const lightTheme = {
  // 背景
  background: {
    primary: '#FFFFFF',      // 主背景
    secondary: '#F9FAFB',    // 次级背景（卡片、区块）
    tertiary: '#F3F4F6',     // 三级背景（输入框、标签）
  },

  // 文字
  text: {
    primary: '#111827',      // 主要文字
    secondary: '#4B5563',    // 次要文字
    tertiary: '#9CA3AF',     // 辅助文字（占位符、禁用）
    inverse: '#FFFFFF',      // 反色文字（深色背景上）
  },

  // 边框
  border: {
    light: '#E5E7EB',        // 轻边框
    main: '#D1D5DB',         // 主边框
    dark: '#9CA3AF',         // 深边框
  },

  // 品牌色应用
  primary: {
    main: '#10B981',         // 主色
    light: '#D1FAE5',        // 浅色背景
    dark: '#059669',         // 深色/按压态
    text: '#FFFFFF',         // 主色上的文字
  },

  // 辅助色应用
  secondary: {
    main: '#3B82F6',
    light: '#DBEAFE',
    dark: '#2563EB',
    text: '#FFFFFF',
  },

  // 状态色
  success: '#10B981',
  warning: '#F59E0B',
  error: '#EF4444',
  info: '#3B82F6',

  // 卡片
  card: {
    background: '#FFFFFF',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
  },
};
```

### 深色模式配色方案

```typescript
export const darkTheme = {
  // 背景
  background: {
    primary: '#111827',      // 主背景
    secondary: '#1F2937',    // 次级背景
    tertiary: '#374151',     // 三级背景
  },

  // 文字
  text: {
    primary: '#F9FAFB',      // 主要文字
    secondary: '#D1D5DB',    // 次要文字
    tertiary: '#9CA3AF',     // 辅助文字
    inverse: '#111827',      // 反色文字
  },

  // 边框
  border: {
    light: '#374151',
    main: '#4B5563',
    dark: '#6B7280',
  },

  // 品牌色应用（深色模式下略微调整亮度）
  primary: {
    main: '#34D399',         // 稍微提亮
    light: '#065F46',        // 深色背景
    dark: '#10B981',
    text: '#111827',
  },

  // 辅助色应用
  secondary: {
    main: '#60A5FA',
    light: '#1E40AF',
    dark: '#3B82F6',
    text: '#111827',
  },

  // 状态色
  success: '#34D399',
  warning: '#FBBF24',
  error: '#F87171',
  info: '#60A5FA',

  // 卡片
  card: {
    background: '#1F2937',
    shadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
  },
};
```

### 主题切换机制

```typescript
// 主题配置类型
interface ThemeConfig {
  id: string;
  name: string;
  colors: typeof lightTheme;
  isDark: boolean;
}

// 预设主题
export const THEMES: ThemeConfig[] = [
  { id: 'light', name: '浅色', colors: lightTheme, isDark: false },
  { id: 'dark', name: '深色', colors: darkTheme, isDark: true },
  // 未来可扩展更多主题
  // { id: 'ocean', name: '海洋', colors: oceanTheme, isDark: false },
  // { id: 'sunset', name: '日落', colors: sunsetTheme, isDark: false },
];

// 使用方式
const { theme, setTheme } = useTheme();

// 在组件中使用
<View style={{ backgroundColor: theme.background.primary }}>
  <Text style={{ color: theme.text.primary }}>Hello</Text>
</View>
```

---

## 📝 字体系统

### 字体选择

```typescript
export const fontFamily = {
  // 中文字体
  chinese: {
    ios: 'PingFang SC',
    android: 'Noto Sans SC',
    fallback: 'sans-serif',
  },

  // 英文字体
  english: {
    ios: 'SF Pro Display',
    android: 'Roboto',
    fallback: 'sans-serif',
  },

  // 数字字体（等宽，便于对齐）
  mono: {
    ios: 'SF Mono',
    android: 'Roboto Mono',
    fallback: 'monospace',
  },
};
```

### 字号梯度

```typescript
export const fontSize = {
  // 标题
  h1: 28,      // 大标题
  h2: 24,      // 中标题
  h3: 20,      // 小标题
  h4: 18,      // 最小标题

  // 正文
  bodyLg: 16,  // 大正文
  body: 14,    // 正文（默认）
  bodySm: 12,  // 小正文

  // 辅助
  caption: 11, // 说明文字
  tiny: 10,    // 最小文字
};

// 使用示例
const styles = StyleSheet.create({
  title: {
    fontSize: fontSize.h2,
    fontWeight: '600',
    lineHeight: fontSize.h2 * 1.4,
  },
  body: {
    fontSize: fontSize.body,
    fontWeight: '400',
    lineHeight: fontSize.body * 1.6,
  },
});
```

### 字重

```typescript
export const fontWeight = {
  regular: '400',    // 正文
  medium: '500',     // 强调
  semibold: '600',   // 标题
  bold: '700',       // 重点
};
```

### 行高

```typescript
export const lineHeight = {
  tight: 1.2,    // 紧凑（标题）
  normal: 1.5,   // 正常（正文）
  relaxed: 1.8,  // 宽松（长文本）
};
```

---

## 📏 间距系统

### 基础单位

```typescript
// 基础间距单位：4px
export const BASE_UNIT = 4;

// 间距梯度
export const spacing = {
  xs: 4,       // 1x - 最小间距
  sm: 8,       // 2x - 小间距
  md: 12,      // 3x - 中间距
  base: 16,    // 4x - 基础间距
  lg: 20,      // 5x - 大间距
  xl: 24,      // 6x - 特大间距
  '2xl': 32,   // 8x
  '3xl': 40,   // 10x
  '4xl': 48,   // 12x
  '5xl': 64,   // 16x
};

// 使用场景
export const spacingUsage = {
  // 内边距
  paddingSmall: spacing.sm,      // 8px - 小组件
  paddingMedium: spacing.base,   // 16px - 卡片、列表项
  paddingLarge: spacing.xl,      // 24px - 页面边距

  // 外边距
  marginSmall: spacing.sm,       // 8px - 紧凑元素间距
  marginMedium: spacing.base,    // 16px - 标准元素间距
  marginLarge: spacing['2xl'],   // 32px - 区块间距

  // 间距
  gapSmall: spacing.sm,          // 8px - 图标与文字
  gapMedium: spacing.md,         // 12px - 列表项之间
  gapLarge: spacing.base,        // 16px - 区块内部
};
```

### 常用间距组合

```typescript
// 页面边距
export const pageMargin = {
  horizontal: spacing.xl,  // 24px
  vertical: spacing.base,  // 16px
};

// 卡片内边距
export const cardPadding = {
  small: spacing.sm,       // 8px
  medium: spacing.base,    // 16px
  large: spacing.xl,       // 24px
};

// 列表项间距
export const listItemGap = spacing.md;  // 12px
```

---

## 🔲 圆角系统

```typescript
export const borderRadius = {
  none: 0,
  sm: 4,       // 小圆角（标签、小按钮）
  md: 8,       // 中圆角（输入框、卡片）
  lg: 12,      // 大圆角（大卡片）
  xl: 16,      // 特大圆角（弹窗）
  '2xl': 24,   // 胶囊按钮
  full: 9999,  // 全圆角（圆形）
};

// 使用场景
export const borderRadiusUsage = {
  button: borderRadius.md,        // 8px
  input: borderRadius.md,         // 8px
  card: borderRadius.lg,          // 12px
  modal: borderRadius.xl,         // 16px
  avatar: borderRadius.full,      // 圆形
  tag: borderRadius['2xl'],       // 24px - 胶囊形
};
```

---

## 🌓 阴影系统

> 采用扁平简洁风格，阴影使用克制

```typescript
export const shadow = {
  // 无阴影
  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  // 轻微阴影（卡片）
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },

  // 中等阴影（悬浮元素）
  md: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },

  // 较大阴影（弹窗）
  lg: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
  },
};

// 深色模式阴影（更明显）
export const darkShadow = {
  sm: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 2,
  },
  // ...
};
```

---

## ✨ 动画规范

### 动画原则

1. **克制** — 动画是为了引导注意力，不是炫技
2. **快速** — 大多数动画在 200-300ms 完成
3. **有意义** — 每个动画都有明确的目的
4. **一致** — 相同类型的元素使用相同的动画

### 动画时长

```typescript
export const duration = {
  instant: 100,    // 即时反馈（按钮按压）
  fast: 200,       // 快速动画（切换、展开）
  normal: 300,     // 正常动画（页面转场）
  slow: 500,       // 慢速动画（复杂动画）
};
```

### 缓动函数

```typescript
export const easing = {
  // 默认缓动（舒适自然）
  default: Easing.bezier(0.4, 0, 0.2, 1),

  // 进入（加速）
  easeIn: Easing.bezier(0.4, 0, 1, 1),

  // 退出（减速）
  easeOut: Easing.bezier(0, 0, 0.2, 1),

  // 弹性（活泼）
  bounce: Easing.bezier(0.68, -0.55, 0.265, 1.55),
};
```

### 常用动画模式

```typescript
// 淡入淡出
export const fadeInOut = {
  from: { opacity: 0 },
  to: { opacity: 1 },
  duration: duration.fast,
  easing: easing.easeOut,
};

// 从下方滑入
export const slideUp = {
  from: { transform: [{ translateY: 20 }], opacity: 0 },
  to: { transform: [{ translateY: 0 }], opacity: 1 },
  duration: duration.normal,
  easing: easing.easeOut,
};

// 缩放弹入
export const scaleIn = {
  from: { transform: [{ scale: 0.95 }], opacity: 0 },
  to: { transform: [{ scale: 1 }], opacity: 1 },
  duration: duration.fast,
  easing: easing.easeOut,
};

// 按压缩放（按钮反馈）
export const pressScale = {
  from: { transform: [{ scale: 1 }] },
  to: { transform: [{ scale: 0.98 }] },
  duration: duration.instant,
};
```

### 页面转场动画

```typescript
// Tab 切换 - 淡入淡出
export const tabTransition = {
  animation: 'fade',
  duration: duration.fast,
};

// Modal 弹出 - 从下方滑入
export const modalTransition = {
  animation: 'slide_from_bottom',
  duration: duration.normal,
};

// 详情页进入 - 从右侧滑入
export const detailTransition = {
  animation: 'slide_from_right',
  duration: duration.normal,
};
```

---

## 🎯 图标设计规范

### 设计风格

- **线条极简风**：使用 1.5-2px 线条
- **几何感**：基于基本几何形状
- **圆角处理**：线条末端和转角使用圆角
- **统一视觉重量**：所有图标看起来密度相近

### 图标尺寸

```typescript
export const iconSize = {
  xs: 16,      // 小图标（标签、辅助）
  sm: 20,      // 默认图标（列表项）
  md: 24,      // 中等图标（按钮）
  lg: 32,      // 大图标（功能入口）
  xl: 48,      // 特大图标（空状态）
};
```

### 图标网格

```
┌─────────────────────────────┐
│         24 x 24 px          │
│  ┌───────────────────────┐  │
│  │     安全区域 20px     │  │
│  │  ┌─────────────────┐  │  │
│  │  │                 │  │  │
│  │  │    图标内容      │  │  │
│  │  │                 │  │  │
│  │  └─────────────────┘  │  │
│  └───────────────────────┘  │
│        2px 边距             │
└─────────────────────────────┘
```

### 图标列表

#### 底部导航图标

```
首页（Home）
  ┌─────────┐
  │  ╭───╮  │
  │  │   │  │
  │  ╰───╯  │
  │    │    │
  │  ──┴──  │
  └─────────┘
  简化的房子轮廓，线条干净

日历（Calendar）
  ┌─────────┐
  │  ┌───┐  │
  │  │ ● │  │
  │  │   │  │
  │  └───┘  │
  │  │   │  │
  └─────────┘
  日历格子，中间有点标记

添加（Add / Plus）
  ┌─────────┐
  │         │
  │    │    │
  │  ──┼──  │
  │    │    │
  │         │
  └─────────┘
  简单的加号，线条稍粗

分析（Chart）
  ┌─────────┐
  │    │    │
  │  ▌ │▐   │
  │  ▌ │▐ ▌ │
  │  ▌ │▐ ▌ │
  │  ─┴─┴─  │
  └─────────┘
  简化的柱状图

设置（Settings）
  ┌─────────┐
  │   ╭─╮   │
  │  ─┤ ├─  │
  │   ╰─╯   │
  │   ╭─╮   │
  │  ─┤ ├─  │
  └─────────┘
  简化的齿轮/滑块
```

#### 功能图标

```
饮食（Food / Bowl）
  ┌─────────┐
  │         │
  │  ╭───╮  │
  │  │   │  │
  │  ╰───╯  │
  │    ┆    │
  └─────────┘
  碗的轮廓，上方有热气线条

运动（Exercise / Running）
  ┌─────────┐
  │    ○    │
  │   /│    │
  │    │    │
  │   / \   │
  │  /   \  │
  └─────────┘
  简化的人形跑步姿态

体重（Weight / Scale）
  ┌─────────┐
  │  ┌───┐  │
  │  │   │  │
  │  ├───┤  │
  │  │72 │  │
  │  └───┘  │
  └─────────┘
  体重秤轮廓，中间显示数字

相机（Camera）
  ┌─────────┐
  │  ┌───┐  │
  │  │ ○ │  │
  │  └───┘  │
  │         │
  │         │
  └─────────┘
  简化的相机轮廓

相册（Gallery）
  ┌─────────┐
  │  ┌───┐  │
  │  │ ╱ │  │
  │  │╱  │  │
  │  └───┘  │
  │         │
  └─────────┘
  带山和太阳的图片图标
```

#### 操作图标

```
编辑（Edit）
  ┌─────────┐
  │      ╱  │
  │    ╱    │
  │  ╱      │
  │ ╱       │
  │╱        │
  └─────────┘
  简化的铅笔对角线

删除（Delete / Trash）
  ┌─────────┐
  │  ┌───┐  │
  │  │   │  │
  │  ├───┤  │
  │  │   │  │
  │  └───┘  │
  └─────────┘
  简化的垃圾桶轮廓

返回（Back）
  ┌─────────┐
  │         │
  │  ←      │
  │         │
  │         │
  │         │
  └─────────┘
  简单的左箭头

关闭（Close）
  ┌─────────┐
  │         │
  │  ╲   ╱  │
  │    ╳    │
  │  ╱   ╲  │
  │         │
  └─────────┘
  简单的 X

确认（Check）
  ┌─────────┐
  │         │
  │      ╱  │
  │    ╱    │
  │  ╱      │
  │         │
  └─────────┘
  简单的勾
```

### 图标组件实现

```typescript
// 图标组件接口
interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

// 使用示例
<Icon name="home" size={24} color={theme.text.primary} />
<Icon name="add" size={32} color={theme.primary.main} />
```

---

## 🧩 组件规范

### Button 按钮

```
┌─────────────────────────────────────────────────────┐
│  按钮类型                                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  Primary Button（主要按钮）                          │
│  ┌─────────────────────────────────────────────┐   │
│  │              确认保存                        │   │
│  └─────────────────────────────────────────────┘   │
│  背景：Primary 500  文字：白色  圆角：8px           │
│                                                     │
│  Secondary Button（次要按钮）                        │
│  ┌─────────────────────────────────────────────┐   │
│  │              取消                            │   │
│  └─────────────────────────────────────────────┘   │
│  背景：Primary 100  文字：Primary 700  圆角：8px    │
│                                                     │
│  Ghost Button（幽灵按钮）                            │
│  ┌ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┐   │
│  │              更多                            │   │
│  └ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ┘   │
│  背景：透明  文字：Primary 600  边框：无            │
│                                                     │
│  Icon Button（图标按钮）                             │
│  ┌────┐                                            │
│  │ ✕  │  尺寸：40x40  圆角：全圆角                  │
│  └────┘  背景：Gray 100  图标：Gray 600            │
│                                                     │
└─────────────────────────────────────────────────────┘
```

```typescript
// 按钮尺寸
export const buttonSize = {
  sm: { height: 32, paddingHorizontal: 12, fontSize: 12 },
  md: { height: 40, paddingHorizontal: 16, fontSize: 14 },
  lg: { height: 48, paddingHorizontal: 24, fontSize: 16 },
};

// 按钮状态
export const buttonState = {
  default: { opacity: 1 },
  pressed: { opacity: 0.9, transform: [{ scale: 0.98 }] },
  disabled: { opacity: 0.5 },
  loading: { opacity: 0.8 },
};
```

### Input 输入框

```
┌─────────────────────────────────────────────────────┐
│  输入框类型                                          │
├─────────────────────────────────────────────────────┤
│
│  Text Input（文本输入）                              │
│  标签                                               │
│  ┌─────────────────────────────────────────────┐   │
│  │ 请输入内容...                                 │   │
│  └─────────────────────────────────────────────┘   │
│  高度：48px  圆角：8px  边框：Gray 300             │
│  聚焦态：边框变为 Primary 500                       │
│
│  Number Input（数字输入）                            │
│  体重                                               │
│  ┌────────────────────┬──────┐                   │
│  │ 72.5               │ kg   │                   │
│  └────────────────────┴──────┘                   │
│  右侧可添加单位后缀                                 │
│
│  Search Input（搜索输入）                            │
│  ┌─────────────────────────────────────────────┐   │
│  │ 🔍 搜索...                                   │   │
│  └─────────────────────────────────────────────┘   │
│  左侧有搜索图标                                     │
│
└─────────────────────────────────────────────────────┘
```

```typescript
// 输入框尺寸
export const inputSize = {
  sm: { height: 36, fontSize: 12 },
  md: { height: 44, fontSize: 14 },
  lg: { height: 52, fontSize: 16 },
};
```

### Card 卡片

```
┌─────────────────────────────────────────────────────┐
│  卡片样式                                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  标准卡片                                            │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │  卡片内容                                    │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│  背景：白色  圆角：12px  内边距：16px               │
│  阴影：sm                                          │
│
│  可点击卡片                                          │
│  ┌─────────────────────────────────────────────┐   │
│  │  可点击内容                        →        │   │
│  └─────────────────────────────────────────────┘   │
│  按压缩放：0.98  背景色变化：Gray 50                │
│
│  无边框卡片                                          │
│                                                     │
│    卡片内容                                          │
│                                                     │
│  背景：Gray 50  圆角：12px  无阴影                  │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### List Item 列表项

```
┌─────────────────────────────────────────────────────┐
│  列表项样式                                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  标准列表项                                          │
│  ┌─────────────────────────────────────────────┐   │
│  │  📷  标题文字                    副文字 →   │   │
│  └─────────────────────────────────────────────┘   │
│  高度：56px  内边距：16px                           │
│
│  带图标列表项                                        │
│  ┌─────────────────────────────────────────────┐   │
│  │  ○  标题                                    │   │
│  │      描述文字                                │   │
│  └─────────────────────────────────────────────┘   │
│  高度：72px                                        │
│
│  带开关列表项                                        │
│  ┌─────────────────────────────────────────────┐   │
│  │  标题文字                              [●──] │   │
│  └─────────────────────────────────────────────┘   │
│  高度：56px  右侧有开关                             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Tag 标签

```
┌─────────────────────────────────────────────────────┐
│  标签样式                                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  默认标签                                            │
│  ┌─────────┐                                       │
│  │  早餐   │  背景：Gray 100  文字：Gray 700       │
│  └─────────┘  圆角：24px  高度：28px               │
│
│  主要标签                                            │
│  ┌─────────┐                                       │
│  │  进行中  │  背景：Primary 100  文字：Primary 700 │
│  └─────────┘                                       │
│
│  成功标签                                            │
│  ┌─────────┐                                       │
│  │  已完成  │  背景：Success Light  文字：Success   │
│  └─────────┘                                       │
│
│  可选择标签（用于筛选）                              │
│  ┌─────┐ ┌─────┐ ┌─────┐                          │
│  │ 全部 │ │ 今天│ │ 本周│                          │
│  └─────┘ └─────┘ └─────┘                          │
│  选中态：Primary 背景  未选中：Gray 100             │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Modal 弹窗

```
┌─────────────────────────────────────────────────────┐
│  弹窗样式                                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  底部弹窗（Bottom Sheet）                            │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │  ──────────（拖动条）                        │   │
│  │                                             │   │
│  │  标题                                        │   │
│  │                                             │   │
│  │  内容区域                                    │   │
│  │                                             │   │
│  │  ┌─────────────┐  ┌─────────────┐          │   │
│  │  │    取消     │  │    确认     │          │   │
│  │  └─────────────┘  └─────────────┘          │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│  圆角：16px（顶部）  从下方滑入                       │
│
│  确认弹窗（Alert）                                   │
│  ┌─────────────────────────────────────────────┐   │
│  │                                             │   │
│  │              标题                            │   │
│  │                                             │   │
│  │          描述文字                            │   │
│  │                                             │   │
│  │  ┌─────────────┐  ┌─────────────┐          │   │
│  │  │    取消     │  │    确认     │          │   │
│  │  └─────────────┘  └─────────────┘          │   │
│  │                                             │   │
│  └─────────────────────────────────────────────┘   │
│  居中显示  圆角：16px  淡入动画                      │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📱 页面设计规范

### 页面边距

```typescript
export const pageMargin = {
  horizontal: 24,  // 左右边距
  vertical: 16,    // 上下边距
};
```

### 页面标题栏

```
┌─────────────────────────────────────────────────────┐
│  ←  页面标题                    [操作按钮]          │
│  16px  24px                               16px      │
├─────────────────────────────────────────────────────┤
│                                                     │
│  高度：56px                                        │
│  背景：白色/透明                                    │
│  标题：居中或左对齐                                  │
│  返回按钮：左侧                                     │
│  操作按钮：右侧                                     │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### 列表间距

```typescript
export const listSpacing = {
  sectionGap: 32,      // 区块间距
  sectionTitleGap: 16, // 区块标题与内容间距
  itemGap: 1,          // 列表项之间（分割线）
  itemPadding: 16,     // 列表项内边距
};
```

---

## 📊 图表规范

### 图表颜色

```typescript
export const chartColors = {
  // 主要数据线/柱
  primary: '#10B981',
  secondary: '#3B82F6',

  // 辅助数据
  tertiary: '#F59E0B',
  quaternary: '#8B5CF6',

  // 参考线
  reference: '#D1D5DB',

  // 目标线
  target: '#EF4444',

  // 渐变（用于面积图）
  gradientStart: 'rgba(16, 185, 129, 0.2)',
  gradientEnd: 'rgba(16, 185, 129, 0)',
};
```

### 图表样式

```
┌─────────────────────────────────────────────────────┐
│  折线图规范                                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  线条粗细：2px                                       │
│  数据点：圆形，直径 6px                              │
│  数据点描边：白色 2px                                │
│  网格线：Gray 200，虚线                              │
│  坐标轴标签：fontSize 11，Gray 500                  │
│  工具提示：卡片样式，阴影 sm                         │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  柱状图规范                                          │
├─────────────────────────────────────────────────────┤
│                                                     │
│  柱子宽度：自适应（最大 32px）                       │
│  柱子间距：柱子宽度的 50%                            │
│  柱子圆角：4px（顶部）                              │
│  选中态：Primary 500                                │
│  未选中态：Primary 300                              │
│                                                     │
└─────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│  饼图/环形图规范                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│  环形图内半径：60%                                   │
│  扇区间距：2px                                       │
│  颜色：使用图表颜色系列                              │
│  标签：线条连接，fontSize 12                        │
│                                                     │
└─────────────────────────────────────────────────────┘
```

---

## 📐 布局规范

### 底部导航栏

```
┌─────────────────────────────────────────────────────┐
│                                                     │
│                   [页面内容]                         │
│                                                     │
├─────────────────────────────────────────────────────┤
│                                                     │
│   🏠        📅        ➕        📊        ⚙️        │
│   首页      日历      快记      分析      设置      │
│                                                     │
│   20px      20px     40px      20px      20px      │
│                                                     │
└─────────────────────────────────────────────────────┘

高度：60px + Safe Area
背景：白色（浅色模式）/ Gray 900（深色模式）
中间按钮：40x40，Primary 背景，白色图标
图标下方文字：fontSize 10，Gray 500
选中态：Primary 500 文字 + 图标
未选中态：Gray 400 文字 + 图标
```

### 卡片网格布局

```
┌─────────────────────────────────────────────────────┐
│  两列网格                                            │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐  ┌──────────────┐                │
│  │              │  │              │                │
│  │    卡片 1    │  │    卡片 2    │                │
│  │              │  │              │                │
│  └──────────────┘  └──────────────┘                │
│            ↑ 间距 12px ↑                            │
│                                                     │
└─────────────────────────────────────────────────────┘

列间距：12px
行间距：12px
卡片宽度：(屏幕宽度 - 24*2 - 12) / 2
```

---

## 🔤 文案规范

### 语气风格

- **友好亲切**：像朋友一样交流
- **简洁明了**：少即是多
- **积极正面**：鼓励而非批评
- **专业可信**：数据准确，建议科学

### 常用文案

```typescript
export const copywriting = {
  // 空状态
  emptyState: {
    diet: {
      title: '还没有饮食记录',
      description: '点击下方按钮开始记录你的第一餐',
      action: '记录饮食',
    },
    exercise: {
      title: '还没有运动记录',
      description: '今天运动了吗？记录一下吧',
      action: '记录运动',
    },
    weight: {
      title: '还没有体重记录',
      description: '记录体重，追踪你的健康目标',
      action: '记录体重',
    },
  },

  // 状态评分
  status: {
    excellent: '太棒了！继续保持',
    good: '做得不错',
    average: '还行，可以更好',
    poor: '今天需要加油哦',
  },

  // 错误提示
  error: {
    network: '网络连接失败，请检查网络设置',
    aiFailed: 'AI 识别失败，请重试或手动输入',
    saveFailed: '保存失败，请重试',
    loadFailed: '加载失败，请下拉刷新',
  },

  // 确认对话框
  confirm: {
    delete: {
      title: '确认删除',
      message: '删除后无法恢复，确定要删除吗？',
      confirm: '删除',
      cancel: '取消',
    },
    discard: {
      title: '放弃编辑',
      message: '当前编辑的内容将不会保存',
      confirm: '放弃',
      cancel: '继续编辑',
    },
  },
};
```

---

## 📏 响应式设计

### 屏幕适配

```typescript
// 基准设计宽度（iPhone 14）
export const DESIGN_WIDTH = 390;

// 响应式计算
export const wp = (percentage: number) => {
  return (percentage / 100) * width;
};

export const hp = (percentage: number) => {
  return (percentage / 100) * height;
};

// 字体缩放（可选）
export const scaleFont = (size: number) => {
  const scale = width / DESIGN_WIDTH;
  return Math.round(size * scale);
};
```

### 断点

```typescript
export const breakpoints = {
  sm: 320,   // 小屏手机
  md: 375,   // 中屏手机（iPhone SE）
  lg: 414,   // 大屏手机（iPhone 14 Pro Max）
  xl: 768,   // 平板
};
```

---

## 🎨 设计资源

### Figma 设计稿

> 待创建：Figma 设计稿链接

### 图标资源

- 图标格式：SVG
- 图标风格：线条极简
- 线条粗细：1.5px 或 2px

### 字体资源

- 中文：思源黑体（Noto Sans SC）
- 英文：系统默认（SF Pro / Roboto）
- 数字：等宽字体

---

## 📝 设计检查清单

### 视觉检查
- [ ] 颜色对比度符合 WCAG AA 标准
- [ ] 字体大小在不同设备上可读
- [ ] 图标风格统一
- [ ] 间距一致

### 交互检查
- [ ] 按钮有按压反馈
- [ ] 加载状态有提示
- [ ] 错误状态有友好提示
- [ ] 空状态有引导

### 动画检查
- [ ] 动画时长合适（不拖沓）
- [ ] 动画有意义（不是为了动而动）
- [ ] 动画流畅（60fps）

---

*文档版本：v1.0*
*最后更新：2026-06-03*

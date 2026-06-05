// Healthora Fit 主题系统

// 品牌色
export const COLORS = {
  // 主色（翡翠绿）
  primary: {
    50: '#ECFDF5',
    100: '#D1FAE5',
    200: '#A7F3D0',
    300: '#6EE7B7',
    400: '#34D399',
    500: '#10B981',  // 主色
    600: '#059669',
    700: '#047857',
    800: '#065F46',
    900: '#064E3B',
  },

  // 辅助色（天蓝色）
  secondary: {
    50: '#EFF6FF',
    100: '#DBEAFE',
    200: '#BFDBFE',
    300: '#93C5FD',
    400: '#60A5FA',
    500: '#3B82F6',
    600: '#2563EB',
    700: '#1D4ED8',
    800: '#1E40AF',
    900: '#1E3A8A',
  },

  // 中性色
  gray: {
    50: '#F9FAFB',
    100: '#F3F4F6',
    200: '#E5E7EB',
    300: '#D1D5DB',
    400: '#9CA3AF',
    500: '#6B7280',
    600: '#4B5563',
    700: '#374151',
    800: '#1F2937',
    900: '#111827',
  },

  // 语义色
  success: '#10B981',
  warning: '#F59E0B',
  warningLight: '#FEF3C7',
  error: '#EF4444',
  info: '#3B82F6',
};

// 浅色主题
export const lightTheme = {
  colors: {
    // 背景
    background: {
      primary: '#FFFFFF',
      secondary: '#F9FAFB',
      tertiary: '#F3F4F6',
    },

    // 文字
    text: {
      primary: '#111827',
      secondary: '#4B5563',
      tertiary: '#9CA3AF',
      inverse: '#FFFFFF',
    },

    // 边框
    border: {
      light: '#E5E7EB',
      main: '#D1D5DB',
      dark: '#9CA3AF',
    },

    // 品牌色
    primary: {
      main: COLORS.primary[500],
      light: COLORS.primary[100],
      dark: COLORS.primary[600],
      text: '#FFFFFF',
    },

    // 辅助色
    secondary: {
      main: COLORS.secondary[500],
      light: COLORS.secondary[100],
      dark: COLORS.secondary[600],
      text: '#FFFFFF',
    },

    // 状态色
    success: COLORS.success,
    warning: COLORS.warning,
    warningLight: COLORS.warningLight,
    error: COLORS.error,
    info: COLORS.info,

    // 卡片
    card: {
      background: '#FFFFFF',
      border: '#E5E7EB',
    },

    // Tab 栏
    tab: {
      background: '#FFFFFF',
      active: COLORS.primary[500],
      inactive: COLORS.gray[400],
      border: '#E5E7EB',
    },
  },

  // 间距
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
  },

  // 圆角
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    '2xl': 24,
    full: 9999,
  },

  // 字体大小
  fontSize: {
    h1: 28,
    h2: 24,
    h3: 20,
    h4: 18,
    bodyLg: 16,
    body: 14,
    bodySm: 12,
    caption: 11,
    tiny: 10,
  },

  // 字重
  fontWeight: {
    light: '300' as const,
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
  },

  // 阴影
  shadow: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
      elevation: 3,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.15,
      shadowRadius: 8,
      elevation: 5,
    },
  },
};

// 深色主题
export const darkTheme = {
  ...lightTheme,
  colors: {
    ...lightTheme.colors,
    background: {
      primary: '#111827',
      secondary: '#1F2937',
      tertiary: '#374151',
    },
    text: {
      primary: '#F9FAFB',
      secondary: '#D1D5DB',
      tertiary: '#9CA3AF',
      inverse: '#111827',
    },
    border: {
      light: '#374151',
      main: '#4B5563',
      dark: '#6B7280',
    },
    primary: {
      main: COLORS.primary[400],
      light: COLORS.primary[900],
      dark: COLORS.primary[300],
      text: '#111827',
    },
    secondary: {
      main: COLORS.secondary[400],
      light: COLORS.secondary[900],
      dark: COLORS.secondary[300],
      text: '#111827',
    },
    card: {
      background: '#1F2937',
      border: '#374151',
    },
    tab: {
      background: '#1F2937',
      active: COLORS.primary[400],
      inactive: COLORS.gray[500],
      border: '#374151',
    },
  },
};

// 主题类型
export type Theme = typeof lightTheme;

// 导出默认主题
export const theme = lightTheme;

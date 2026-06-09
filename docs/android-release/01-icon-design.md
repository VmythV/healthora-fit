# Android 应用图标设计指南

## 📱 图标要求

### Adaptive Icon 规范（Android 8.0+）

**尺寸要求：**

- 前景图（Foreground）：108x108 dp（432x432 px @4x）
- 背景色：#10B981（绿色主题）

**安全区域：**

- 内圆直径：66dp（中心 66% 区域）
- 外圆直径：108dp（完整画布）
- 关键内容必须在内圆内，避免被裁切

```
┌─────────────────────┐
│    ┌───────────┐    │
│    │  安全区域  │    │
│    │  (66dp)   │    │
│    │   ┌───┐   │    │
│    │   │LOGO│   │    │
│    │   └───┘   │    │
│    └───────────┘    │
│                     │
└─────────────────────┘
      108dp x 108dp
```

---

## 🎨 设计建议

### 方案一：简约健康光环（推荐）

**设计元素：**

- 外环：渐变绿色圆环（健康光环概念）
- 中心：简洁的心形或叶子图标
- 配色：绿色渐变（#10B981 → #059669）

**优势：**

- 符合"Healthora"品牌名
- 识别度高
- 适合小尺寸显示

### 方案二：字母组合

**设计元素：**

- 字母 "H" 或 "HF"
- 圆角矩形背景
- 绿色系配色

**优势：**

- 简洁专业
- 容易制作

### 方案三：图形图标

**设计元素：**

- 跑步/健身人物剪影
- 健康图表线条
- 渐变背景

---

## 🛠️ 图标生成工具

### 在线工具

1. **Android Asset Studio**（推荐）
   - 网址：https://romannurik.github.io/AndroidAssetStudio/
   - 支持 Adaptive Icon 生成
   - 自动适配各种尺寸

2. **App Icon Generator**
   - 网址：https://appicon.co/
   - 支持多平台输出

3. **Icon Kitchen**
   - 网址：https://icon.kitchen/
   - 可视化编辑

### 本地工具

1. **Figma / Sketch**
   - 设计矢量图标
   - 导出 PNG 文件

2. **Adobe Illustrator**
   - 专业设计工具
   - 导出多种格式

---

## 📐 导出规格

### 必需文件

| 文件名            | 尺寸         | 用途                   |
| ----------------- | ------------ | ---------------------- |
| icon.png          | 1024x1024 px | 应用商店图标           |
| adaptive-icon.png | 432x432 px   | Android 自适应图标前景 |
| splash-icon.png   | 1284x2778 px | 启动画面图标（可选）   |

### 可选文件

| 文件名              | 尺寸       | 用途               |
| ------------------- | ---------- | ------------------ |
| icon-foreground.png | 432x432 px | 前景图（透明背景） |
| icon-background.png | 432x432 px | 背景图             |

---

## ✅ 实施步骤

### 方法一：使用 Android Asset Studio（最快）

1. 访问 https://romannurik.github.io/AndroidAssetStudio/
2. 选择 "Launcher Icon Generator"
3. 上传你的图标设计（或使用内置工具创建）
4. 配置：
   - Background Color: #10B981
   - Foreground: 上传图标
   - Shape: Circle
5. 下载生成的 ZIP 文件
6. 替换 `assets/` 目录下的文件：
   - `icon.png`
   - `adaptive-icon.png`
   - `splash-icon.png`

### 方法二：使用现有资源 + 调整

1. 保持当前 Expo 默认图标（可用于开发测试）
2. 后续替换为专业设计图标

### 方法三：AI 生成图标

使用 AI 图像生成工具（如 Midjourney、DALL-E）：

- Prompt: "Minimalist health app icon, green gradient circle, simple heart or leaf symbol, clean modern design, Android adaptive icon style, 1024x1024"

---

## 📝 当前状态

- ✅ 已配置 `app.json` 中的 Android 图标路径
- ⬜ 需要生成专业图标（当前使用 Expo 默认图标）
- ⬜ 需要替换 `assets/` 中的图标文件

**注意：** 当前使用的 Expo 默认图标仅适用于开发测试。上架 Google Play 前需要替换为专业设计的图标。

---

_文档版本：v1.0_
_创建日期：2026-06-04_

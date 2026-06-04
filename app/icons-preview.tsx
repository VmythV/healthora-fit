// app/icons-preview.tsx
// 图标预览工具

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import { theme } from '@/constants/theme';
import { Icon, IconName } from '@/components/icons';

// 所有图标列表
const ICON_LIST: { name: IconName; label: string; description: string }[] = [
  { name: 'home', label: '首页', description: '首页导航图标' },
  { name: 'calendar', label: '日历', description: '日历导航图标' },
  { name: 'add', label: '添加', description: '添加操作图标' },
  { name: 'chart', label: '分析', description: '分析导航图标' },
  { name: 'settings', label: '设置', description: '设置导航图标' },
  { name: 'food', label: '饮食', description: '饮食记录图标' },
  { name: 'exercise', label: '运动', description: '运动记录图标' },
  { name: 'weight', label: '体重', description: '体重记录图标' },
  { name: 'camera', label: '相机', description: '拍照功能图标' },
  { name: 'edit', label: '编辑', description: '编辑操作图标' },
  { name: 'delete', label: '删除', description: '删除操作图标' },
  { name: 'back', label: '返回', description: '返回操作图标' },
];

// 预设颜色
const PRESET_COLORS = [
  { name: '主色', value: theme.colors.primary.main },
  { name: '深色', value: theme.colors.primary.dark },
  { name: '文字', value: theme.colors.text.primary },
  { name: '次要', value: theme.colors.text.secondary },
  { name: '禁用', value: theme.colors.text.tertiary },
  { name: '错误', value: theme.colors.error },
  { name: '成功', value: theme.colors.success },
  { name: '白色', value: '#FFFFFF' },
];

// 预设尺寸
const PRESET_SIZES = [16, 20, 24, 32, 40, 48];

/**
 * 图标预览工具
 *
 * 访问路径：/icons-preview
 */
export default function IconsPreviewScreen() {
  const [selectedColor, setSelectedColor] = useState(theme.colors.primary.main);
  const [selectedSize, setSelectedSize] = useState(24);
  const [customColor, setCustomColor] = useState('');
  const [customSize, setCustomSize] = useState('');

  // 获取当前使用的颜色
  const currentColor = customColor || selectedColor;

  // 获取当前使用的尺寸
  const currentSize = customSize ? parseInt(customSize) || 24 : selectedSize;

  return (
    <SafeAreaView style={styles.container}>
      <Stack.Screen
        options={{
          title: '图标预览',
          headerShown: true,
        }}
      />

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 控制面板 */}
        <View style={styles.controlPanel}>
          <Text style={styles.sectionTitle}>颜色选择</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.colorRow}>
              {PRESET_COLORS.map((color) => (
                <TouchableOpacity
                  key={color.value}
                  style={[
                    styles.colorButton,
                    { backgroundColor: color.value },
                    selectedColor === color.value && !customColor && styles.colorButtonSelected,
                  ]}
                  onPress={() => {
                    setSelectedColor(color.value);
                    setCustomColor('');
                  }}
                >
                  <Text
                    style={[
                      styles.colorButtonText,
                      { color: color.value === '#FFFFFF' ? '#000' : '#FFF' },
                    ]}
                  >
                    {color.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.sectionTitle}>自定义颜色</Text>
          <TextInput
            style={styles.input}
            value={customColor}
            onChangeText={setCustomColor}
            placeholder="输入颜色值，如 #FF0000"
            placeholderTextColor={theme.colors.text.tertiary}
          />

          <Text style={styles.sectionTitle}>尺寸选择</Text>
          <View style={styles.sizeRow}>
            {PRESET_SIZES.map((size) => (
              <TouchableOpacity
                key={size}
                style={[
                  styles.sizeButton,
                  selectedSize === size && !customSize && styles.sizeButtonSelected,
                ]}
                onPress={() => {
                  setSelectedSize(size);
                  setCustomSize('');
                }}
              >
                <Text
                  style={[
                    styles.sizeButtonText,
                    selectedSize === size && !customSize && styles.sizeButtonTextSelected,
                  ]}
                >
                  {size}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.sectionTitle}>自定义尺寸</Text>
          <TextInput
            style={styles.input}
            value={customSize}
            onChangeText={setCustomSize}
            placeholder="输入尺寸值，如 32"
            placeholderTextColor={theme.colors.text.tertiary}
            keyboardType="numeric"
          />
        </View>

        {/* 当前配置 */}
        <View style={styles.configInfo}>
          <Text style={styles.configText}>
            当前配置：颜色 {currentColor} | 尺寸 {currentSize}px
          </Text>
        </View>

        {/* 图标网格 */}
        <View style={styles.iconGrid}>
          {ICON_LIST.map((icon) => (
            <TouchableOpacity key={icon.name} style={styles.iconCard}>
              <View style={styles.iconPreview}>
                <Icon
                  name={icon.name}
                  size={currentSize}
                  color={currentColor}
                />
              </View>
              <Text style={styles.iconLabel}>{icon.label}</Text>
              <Text style={styles.iconName}>{icon.name}</Text>
              <Text style={styles.iconDescription}>{icon.description}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* 代码示例 */}
        <View style={styles.codeSection}>
          <Text style={styles.sectionTitle}>代码示例</Text>
          <View style={styles.codeBlock}>
            <Text style={styles.codeText}>
              {`import { Icon } from '@/components/icons';

// 使用统一组件
<Icon name="home" size={${currentSize}} color="${currentColor}" />

// 或直接使用单个图标
import { HomeIcon } from '@/components/icons';
<HomeIcon size={${currentSize}} color="${currentColor}" />`}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  content: {
    flex: 1,
  },
  controlPanel: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.base,
  },
  sectionTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
    marginTop: theme.spacing.base,
  },
  colorRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  colorButton: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    minWidth: 60,
    alignItems: 'center',
  },
  colorButtonSelected: {
    borderWidth: 2,
    borderColor: theme.colors.text.primary,
  },
  colorButtonText: {
    fontSize: theme.fontSize.bodySm,
    fontWeight: theme.fontWeight.medium,
  },
  sizeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  sizeButton: {
    paddingHorizontal: theme.spacing.base,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.background.tertiary,
    minWidth: 50,
    alignItems: 'center',
  },
  sizeButtonSelected: {
    backgroundColor: theme.colors.primary.main,
  },
  sizeButtonText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.primary,
  },
  sizeButtonTextSelected: {
    color: '#FFFFFF',
  },
  input: {
    height: 44,
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.md,
    paddingHorizontal: theme.spacing.base,
    fontSize: theme.fontSize.body,
    color: theme.colors.text.primary,
  },
  configInfo: {
    backgroundColor: theme.colors.primary.light,
    padding: theme.spacing.base,
    marginHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.base,
    borderRadius: theme.borderRadius.md,
  },
  configText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.primary.dark,
    textAlign: 'center',
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  iconCard: {
    width: '47%',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  iconPreview: {
    width: 80,
    height: 80,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.tertiary,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.sm,
  },
  iconLabel: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  iconName: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.primary.main,
    fontFamily: 'monospace',
    marginBottom: theme.spacing.xs,
  },
  iconDescription: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
  },
  codeSection: {
    backgroundColor: theme.colors.background.primary,
    padding: theme.spacing.xl,
    marginTop: theme.spacing.base,
  },
  codeBlock: {
    backgroundColor: theme.colors.background.tertiary,
    padding: theme.spacing.base,
    borderRadius: theme.borderRadius.md,
  },
  codeText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.primary,
    fontFamily: 'monospace',
    lineHeight: 20,
  },
});

// components/calendar/TimelineItem.tsx
// 时间轴单项组件 - 时间与标题同水平 + 类别色 + 分行详情

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import Animated, { FadeIn } from 'react-native-reanimated'
import { theme } from '@/constants/theme'
import { Icon } from '@/components/icons'
import { IconName } from '@/components/icons/Icon'
import { DietRecord } from '@/types/diet'
import { ExerciseRecord } from '@/types/exercise'

export interface TimelineItemData {
  id: string
  type: 'diet' | 'exercise'
  time: string
  timeLabel: string
  title: string
  /** 核心数据行（食物名 / 时长+距离） */
  subtitle?: string
  /** 营养/能量行（kcal、蛋白质） */
  meta?: string
  /** 用户备注 */
  note?: string
  iconName: IconName
  record: DietRecord | ExerciseRecord
}

interface TimelineItemProps {
  item: TimelineItemData
  isLast: boolean
  index: number
  onPress: (item: TimelineItemData) => void
}

// 类型色（与全局 theme 一致）
const TYPE_COLORS: Record<'diet' | 'exercise', { main: string; light: string }> = {
  diet: { main: theme.colors.warning, light: theme.colors.warningLight },
  exercise: { main: theme.colors.primary.main, light: theme.colors.primary.light },
}

// 卡片内部 padding（用于让 timeLabel 与 title 视觉对齐）
const CARD_PAD_V = 12

/**
 * 时间轴单项
 * React.memo —— 避免 SectionList 父组件 re-render 时整个列表重渲染
 * 比较 item.id + isLast，其他变化（如 onPress 引用变化）不触发重渲染
 */
function TimelineItemComponent({ item, isLast, index, onPress }: TimelineItemProps) {
  const color = TYPE_COLORS[item.type]

  return (
    <Animated.View
      entering={FadeIn.delay(Math.min(index, 5) * 30).duration(180)}
      style={styles.container}
    >
      {/* 左侧时间轴 —— timeLabel 与卡片 title 同一基线 */}
      <View style={styles.timeAxis}>
        <Text style={styles.timeLabel}>{item.timeLabel}</Text>
        <View style={styles.dotLine}>
          <View style={[styles.dot, { backgroundColor: color.main, borderColor: color.light }]} />
          {!isLast && <View style={styles.line} />}
        </View>
      </View>

      {/* 右侧内容卡片 */}
      <TouchableOpacity style={styles.card} onPress={() => onPress(item)} activeOpacity={0.7}>
        {/* 类别色图标圆 */}
        <View style={[styles.iconCircle, { backgroundColor: color.light }]}>
          <Icon name={item.iconName} size={20} color={color.main} />
        </View>

        {/* 文本区 */}
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          {item.subtitle ? (
            <Text style={styles.subtitle} numberOfLines={1}>
              {item.subtitle}
            </Text>
          ) : null}
          {item.meta ? (
            <Text style={styles.meta} numberOfLines={1}>
              {item.meta}
            </Text>
          ) : null}
          {item.note ? (
            <Text style={styles.note} numberOfLines={1}>
              {item.note}
            </Text>
          ) : null}
        </View>

        {/* 跳转指示 */}
        <Icon name="chevron-right" size={16} color={theme.colors.text.tertiary} />
      </TouchableOpacity>
    </Animated.View>
  )
}

export const TimelineItem = React.memo(
  TimelineItemComponent,
  (prev, next) =>
    prev.item.id === next.item.id && prev.isLast === next.isLast && prev.index === next.index
)

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
  },
  // 时间轴竖列：时间 → 点 → 线
  timeAxis: {
    width: 50,
    alignItems: 'center',
    // 通过 paddingTop 让 timeLabel 与卡片 title 视觉对齐（CARD_PAD_V - timeLabel 微调）
    paddingTop: CARD_PAD_V,
  },
  timeLabel: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.tertiary,
    marginBottom: 6,
  },
  dotLine: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    borderWidth: 2,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: theme.colors.border.light,
    marginTop: 4,
    marginBottom: 4,
  },
  // 右侧卡片
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.md,
    paddingVertical: CARD_PAD_V,
    paddingHorizontal: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
    gap: 2,
  },
  title: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  subtitle: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  meta: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  note: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    fontStyle: 'italic',
    marginTop: 2,
  },
})

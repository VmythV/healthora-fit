// components/diet/DietRecordList.tsx
// 饮食记录列表
//
// P1-8 优化：
// - 模块顶层 helper（formatTime / getMealIcon / getFoodSummary），避免每次 render 重建
// - 行级 DietRow 提取为 React.memo 组件
// - renderItem / keyExtractor / handleDelete 改 useCallback

import React, { useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ListRenderItem } from 'react-native'
import { theme } from '@/constants/theme'
import { useI18n } from '@/hooks/useI18n'
import { useDietRecords } from '@/hooks/useDietRecords'
import { DietRecord, FoodItem } from '@/types/diet'
import { Card, Empty } from '@/components/ui'
import { Icon } from '@/components/icons'
import { IconName } from '@/components/icons/Icon'
import { showConfirm } from '@/components/ui'

interface DietRecordListProps {
  date?: string
  onRecordPress?: (record: DietRecord) => void
}

// 模块级 helper —— 避免每次 render 重建
function formatTime(timestamp: string): string {
  const d = new Date(timestamp)
  return d.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

const MEAL_ICONS: Record<string, IconName> = {
  breakfast: 'sunrise',
  lunch: 'plate',
  dinner: 'moon',
  snack: 'cookie',
}

function getMealIcon(mealType?: string): IconName {
  return MEAL_ICONS[mealType || ''] || 'plate'
}

function getFoodSummary(record: DietRecord, noFoodLabel: string): string {
  const foods: FoodItem[] = record.foodsJson ? JSON.parse(record.foodsJson) : []
  if (foods.length === 0) return noFoodLabel
  return foods.map((f) => f.name).join('、')
}

// 行级组件 —— 接收所有 props，React.memo 防止同 props 重复渲染
interface DietRowProps {
  item: DietRecord
  noFoodLabel: string
  caloriesLabel: string
  proteinLabel: string
  carbsLabel: string
  fatLabel: string
  deleteLabel: string
  onPress?: (record: DietRecord) => void
  onDelete: (id: number) => void
}

const DietRow = React.memo(function DietRow({
  item,
  noFoodLabel,
  caloriesLabel,
  proteinLabel,
  carbsLabel,
  fatLabel,
  onPress,
  onDelete,
}: DietRowProps) {
  const handlePress = useCallback(() => onPress?.(item), [item, onPress])
  const handleDelete = useCallback(() => onDelete(item.id), [item.id, onDelete])

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordInfo}>
            <View style={styles.mealRow}>
              <View style={styles.mealIconContainer}>
                <Icon
                  name={getMealIcon(item.mealType)}
                  size={20}
                  color={theme.colors.primary.main}
                />
              </View>
              <Text style={styles.mealType}>
                {item.mealType ? MEAL_ICONS[item.mealType] || '' : ''}
              </Text>
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
            </View>
            <Text style={styles.foodSummary} numberOfLines={1}>
              {getFoodSummary(item, noFoodLabel)}
            </Text>
          </View>
          <View style={styles.recordCalories}>
            <Text style={styles.caloriesValue}>{item.totalCalories || 0}</Text>
            <Text style={styles.caloriesUnit}>{caloriesLabel}</Text>
          </View>
        </View>

        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionText}>
            {proteinLabel}: {item.totalProtein || 0}g
          </Text>
          <Text style={styles.nutritionText}>
            {carbsLabel}: {item.totalCarbs || 0}g
          </Text>
          <Text style={styles.nutritionText}>
            {fatLabel}: {item.totalFat || 0}g
          </Text>
        </View>

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Icon name="delete" size={16} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  )
})

export function DietRecordList({ date, onRecordPress }: DietRecordListProps) {
  const { t } = useI18n()
  const { records, loading, deleteRecord } = useDietRecords(date)

  const handleDelete = useCallback(
    async (id: number) => {
      const ok = await showConfirm({
        title: t('confirm.delete.title'),
        message: t('confirm.delete.message'),
        type: 'danger',
        confirmText: t('common.delete'),
        cancelText: t('common.cancel'),
      })
      if (ok) deleteRecord(id)
    },
    [t, deleteRecord]
  )

  const renderItem: ListRenderItem<DietRecord> = useCallback(
    ({ item }) => (
      <DietRow
        item={item}
        noFoodLabel={t('diet.noFood')}
        caloriesLabel={t('diet.calories')}
        proteinLabel={t('diet.protein')}
        carbsLabel={t('diet.carbs')}
        fatLabel={t('diet.fat')}
        deleteLabel={t('common.delete')}
        onPress={onRecordPress}
        onDelete={handleDelete}
      />
    ),
    [t, onRecordPress, handleDelete]
  )

  const keyExtractor = useCallback((item: DietRecord) => item.id.toString(), [])

  if (!loading && records.length === 0) {
    return <Empty icon="plate" title={t('diet.noFood')} description={t('common.comingSoon')} />
  }

  return (
    <FlatList
      data={records}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  recordCard: {
    padding: theme.spacing.base,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  recordInfo: {
    flex: 1,
  },
  mealRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  mealIconContainer: {
    width: 20,
    height: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mealType: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  time: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
  },
  foodSummary: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.xs,
  },
  recordCalories: {
    alignItems: 'flex-end',
  },
  caloriesValue: {
    fontSize: theme.fontSize.h4,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  caloriesUnit: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  nutritionText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
  },
  deleteButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
})

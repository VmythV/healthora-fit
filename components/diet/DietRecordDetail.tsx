// components/diet/DietRecordDetail.tsx
// 饮食记录详情
//
// P3-44：原 RN Image → expo-image（更优内存缓存、过渡动画、占位符）

import React from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native'
import { Image } from 'expo-image'
import { useRouter } from 'expo-router'
import { theme } from '@/constants/theme'
import { useI18n } from '@/hooks/useI18n'
import { useDietRecords } from '@/hooks/useDietRecords'
import { DietRecord, FoodItem } from '@/types/diet'
import { NutritionSummary } from './NutritionSummary'
import { Card } from '@/components/ui'
import { Icon } from '@/components/icons'
import { showNotification, showConfirm } from '@/components/ui'

interface DietRecordDetailProps {
  record: DietRecord
  onDelete?: () => void
}

/**
 * 饮食记录详情
 */
export function DietRecordDetail({ record, onDelete }: DietRecordDetailProps) {
  const { t } = useI18n()
  const router = useRouter()
  const { deleteRecord } = useDietRecords()

  // 解析食物列表
  const foods: FoodItem[] = record.foodsJson ? JSON.parse(record.foodsJson) : []

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 格式化日期
  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp)
    return date.toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  }

  // 获取餐次标签
  const getMealTypeLabel = (mealType?: string) => {
    if (!mealType) return ''
    return t(`mealType.${mealType}`)
  }

  // 编辑
  const handleEdit = () => {
    router.push({
      pathname: '/diet/record',
      params: {
        recordId: record.id,
        foods: JSON.stringify(foods),
        mealType: record.mealType,
        note: record.note,
      },
    })
  }

  // 删除
  const handleDelete = async () => {
    const ok = await showConfirm({
      title: t('confirm.delete.title'),
      message: t('confirm.delete.message'),
      type: 'danger',
      confirmText: t('common.delete'),
      cancelText: t('common.cancel'),
    })
    if (!ok) return

    try {
      await deleteRecord(record.id)
      onDelete?.()
    } catch (error) {
      showNotification(t('error.saveFailed'), 'error')
    }
  }

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* 头部信息 */}
      <Card style={styles.headerCard}>
        <View style={styles.headerRow}>
          <View style={styles.headerInfo}>
            <Text style={styles.date}>{formatDate(record.timestamp)}</Text>
            <Text style={styles.time}>{formatTime(record.timestamp)}</Text>
          </View>
          {record.mealType && (
            <View style={styles.mealBadge}>
              <Text style={styles.mealText}>{getMealTypeLabel(record.mealType)}</Text>
            </View>
          )}
        </View>

        {/* 照片 —— expo-image：contentFit + transition */}
        {record.photoUri && (
          <Image
            source={{ uri: record.photoUri }}
            style={styles.photo}
            contentFit="cover"
            transition={200}
          />
        )}
      </Card>

      {/* 营养成分 */}
      <NutritionSummary
        calories={record.totalCalories || 0}
        protein={record.totalProtein || 0}
        carbs={record.totalCarbs || 0}
        fat={record.totalFat || 0}
      />

      {/* 食物列表 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('diet.foodList')}</Text>
        {foods.map((food, index) => (
          <Card key={index} style={styles.foodCard}>
            <View style={styles.foodHeader}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodPortion}>{food.portion}</Text>
            </View>
            <View style={styles.foodNutrition}>
              <Text style={styles.foodCalories}>
                {food.calories} {t('diet.calories')}
              </Text>
              <Text style={styles.foodDetail}>
                {t('diet.protein')}: {food.protein}g | {t('diet.carbs')}: {food.carbs}g |{' '}
                {t('diet.fat')}: {food.fat}g
              </Text>
            </View>
          </Card>
        ))}
      </View>

      {/* 备注 */}
      {record.note && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('diet.note')}</Text>
          <Card style={styles.noteCard}>
            <Text style={styles.noteText}>{record.note}</Text>
          </Card>
        </View>
      )}

      {/* 操作按钮 */}
      <View style={styles.actions}>
        <TouchableOpacity style={[styles.actionButton, styles.editButton]} onPress={handleEdit}>
          <Icon name="edit" size={20} color="#FFFFFF" />
          <Text style={styles.editButtonText}>{t('common.edit')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButton, styles.deleteButton]} onPress={handleDelete}>
          <Icon name="delete" size={20} color="#FFFFFF" />
          <Text style={styles.deleteButtonText}>{t('common.delete')}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  headerCard: {
    margin: theme.spacing.xl,
    padding: theme.spacing.xl,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  headerInfo: {
    flex: 1,
  },
  date: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  time: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  mealBadge: {
    backgroundColor: theme.colors.primary.light,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  mealText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.primary.main,
    fontWeight: theme.fontWeight.medium,
  },
  photo: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.lg,
    marginTop: theme.spacing.base,
  },
  section: {
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  foodCard: {
    padding: theme.spacing.base,
    marginBottom: theme.spacing.sm,
  },
  foodHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  foodName: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  foodPortion: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
  },
  foodNutrition: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  foodCalories: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary.main,
  },
  foodDetail: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  noteCard: {
    padding: theme.spacing.base,
  },
  noteText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  actions: {
    flexDirection: 'row',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.base,
    borderRadius: theme.borderRadius.lg,
    gap: theme.spacing.sm,
  },
  editButton: {
    backgroundColor: theme.colors.primary.main,
  },
  deleteButton: {
    backgroundColor: theme.colors.error,
  },
  editButtonText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
  deleteButtonText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
})

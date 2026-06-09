// components/diet/NutritionSummary.tsx
// 营养成分汇总

import React from 'react'
import { View, Text, StyleSheet } from 'react-native'
import { theme } from '@/constants/theme'
import { useI18n } from '@/hooks/useI18n'
import { Card } from '@/components/ui'

interface NutritionSummaryProps {
  calories: number
  protein: number
  carbs: number
  fat: number
}

/**
 * 营养成分汇总
 */
export function NutritionSummary({ calories, protein, carbs, fat }: NutritionSummaryProps) {
  const { t } = useI18n()

  return (
    <Card style={styles.container}>
      <Text style={styles.title}>{t('diet.total')}</Text>

      <View style={styles.caloriesRow}>
        <Text style={styles.caloriesValue}>{calories}</Text>
        <Text style={styles.caloriesUnit}>{t('diet.calories')}</Text>
      </View>

      <View style={styles.nutritionRow}>
        <View style={styles.nutritionItem}>
          <View style={[styles.dot, { backgroundColor: '#10B981' }]} />
          <Text style={styles.nutritionLabel}>{t('diet.protein')}</Text>
          <Text style={styles.nutritionValue}>{protein}g</Text>
        </View>
        <View style={styles.nutritionItem}>
          <View style={[styles.dot, { backgroundColor: '#3B82F6' }]} />
          <Text style={styles.nutritionLabel}>{t('diet.carbs')}</Text>
          <Text style={styles.nutritionValue}>{carbs}g</Text>
        </View>
        <View style={styles.nutritionItem}>
          <View style={[styles.dot, { backgroundColor: '#F59E0B' }]} />
          <Text style={styles.nutritionLabel}>{t('diet.fat')}</Text>
          <Text style={styles.nutritionValue}>{fat}g</Text>
        </View>
      </View>
    </Card>
  )
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
  },
  title: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.base,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  caloriesValue: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  caloriesUnit: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
    marginLeft: theme.spacing.sm,
  },
  nutritionRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  nutritionItem: {
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: theme.spacing.xs,
  },
  nutritionLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  nutritionValue: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
})

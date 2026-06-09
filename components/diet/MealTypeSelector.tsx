// components/diet/MealTypeSelector.tsx
// 餐次选择器
//
// P2-27：复用 @/constants/mealTypes 的 MEAL_TYPES（id + icon + timeRange），
// 不再组件内私有硬编码常量，与 suggestMealType() 共享数据。

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native'
import { theme } from '@/constants/theme'
import { useI18n } from '@/hooks/useI18n'
import { MealType } from '@/types/diet'
import { MEAL_TYPES } from '@/constants/mealTypes'
import { Icon } from '@/components/icons'
import { IconName } from '@/components/icons/Icon'

interface MealTypeSelectorProps {
  value: MealType
  onChange: (mealType: MealType) => void
}

function iconFor(id: string): IconName {
  // MEAL_TYPES 里的 icon 是 string（IconName 字面量），用窄化收一下
  return id as IconName
}

/**
 * 餐次选择器
 */
export function MealTypeSelector({ value, onChange }: MealTypeSelectorProps) {
  const { t } = useI18n()

  return (
    <View style={styles.container}>
      {MEAL_TYPES.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[styles.item, value === type.id && styles.itemActive]}
          onPress={() => onChange(type.id as MealType)}
        >
          <View style={styles.iconContainer}>
            <Icon
              name={iconFor(type.icon)}
              size={24}
              color={value === type.id ? theme.colors.primary.main : theme.colors.text.secondary}
            />
          </View>
          <Text style={[styles.label, value === type.id && styles.labelActive]}>
            {t(`mealType.${type.id}`)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  item: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  itemActive: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light,
  },
  iconContainer: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.secondary,
  },
  labelActive: {
    color: theme.colors.primary.main,
    fontWeight: theme.fontWeight.semibold,
  },
})

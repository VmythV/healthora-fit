// components/exercise/ExerciseTypeSelector.tsx
// 运动类型选择器
//
// P2-27：复用 @/constants/exerciseTypes 的 EXERCISE_TYPES（含 id + icon + caloriesPerMinute）

import React from 'react'
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native'
import { theme } from '@/constants/theme'
import { useI18n } from '@/hooks/useI18n'
import { EXERCISE_TYPES } from '@/constants/exerciseTypes'
import { Icon } from '@/components/icons'
import { IconName } from '@/components/icons/Icon'

interface ExerciseTypeSelectorProps {
  value: string
  onChange: (type: string) => void
}

function iconFor(name: string): IconName {
  return name as IconName
}

/**
 * 运动类型选择器
 */
export function ExerciseTypeSelector({ value, onChange }: ExerciseTypeSelectorProps) {
  const { t } = useI18n()

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.container}
    >
      {EXERCISE_TYPES.map((type) => (
        <TouchableOpacity
          key={type.id}
          style={[styles.item, value === type.id && styles.itemActive]}
          onPress={() => onChange(type.id)}
        >
          <View style={styles.iconContainer}>
            <Icon
              name={iconFor(type.icon)}
              size={28}
              color={value === type.id ? theme.colors.primary.main : theme.colors.text.secondary}
            />
          </View>
          <Text style={[styles.label, value === type.id && styles.labelActive]}>
            {t(`exerciseType.${type.id}`)}
          </Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
  },
  item: {
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: 'transparent',
    minWidth: 80,
  },
  itemActive: {
    borderColor: theme.colors.primary.main,
    backgroundColor: theme.colors.primary.light,
  },
  iconContainer: {
    marginBottom: theme.spacing.xs,
  },
  label: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  labelActive: {
    color: theme.colors.primary.main,
    fontWeight: theme.fontWeight.semibold,
  },
})

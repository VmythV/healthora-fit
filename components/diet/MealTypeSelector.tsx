// components/diet/MealTypeSelector.tsx
// 餐次选择器

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { MealType } from '@/types/diet';
import { Icon } from '@/components/icons';
import { IconName } from '@/components/icons/Icon';

interface MealTypeSelectorProps {
  value: MealType;
  onChange: (mealType: MealType) => void;
}

const MEAL_TYPES: MealType[] = ['breakfast', 'lunch', 'dinner', 'snack'];

const MEAL_ICONS: Record<MealType, IconName> = {
  breakfast: 'sunrise',
  lunch: 'plate',
  dinner: 'moon',
  snack: 'cookie',
};

/**
 * 餐次选择器
 */
export function MealTypeSelector({ value, onChange }: MealTypeSelectorProps) {
  const { t } = useI18n();

  return (
    <View style={styles.container}>
      {MEAL_TYPES.map((type) => (
        <TouchableOpacity
          key={type}
          style={[
            styles.item,
            value === type && styles.itemActive,
          ]}
          onPress={() => onChange(type)}
        >
          <View style={styles.iconContainer}>
            <Icon name={MEAL_ICONS[type]} size={24} color={value === type ? theme.colors.primary.main : theme.colors.text.secondary} />
          </View>
          <Text
            style={[
              styles.label,
              value === type && styles.labelActive,
            ]}
          >
            {t(`mealType.${type}`)}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
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
});

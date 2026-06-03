// components/home/QuickActions.tsx
// 快捷操作

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';

/**
 * 快捷操作
 */
export function QuickActions() {
  const { t } = useI18n();
  const router = useRouter();

  const actions = [
    {
      icon: '🍚',
      label: t('record.diet.title'),
      onPress: () => router.push('/diet/record'),
    },
    {
      icon: '🏃',
      label: t('record.exercise.title'),
      onPress: () => router.push('/exercise/record'),
    },
    {
      icon: '⚖️',
      label: t('record.weight.title'),
      onPress: () => router.push('/weight/record'),
    },
  ];

  return (
    <View style={styles.container}>
      {actions.map((action, index) => (
        <TouchableOpacity
          key={index}
          style={styles.actionButton}
          onPress={action.onPress}
          activeOpacity={0.7}
        >
          <Text style={styles.actionIcon}>{action.icon}</Text>
          <Text style={styles.actionLabel}>{action.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.lg,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow.sm,
  },
  actionIcon: {
    fontSize: 32,
    marginBottom: theme.spacing.sm,
  },
  actionLabel: {
    fontSize: theme.fontSize.bodySm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
});

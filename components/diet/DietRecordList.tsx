// components/diet/DietRecordList.tsx
// 饮食记录列表

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useDietRecords } from '@/hooks/useDietRecords';
import { DietRecord, FoodItem } from '@/types/diet';
import { Card, Empty } from '@/components/ui';
import { Icon } from '@/components/icons';

interface DietRecordListProps {
  date?: string; // 筛选日期，格式 YYYY-MM-DD
  onRecordPress?: (record: DietRecord) => void;
}

/**
 * 饮食记录列表
 */
export function DietRecordList({ date, onRecordPress }: DietRecordListProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { records, loading, deleteRecord } = useDietRecords(date);

  // 格式化时间
  const formatTime = (timestamp: string) => {
    const d = new Date(timestamp);
    return d.toLocaleTimeString('zh-CN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  // 获取餐次图标
  const getMealIcon = (mealType?: string) => {
    switch (mealType) {
      case 'breakfast':
        return '🌅';
      case 'lunch':
        return '☀️';
      case 'dinner':
        return '🌙';
      case 'snack':
        return '🍪';
      default:
        return '🍽️';
    }
  };

  // 获取食物摘要
  const getFoodSummary = (record: DietRecord) => {
    const foods: FoodItem[] = record.foodsJson
      ? JSON.parse(record.foodsJson)
      : [];
    if (foods.length === 0) return t('diet.noFood');
    return foods.map((f) => f.name).join('、');
  };

  // 删除记录
  const handleDelete = (id: number) => {
    Alert.alert(
      t('confirm.delete.title'),
      t('confirm.delete.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => deleteRecord(id),
        },
      ]
    );
  };

  // 渲染记录项
  const renderItem = ({ item }: { item: DietRecord }) => (
    <TouchableOpacity
      onPress={() => onRecordPress?.(item)}
      activeOpacity={0.7}
    >
      <Card style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.recordInfo}>
            <View style={styles.mealRow}>
              <Text style={styles.mealIcon}>{getMealIcon(item.mealType)}</Text>
              <Text style={styles.mealType}>
                {item.mealType ? t(`mealType.${item.mealType}`) : ''}
              </Text>
              <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
            </View>
            <Text style={styles.foodSummary} numberOfLines={1}>
              {getFoodSummary(item)}
            </Text>
          </View>
          <View style={styles.recordCalories}>
            <Text style={styles.caloriesValue}>{item.totalCalories || 0}</Text>
            <Text style={styles.caloriesUnit}>{t('diet.calories')}</Text>
          </View>
        </View>

        {/* 营养成分 */}
        <View style={styles.nutritionRow}>
          <Text style={styles.nutritionText}>
            {t('diet.protein')}: {item.totalProtein || 0}g
          </Text>
          <Text style={styles.nutritionText}>
            {t('diet.carbs')}: {item.totalCarbs || 0}g
          </Text>
          <Text style={styles.nutritionText}>
            {t('diet.fat')}: {item.totalFat || 0}g
          </Text>
        </View>

        {/* 删除按钮 */}
        <TouchableOpacity
          style={styles.deleteButton}
          onPress={() => handleDelete(item.id)}
        >
          <Icon name="delete" size={16} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  );

  // 空状态
  if (!loading && records.length === 0) {
    return (
      <Empty
        icon="🍽️"
        title={t('diet.noFood')}
        description={t('common.comingSoon')}
      />
    );
  }

  return (
    <FlatList
      data={records}
      renderItem={renderItem}
      keyExtractor={(item) => item.id.toString()}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  );
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
  mealIcon: {
    fontSize: 20,
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
});

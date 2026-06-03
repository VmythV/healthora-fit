// components/diet/FoodList.tsx
// 食物列表组件

import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { FoodItem } from '@/types/diet';
import { Icon } from '@/components/icons';
import { Card } from '@/components/ui';

interface FoodListProps {
  foods: FoodItem[];
  onEdit: (index: number, food: FoodItem) => void;
  onDelete: (index: number) => void;
}

/**
 * 食物列表组件
 */
export function FoodList({ foods, onEdit, onDelete }: FoodListProps) {
  const { t } = useI18n();

  if (foods.length === 0) {
    return (
      <View style={styles.empty}>
        <Text style={styles.emptyText}>{t('diet.noFood')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {foods.map((food, index) => (
        <FoodItemCard
          key={index}
          food={food}
          onEdit={(updated) => onEdit(index, updated)}
          onDelete={() => onDelete(index)}
        />
      ))}
    </View>
  );
}

interface FoodItemCardProps {
  food: FoodItem;
  onEdit: (food: FoodItem) => void;
  onDelete: () => void;
}

function FoodItemCard({ food, onEdit, onDelete }: FoodItemCardProps) {
  const { t } = useI18n();
  const [editing, setEditing] = useState(false);
  const [editData, setEditData] = useState(food);

  const handleSave = () => {
    onEdit(editData);
    setEditing(false);
  };

  if (editing) {
    return (
      <Card style={styles.card}>
        <View style={styles.editRow}>
          <TextInput
            style={styles.editInput}
            value={editData.name}
            onChangeText={(text) => setEditData({ ...editData, name: text })}
            placeholder={t('diet.foodName')}
          />
          <TextInput
            style={styles.editInputSmall}
            value={editData.portion}
            onChangeText={(text) => setEditData({ ...editData, portion: text })}
            placeholder={t('diet.portion')}
          />
        </View>
        <View style={styles.nutritionRow}>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>{t('diet.calories')}</Text>
            <TextInput
              style={styles.nutritionInput}
              value={String(editData.calories)}
              onChangeText={(text) =>
                setEditData({ ...editData, calories: Number(text) || 0 })
              }
              keyboardType="numeric"
            />
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>{t('diet.protein')}</Text>
            <TextInput
              style={styles.nutritionInput}
              value={String(editData.protein)}
              onChangeText={(text) =>
                setEditData({ ...editData, protein: Number(text) || 0 })
              }
              keyboardType="numeric"
            />
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>{t('diet.carbs')}</Text>
            <TextInput
              style={styles.nutritionInput}
              value={String(editData.carbs)}
              onChangeText={(text) =>
                setEditData({ ...editData, carbs: Number(text) || 0 })
              }
              keyboardType="numeric"
            />
          </View>
          <View style={styles.nutritionItem}>
            <Text style={styles.nutritionLabel}>{t('diet.fat')}</Text>
            <TextInput
              style={styles.nutritionInput}
              value={String(editData.fat)}
              onChangeText={(text) =>
                setEditData({ ...editData, fat: Number(text) || 0 })
              }
              keyboardType="numeric"
            />
          </View>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => setEditing(false)}
          >
            <Text style={styles.cancelText}>{t('common.cancel')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.saveButton]}
            onPress={handleSave}
          >
            <Text style={styles.saveText}>{t('common.save')}</Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  return (
    <Card style={styles.card}>
      <View style={styles.header}>
        <View style={styles.info}>
          <Text style={styles.name}>{food.name}</Text>
          <Text style={styles.portion}>{food.portion}</Text>
        </View>
        <View style={styles.actions}>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => setEditing(true)}
          >
            <Icon name="edit" size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.iconButton}
            onPress={onDelete}
          >
            <Icon name="delete" size={16} color={theme.colors.error} />
          </TouchableOpacity>
        </View>
      </View>
      <View style={styles.nutrition}>
        <Text style={styles.nutritionText}>
          {food.calories} {t('diet.calories')}
        </Text>
        <Text style={styles.nutritionDetail}>
          {t('diet.protein')}: {food.protein}g | {t('diet.carbs')}: {food.carbs}g | {t('diet.fat')}: {food.fat}g
        </Text>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: theme.spacing.sm,
  },
  empty: {
    padding: theme.spacing['2xl'],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
  },
  card: {
    padding: theme.spacing.base,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  portion: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  iconButton: {
    padding: theme.spacing.xs,
  },
  nutrition: {
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  nutritionText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary.main,
  },
  nutritionDetail: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  editRow: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
  },
  editInput: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.body,
  },
  editInputSmall: {
    width: 80,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.sm,
    fontSize: theme.fontSize.body,
  },
  nutritionRow: {
    flexDirection: 'row',
    marginTop: theme.spacing.sm,
    gap: theme.spacing.sm,
  },
  nutritionItem: {
    flex: 1,
  },
  nutritionLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginBottom: 2,
  },
  nutritionInput: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.sm,
    padding: theme.spacing.xs,
    fontSize: theme.fontSize.bodySm,
    textAlign: 'center',
  },
  actionButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.base,
    borderRadius: theme.borderRadius.sm,
  },
  cancelButton: {
    backgroundColor: theme.colors.background.secondary,
  },
  saveButton: {
    backgroundColor: theme.colors.primary.main,
  },
  cancelText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.secondary,
  },
  saveText: {
    fontSize: theme.fontSize.bodySm,
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.semibold,
  },
});

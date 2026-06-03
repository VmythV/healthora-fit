// components/diet/DietRecordForm.tsx
// 饮食记录表单组件

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useDietRecords } from '@/hooks/useDietRecords';
import { FoodItem, MealType } from '@/types/diet';
import { FoodList } from './FoodList';
import { NutritionSummary } from './NutritionSummary';
import { MealTypeSelector } from './MealTypeSelector';
import { Icon } from '@/components/icons';

interface DietRecordFormProps {
  photoUri?: string;
  initialFoods?: FoodItem[];
  initialMealType?: MealType;
  initialNote?: string;
  recordId?: number; // 编辑模式时传入
  onSuccess?: () => void;
}

/**
 * 饮食记录表单
 *
 * @example
 * ```tsx
 * // 新增模式
 * <DietRecordForm
 *   photoUri={imageUri}
 *   initialFoods={aiResult.foods}
 * />
 *
 * // 编辑模式
 * <DietRecordForm
 *   recordId={123}
 *   initialFoods={existingFoods}
 *   initialMealType="lunch"
 * />
 * ```
 */
export function DietRecordForm({
  photoUri,
  initialFoods = [],
  initialMealType,
  initialNote = '',
  recordId,
  onSuccess,
}: DietRecordFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { createRecord, updateRecord } = useDietRecords();

  const [mealType, setMealType] = useState<MealType>(
    initialMealType || getDefaultMealType()
  );
  const [foods, setFoods] = useState<FoodItem[]>(initialFoods);
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);

  // 计算营养成分总量
  const totals = {
    calories: foods.reduce((sum, f) => sum + f.calories, 0),
    protein: foods.reduce((sum, f) => sum + f.protein, 0),
    carbs: foods.reduce((sum, f) => sum + f.carbs, 0),
    fat: foods.reduce((sum, f) => sum + f.fat, 0),
  };

  // 获取默认餐次
  function getDefaultMealType(): MealType {
    const hour = new Date().getHours();
    if (hour < 10) return 'breakfast';
    if (hour < 14) return 'lunch';
    if (hour < 18) return 'snack';
    return 'dinner';
  }

  // 添加食物
  const handleAddFood = () => {
    // TODO: 打开食物搜索或手动输入
    const newFood: FoodItem = {
      name: t('diet.newFood'),
      portion: '1份',
      calories: 0,
      protein: 0,
      carbs: 0,
      fat: 0,
    };
    setFoods([...foods, newFood]);
  };

  // 编辑食物
  const handleEditFood = (index: number, updatedFood: FoodItem) => {
    const newFoods = [...foods];
    newFoods[index] = updatedFood;
    setFoods(newFoods);
  };

  // 删除食物
  const handleDeleteFood = (index: number) => {
    Alert.alert(
      t('diet.deleteFood'),
      t('confirm.delete.message'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        {
          text: t('common.delete'),
          style: 'destructive',
          onPress: () => {
            setFoods(foods.filter((_, i) => i !== index));
          },
        },
      ]
    );
  };

  // 保存记录
  const handleSave = async () => {
    if (foods.length === 0) {
      Alert.alert(t('common.error'), t('diet.noFood'));
      return;
    }

    setSaving(true);
    try {
      const recordData = {
        timestamp: new Date().toISOString(),
        photoUri,
        foodsJson: JSON.stringify(foods),
        totalCalories: totals.calories,
        totalProtein: totals.protein,
        totalCarbs: totals.carbs,
        totalFat: totals.fat,
        mealType,
        note,
        isEdited: true,
      };

      if (recordId) {
        await updateRecord(recordId, recordData);
      } else {
        await createRecord(recordData);
      }

      onSuccess?.();
      router.back();
    } catch (error) {
      console.error('保存失败:', error);
      Alert.alert(t('common.error'), t('error.saveFailed'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView}>
        {/* 餐次选择 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('diet.mealType')}</Text>
          <MealTypeSelector
            value={mealType}
            onChange={setMealType}
          />
        </View>

        {/* 食物列表 */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('diet.foodList')}</Text>
            <TouchableOpacity
              style={styles.addButton}
              onPress={handleAddFood}
            >
              <Icon name="add" size={20} color={theme.colors.primary.main} />
              <Text style={styles.addButtonText}>{t('diet.addFood')}</Text>
            </TouchableOpacity>
          </View>
          <FoodList
            foods={foods}
            onEdit={handleEditFood}
            onDelete={handleDeleteFood}
          />
        </View>

        {/* 营养成分汇总 */}
        <View style={styles.section}>
          <NutritionSummary
            calories={totals.calories}
            protein={totals.protein}
            carbs={totals.carbs}
            fat={totals.fat}
          />
        </View>

        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('diet.note')}</Text>
          <TextInput
            style={styles.noteInput}
            placeholder={t('diet.notePlaceholder')}
            placeholderTextColor={theme.colors.text.tertiary}
            value={note}
            onChangeText={setNote}
            multiline
            maxLength={200}
          />
        </View>
      </ScrollView>

      {/* 保存按钮 */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={[styles.saveButton, saving && styles.saveButtonDisabled]}
          onPress={handleSave}
          disabled={saving}
        >
          <Text style={styles.saveButtonText}>
            {saving ? t('common.loading') : t('diet.saveRecord')}
          </Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.xs,
  },
  addButtonText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.primary.main,
  },
  noteInput: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    fontSize: theme.fontSize.body,
    color: theme.colors.text.primary,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  footer: {
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.primary,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  saveButton: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.base,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
});

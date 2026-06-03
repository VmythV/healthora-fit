// components/exercise/ExerciseRecordForm.tsx
// 运动记录表单

import React, { useState } from 'react';
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
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useExerciseRecords } from '@/hooks/useExerciseRecords';
import { ExerciseTypeSelector } from './ExerciseTypeSelector';
import { DurationInput } from './DurationInput';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';

interface ExerciseRecordFormProps {
  initialType?: string;
  initialDuration?: number;
  initialCalories?: number;
  initialDistance?: number;
  initialNote?: string;
  recordId?: number; // 编辑模式
  onSuccess?: () => void;
}

// 卡路里估算（每分钟）
const CALORIES_PER_MINUTE: Record<string, number> = {
  running: 10,
  walking: 5,
  cycling: 8,
  swimming: 11,
  strength: 7,
  yoga: 4,
  hiit: 12,
  other: 6,
};

/**
 * 运动记录表单
 */
export function ExerciseRecordForm({
  initialType = 'running',
  initialDuration = 30,
  initialCalories,
  initialDistance,
  initialNote = '',
  recordId,
  onSuccess,
}: ExerciseRecordFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { createRecord, updateRecord } = useExerciseRecords();

  const [exerciseType, setExerciseType] = useState(initialType);
  const [duration, setDuration] = useState(initialDuration);
  const [calories, setCalories] = useState(
    initialCalories || estimateCalories(initialType, initialDuration)
  );
  const [distance, setDistance] = useState(initialDistance || 0);
  const [note, setNote] = useState(initialNote);
  const [saving, setSaving] = useState(false);

  // 估算卡路里
  function estimateCalories(type: string, minutes: number): number {
    const rate = CALORIES_PER_MINUTE[type] || 6;
    return Math.round(rate * minutes);
  }

  // 更新运动类型
  const handleTypeChange = (type: string) => {
    setExerciseType(type);
    setCalories(estimateCalories(type, duration));
  };

  // 更新时长
  const handleDurationChange = (minutes: number) => {
    setDuration(minutes);
    setCalories(estimateCalories(exerciseType, minutes));
  };

  // 保存
  const handleSave = async () => {
    if (duration <= 0) {
      Alert.alert(t('common.error'), t('exercise.invalidDuration'));
      return;
    }

    setSaving(true);
    try {
      const recordData = {
        timestamp: new Date().toISOString(),
        exerciseType,
        durationMinutes: duration,
        caloriesBurned: calories,
        distanceKm: distance > 0 ? distance : undefined,
        source: 'manual' as const,
        note,
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
        {/* 运动类型 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('exercise.exerciseType')}</Text>
          <ExerciseTypeSelector
            value={exerciseType}
            onChange={handleTypeChange}
          />
        </View>

        {/* 运动时长 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('exercise.duration')}</Text>
          <DurationInput
            value={duration}
            onChange={handleDurationChange}
          />
        </View>

        {/* 卡路里 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('exercise.caloriesBurned')}</Text>
          <Card style={styles.caloriesCard}>
            <View style={styles.caloriesRow}>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => setCalories(Math.max(0, calories - 10))}
              >
                <Text style={styles.adjustButtonText}>-10</Text>
              </TouchableOpacity>
              <View style={styles.caloriesValue}>
                <Text style={styles.caloriesNumber}>{calories}</Text>
                <Text style={styles.caloriesUnit}>{t('home.kcal')}</Text>
              </View>
              <TouchableOpacity
                style={styles.adjustButton}
                onPress={() => setCalories(calories + 10)}
              >
                <Text style={styles.adjustButtonText}>+10</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.caloriesHint}>{t('exercise.autoEstimated')}</Text>
          </Card>
        </View>

        {/* 距离（可选） */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('exercise.distance')}</Text>
          <Card style={styles.distanceCard}>
            <View style={styles.distanceRow}>
              <TextInput
                style={styles.distanceInput}
                value={String(distance || '')}
                onChangeText={(text) => setDistance(Number(text) || 0)}
                keyboardType="decimal-pad"
                placeholder="0"
                placeholderTextColor={theme.colors.text.tertiary}
              />
              <Text style={styles.distanceUnit}>{t('exercise.km')}</Text>
            </View>
          </Card>
        </View>

        {/* 备注 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('exercise.note')}</Text>
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
            {saving ? t('common.loading') : t('exercise.saveRecord')}
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
  sectionTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  caloriesCard: {
    padding: theme.spacing.xl,
  },
  caloriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xl,
  },
  adjustButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  adjustButtonText: {
    fontSize: theme.fontSize.bodySm,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
  caloriesValue: {
    alignItems: 'center',
  },
  caloriesNumber: {
    fontSize: 48,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  caloriesUnit: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
  },
  caloriesHint: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    textAlign: 'center',
    marginTop: theme.spacing.sm,
  },
  distanceCard: {
    padding: theme.spacing.base,
  },
  distanceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  distanceInput: {
    flex: 1,
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
  },
  distanceUnit: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
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

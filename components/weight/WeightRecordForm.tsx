// components/weight/WeightRecordForm.tsx
// 体重记录表单

import { logger } from '@/utils/logger';
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
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useWeightRecords } from '@/hooks/useWeightRecords';
import { useGoals } from '@/hooks/useGoals';
import { WeightInput } from './WeightInput';
import { showNotification, showConfirm } from '@/components/ui';

interface WeightRecordFormProps {
  initialWeight?: number;
  recordId?: number; // 编辑模式
  onSuccess?: () => void;
}

/**
 * 体重记录表单
 */
export function WeightRecordForm({
  initialWeight = 70,
  recordId,
  onSuccess,
}: WeightRecordFormProps) {
  const { t } = useI18n();
  const router = useRouter();
  const { createRecord, latestWeight } = useWeightRecords();
  const { activeGoal } = useGoals();

  const [weight, setWeight] = useState(initialWeight);
  const [note, setNote] = useState('');
  const [saving, setSaving] = useState(false);

  // 获取上次记录和目标体重
  const lastWeight = latestWeight?.weight;
  const targetWeight = activeGoal?.targetWeight;

  // 保存
  const handleSave = async () => {
    if (weight < 20 || weight > 300) {
      showNotification(t('weight.invalidWeight'), 'error');
      return;
    }

    setSaving(true);
    try {
      await createRecord({
        timestamp: new Date().toISOString(),
        weight,
        source: 'manual',
        note,
      });

      onSuccess?.();
      router.back();
    } catch (error) {
      logger.error('[WeightForm] 保存失败:', error);
      showNotification(t('error.saveFailed'), 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* 体重输入 */}
        <View style={styles.section}>
          <WeightInput
            value={weight}
            onChange={setWeight}
            lastWeight={lastWeight}
            targetWeight={targetWeight}
          />
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
            {saving ? t('common.loading') : t('weight.saveRecord')}
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
    marginTop: theme.spacing.xl,
    paddingHorizontal: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
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

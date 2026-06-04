// app/settings/goals.tsx
// 目标设置页面

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useGoals } from '@/hooks/useGoals';
import { useWeightRecords } from '@/hooks/useWeightRecords';
import { ProgressRing } from '@/components/charts/ProgressRing';
import { Icon, BackIcon } from '@/components/icons';

export default function GoalsScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const { activeGoal, loadActive, setGoal } = useGoals();
  const { latestWeight, loadLatest } = useWeightRecords();

  const [targetWeight, setTargetWeight] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    loadActive('target_weight');
    loadLatest();
  }, []);

  useEffect(() => {
    if (activeGoal) {
      setTargetWeight(activeGoal.targetValue.toString());
    }
  }, [activeGoal]);

  // 计算进度
  const calculateProgress = () => {
    if (!activeGoal || !latestWeight) return null;

    const start = activeGoal.startValue || latestWeight.weight;
    const target = activeGoal.targetValue;
    const current = latestWeight.weight;

    // 计算完成百分比
    const totalChange = Math.abs(start - target);
    const currentChange = Math.abs(start - current);
    const progress = totalChange > 0 ? Math.min(currentChange / totalChange, 1) : 0;

    return {
      progress,
      current,
      target,
      remaining: Math.abs(current - target),
      isAchieved: Math.abs(current - target) < 0.5,
    };
  };

  const progressInfo = calculateProgress();

  // 保存目标
  const handleSave = async () => {
    const weight = parseFloat(targetWeight);
    if (isNaN(weight) || weight < 20 || weight > 300) {
      Alert.alert(t('common.error'), t('weight.invalidWeight'));
      return;
    }

    try {
      await setGoal({
        goalType: 'target_weight',
        targetValue: weight,
        startValue: latestWeight?.weight,
        startDate: new Date().toISOString().split('T')[0],
      });
      setIsEditing(false);
      Alert.alert(t('common.success'), t('settings.goals.saveSuccess'));
    } catch (error) {
      Alert.alert(t('common.error'), t('settings.goals.saveFailed'));
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.goals.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content}>
        {/* 目标进度卡片 */}
        {progressInfo && !isEditing && (
          <View style={styles.progressCard}>
            <ProgressRing
              progress={progressInfo.progress}
              size={120}
              color={progressInfo.isAchieved ? theme.colors.success : theme.colors.primary.main}
              label={progressInfo.isAchieved ? t('settings.goals.achieved') : t('settings.goals.inProgress')}
            />

            <View style={styles.progressInfo}>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>{t('weight.currentWeight')}</Text>
                <Text style={styles.progressValue}>{progressInfo.current} kg</Text>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>{t('weight.targetWeight')}</Text>
                <Text style={styles.progressValue}>{progressInfo.target} kg</Text>
              </View>
              <View style={styles.progressRow}>
                <Text style={styles.progressLabel}>{t('weight.toTarget')}</Text>
                <Text style={[styles.progressValue, styles.highlight]}>
                  {progressInfo.remaining > 0 ? `${progressInfo.remaining.toFixed(1)} kg` : t('settings.goals.achieved')}
                </Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.editButton}
              onPress={() => setIsEditing(true)}
            >
              <Text style={styles.editButtonText}>{t('common.edit')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 目标输入表单 */}
        {(isEditing || !activeGoal) && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>{t('settings.goals.setTarget')}</Text>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t('weight.targetWeight')} (kg)</Text>
              <TextInput
                style={styles.input}
                value={targetWeight}
                onChangeText={setTargetWeight}
                keyboardType="decimal-pad"
                placeholder="例如: 65.0"
                placeholderTextColor={theme.colors.text.tertiary}
              />
            </View>

            {latestWeight && (
              <View style={styles.currentWeightInfo}>
                <Text style={styles.currentWeightLabel}>{t('weight.currentWeight')}:</Text>
                <Text style={styles.currentWeightValue}>{latestWeight.weight} kg</Text>
              </View>
            )}

            <View style={styles.buttonRow}>
              {activeGoal && (
                <TouchableOpacity
                  style={styles.cancelButton}
                  onPress={() => {
                    setIsEditing(false);
                    setTargetWeight(activeGoal.targetValue.toString());
                  }}
                >
                  <Text style={styles.cancelButtonText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                <Text style={styles.saveButtonText}>{t('common.save')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* 提示信息 */}
        <View style={styles.tipsCard}>
          <View style={styles.tipsTitleRow}>
            <Icon name="tips" size={18} color={theme.colors.text.primary} />
            <Text style={styles.tipsTitle}>{t('settings.goals.tips')}</Text>
          </View>
          <Text style={styles.tipsText}>{t('settings.goals.tip1')}</Text>
          <Text style={styles.tipsText}>{t('settings.goals.tip2')}</Text>
          <Text style={styles.tipsText}>{t('settings.goals.tip3')}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.background.primary,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  progressCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  progressInfo: {
    width: '100%',
    marginTop: theme.spacing.xl,
  },
  progressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  progressLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  progressValue: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  highlight: {
    color: theme.colors.primary.main,
  },
  editButton: {
    marginTop: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.base,
  },
  editButtonText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.primary.main,
  },
  formCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  formTitle: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xl,
  },
  inputGroup: {
    marginBottom: theme.spacing.lg,
  },
  inputLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.base,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.base,
    fontSize: theme.fontSize.body,
    color: theme.colors.text.primary,
  },
  currentWeightInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.base,
  },
  currentWeightLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
    marginRight: theme.spacing.sm,
  },
  currentWeightValue: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: theme.spacing.base,
  },
  cancelButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    borderRadius: theme.borderRadius.base,
  },
  cancelButtonText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  saveButton: {
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.base,
  },
  saveButtonText: {
    fontSize: theme.fontSize.body,
    color: '#FFFFFF',
    fontWeight: theme.fontWeight.medium,
  },
  tipsCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
  },
  tipsTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.base,
  },
  tipsTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  tipsText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
    lineHeight: 20,
  },
});

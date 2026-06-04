// components/exercise/ScreenshotResult.tsx
// 运动截图识别结果组件

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';
import { ExerciseAnalysisResult } from '@/services/exerciseAnalysis';

interface ScreenshotResultProps {
  result: ExerciseAnalysisResult;
  onAccept: () => void;
  onRetry: () => void;
}

/**
 * 运动截图识别结果组件
 */
export function ScreenshotResult({ result, onAccept, onRetry }: ScreenshotResultProps) {
  const { t } = useI18n();

  // 获取运动类型图标
  const getExerciseIcon = (type: string) => {
    const icons: Record<string, string> = {
      running: 'running',
      walking: 'walking',
      cycling: 'cycling',
      swimming: 'swimming',
      strength: 'strength',
      yoga: 'yoga',
      hiit: 'hiit',
      other: 'other-exercise',
    };
    return icons[type] || 'other-exercise';
  };

  // 获取运动类型名称
  const getExerciseName = (type: string) => {
    const names: Record<string, string> = {
      running: t('exerciseType.running'),
      walking: t('exerciseType.walking'),
      cycling: t('exerciseType.cycling'),
      swimming: t('exerciseType.swimming'),
      strength: t('exerciseType.strength'),
      yoga: t('exerciseType.yoga'),
      hiit: t('exerciseType.hiit'),
      other: t('exerciseType.other'),
    };
    return names[type] || t('exerciseType.other');
  };

  // 获取置信度颜色
  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return theme.colors.success;
      case 'medium':
        return theme.colors.warning;
      case 'low':
        return theme.colors.error;
      default:
        return theme.colors.text.tertiary;
    }
  };

  // 获取置信度文本
  const getConfidenceText = (confidence: string) => {
    switch (confidence) {
      case 'high':
        return t('exercise.confidenceHigh');
      case 'medium':
        return t('exercise.confidenceMedium');
      case 'low':
        return t('exercise.confidenceLow');
      default:
        return '';
    }
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Icon name="ai" size={20} color={theme.colors.primary.main} />
        <Text style={styles.title}>{t('exercise.analysisResult')}</Text>
        <View style={[styles.confidenceBadge, { backgroundColor: getConfidenceColor(result.confidence) + '20' }]}>
          <Text style={[styles.confidenceText, { color: getConfidenceColor(result.confidence) }]}>
            {getConfidenceText(result.confidence)}
          </Text>
        </View>
      </View>

      {/* 运动类型 */}
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Icon name={getExerciseIcon(result.exerciseType) as any} size={16} color={theme.colors.text.secondary} />
          <Text style={styles.label}>{t('exercise.exerciseType')}</Text>
        </View>
        <Text style={styles.value}>{getExerciseName(result.exerciseType)}</Text>
      </View>

      {/* 运动时长 */}
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Icon name="fire" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.label}>{t('exercise.duration')}</Text>
        </View>
        <Text style={styles.value}>{result.durationMinutes} {t('home.minutes')}</Text>
      </View>

      {/* 消耗卡路里 */}
      <View style={styles.row}>
        <View style={styles.labelContainer}>
          <Icon name="fire" size={16} color={theme.colors.text.secondary} />
          <Text style={styles.label}>{t('exercise.caloriesBurned')}</Text>
        </View>
        <Text style={styles.value}>{result.caloriesBurned} {t('home.kcal')}</Text>
      </View>

      {/* 距离（如果有） */}
      {result.distanceKm && (
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <Icon name="running" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.label}>{t('exercise.distance')}</Text>
          </View>
          <Text style={styles.value}>{result.distanceKm.toFixed(2)} {t('exercise.km')}</Text>
        </View>
      )}

      {/* 心率（如果有） */}
      {result.heartRate && (
        <View style={styles.row}>
          <View style={styles.labelContainer}>
            <Icon name="fire" size={16} color={theme.colors.text.secondary} />
            <Text style={styles.label}>{t('exercise.heartRate')}</Text>
          </View>
          <Text style={styles.value}>{result.heartRate} bpm</Text>
        </View>
      )}

      {/* 操作按钮 */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.retryButton} onPress={onRetry}>
          <Text style={styles.retryButtonText}>{t('exercise.retry')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.acceptButton} onPress={onAccept}>
          <Text style={styles.acceptButtonText}>{t('exercise.acceptResult')}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  title: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    flex: 1,
  },
  confidenceBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.full,
  },
  confidenceText: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.medium,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  label: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  value: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  retryButton: {
    flex: 1,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  retryButtonText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
  },
  acceptButton: {
    flex: 1,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
    alignItems: 'center',
  },
  acceptButtonText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
});

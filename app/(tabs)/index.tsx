// app/(tabs)/index.tsx
// 首页

import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useDietRecords } from '@/hooks/useDietRecords';
import { useExerciseRecords } from '@/hooks/useExerciseRecords';
import { useWeightRecords } from '@/hooks/useWeightRecords';
import { useGoals } from '@/hooks/useGoals';
import { StatusCard, SummaryCards, QuickActions, TodayRecords } from '@/components/home';
import { AnimatedCard } from '@/components/AnimatedCard';
import { EmptyState } from '@/components/EmptyState';
import { logger } from '@/utils/logger';

export default function HomeScreen() {
  const { t } = useI18n();
  const [refreshing, setRefreshing] = useState(false);

  // 获取数据
  const {
    todayRecords: dietRecords,
    todayCalories,
    todayNutrition,
    loadToday: loadDietToday,
  } = useDietRecords();
  const {
    todayRecords: exerciseRecords,
    todayMinutes,
    todayCaloriesBurned,
    loadToday: loadExerciseToday,
  } = useExerciseRecords();
  const {
    latestWeight,
    yesterdayWeight,
    loadLatest: loadWeightLatest,
  } = useWeightRecords();
  const {
    activeGoal,
    loadActive: loadGoalActive,
  } = useGoals();

  // 刷新所有数据
  const refreshData = useCallback(async () => {
    try {
      await Promise.all([
        loadDietToday(),
        loadExerciseToday(),
        loadWeightLatest(),
        loadGoalActive('target_weight'),
      ]);
    } catch (err) {
      logger.error('[Home] refreshData 失败:', err);
    }
  }, [loadDietToday, loadExerciseToday, loadWeightLatest, loadGoalActive]);

  // 每次获得焦点时刷新数据
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [refreshData])
  );

  // 计算今日状态评分
  const calculateScore = useCallback(() => {
    let score = 0;

    // 饮食规律评分（30%）- 有记录就得分
    if (dietRecords.length > 0) {
      score += 30 * Math.min(1, dietRecords.length / 3);
    }

    // 营养均衡评分（20%）- 蛋白质占比合理
    if (todayNutrition.calories > 0) {
      const proteinRatio = (todayNutrition.protein * 4) / todayNutrition.calories;
      if (proteinRatio >= 0.15 && proteinRatio <= 0.35) {
        score += 20;
      } else {
        score += 10;
      }
    }

    // 卡路里控制评分（20%）- 在目标范围内
    if (activeGoal?.dailyCalories && todayCalories > 0) {
      const ratio = todayCalories / activeGoal.dailyCalories;
      if (ratio >= 0.8 && ratio <= 1.2) {
        score += 20;
      } else if (ratio >= 0.6 && ratio <= 1.4) {
        score += 10;
      }
    } else if (todayCalories > 0) {
      score += 15; // 没有目标但有记录
    }

    // 运动完成评分（20%）- 有运动记录
    if (exerciseRecords.length > 0) {
      score += 20 * Math.min(1, todayMinutes / 30);
    }

    // 体重趋势评分（10%）- 有记录
    if (latestWeight) {
      score += 10;
    }

    return Math.min(100, Math.round(score));
  }, [dietRecords, exerciseRecords, todayCalories, todayNutrition, todayMinutes, latestWeight, activeGoal]);

  // 计算体重变化
  const weightChange = latestWeight && yesterdayWeight
    ? latestWeight.weight - yesterdayWeight.weight
    : undefined;

  // 整理今日记录
  const todayRecords = [
    ...dietRecords.map(r => ({
      id: r.id,
      type: 'diet' as const,
      time: r.timestamp,
      title: r.mealType ? t(`mealType.${r.mealType}`) : t('record.diet.title'),
      detail: `${r.totalCalories || 0} ${t('home.kcal')}`,
    })),
    ...exerciseRecords.map(r => ({
      id: r.id,
      type: 'exercise' as const,
      time: r.timestamp,
      title: t(`exerciseType.${r.exerciseType}`),
      detail: `${r.durationMinutes} ${t('home.minutes')}`,
    })),
  ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime());

  // 下拉刷新
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refreshData();
    setRefreshing(false);
  }, [refreshData]);

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('home.title')}</Text>
          <Text style={styles.subtitle}>{t('home.subtitle')}</Text>
        </View>

        <View style={styles.content}>
          {/* 今日状态 */}
          <AnimatedCard animationType="fadeIn" delay={0}>
            <StatusCard score={calculateScore()} />
          </AnimatedCard>

          {/* 今日摘要 */}
          <AnimatedCard animationType="slideUp" delay={100}>
            <SummaryCards
              weight={latestWeight?.weight}
              weightChange={weightChange}
              targetWeight={activeGoal?.targetValue}
              mealsCount={dietRecords.length}
              totalCalories={todayCalories}
              exerciseMinutes={todayMinutes}
              caloriesBurned={todayCaloriesBurned}
            />
          </AnimatedCard>

          {/* 快捷操作 */}
          <AnimatedCard animationType="slideUp" delay={200}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('record.title')}</Text>
              <QuickActions />
            </View>
          </AnimatedCard>

          {/* 今日记录 */}
          <AnimatedCard animationType="slideUp" delay={300}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('common.today')}</Text>
              {todayRecords.length > 0 ? (
                <TodayRecords records={todayRecords} />
              ) : (
                <EmptyState
                  icon="note"
                  title={t('home.noRecords')}
                  message={t('home.noRecordsMessage')}
                  actionTitle={t('record.title')}
                  onAction={() => {}}
                />
              )}
            </View>
          </AnimatedCard>
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
  scrollView: {
    flex: 1,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.background.primary,
  },
  title: {
    fontSize: theme.fontSize.h2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  subtitle: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  content: {
    padding: theme.spacing.xl,
    gap: theme.spacing.xl,
  },
  section: {
    gap: theme.spacing.md,
  },
  sectionTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
  },
});

// app/(tabs)/analysis.tsx
// 分析页面

import { logger } from '@/utils/logger';
import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { useDatabase } from '@/hooks/useDatabase';
import { useGoals } from '@/hooks/useGoals';
import { weightQueries } from '@/database/queries/weight';
import { dietQueries } from '@/database/queries/diet';
import { exerciseQueries } from '@/database/queries/exercise';
import { TimeRangeSelector, DateRange } from '@/components/TimeRangeSelector';
import { LineChart } from '@/components/charts/LineChart';
import { BarChart } from '@/components/charts/BarChart';
import { PieChart } from '@/components/charts/PieChart';

interface WeightData {
  date: string;
  weight: number;
}

interface DietData {
  date: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

interface ExerciseData {
  date: string;
  calories: number;
  duration: number;
}

interface ExerciseTypeData {
  exercise_type: string;
  count: number;
  total_duration: number;
}

export default function AnalysisScreen() {
  const { t } = useI18n();
  const { isReady } = useDatabase();
  const { goal } = useGoals();
  const [refreshing, setRefreshing] = useState(false);
  const [currentRange, setCurrentRange] = useState<DateRange | null>(null);

  // 数据状态
  const [weightData, setWeightData] = useState<WeightData[]>([]);
  const [weightStats, setWeightStats] = useState<any>(null);
  const [dietData, setDietData] = useState<DietData[]>([]);
  const [dietTotal, setDietTotal] = useState<any>(null);
  const [exerciseData, setExerciseData] = useState<ExerciseData[]>([]);
  const [exerciseTypeData, setExerciseTypeData] = useState<ExerciseTypeData[]>([]);
  const [exerciseTotal, setExerciseTotal] = useState<any>(null);

  // 加载数据
  const loadData = useCallback(async (range: DateRange) => {
    if (!isReady) return;

    try {
      // 并行加载所有数据
      const [
        weights,
        weightStatistics,
        dailyNutrition,
        totalNutrition,
        dailyExercise,
        typeStats,
        totalExercise,
      ] = await Promise.all([
        weightQueries.getDailyWeights(range.startDate, range.endDate),
        weightQueries.getStats(range.startDate, range.endDate),
        dietQueries.getDailyNutritionStats(range.startDate, range.endDate),
        dietQueries.getTotalNutrition(range.startDate, range.endDate),
        exerciseQueries.getDailyCaloriesStats(range.startDate, range.endDate),
        exerciseQueries.getTypeStats(range.startDate, range.endDate),
        exerciseQueries.getTotalStats(range.startDate, range.endDate),
      ]);

      setWeightData(weights || []);
      setWeightStats(weightStatistics);
      setDietData(dailyNutrition || []);
      setDietTotal(totalNutrition);
      setExerciseData(dailyExercise || []);
      setExerciseTypeData(typeStats || []);
      setExerciseTotal(totalExercise);
    } catch (error) {
      logger.error('[Analysis] Failed to load analysis data:', error);
    }
  }, [isReady]);

  // 处理时间范围变化
  const handleRangeChange = useCallback((range: DateRange) => {
    setCurrentRange(range);
    loadData(range);
  }, [loadData]);

  // 下拉刷新
  const handleRefresh = useCallback(async () => {
    if (currentRange) {
      setRefreshing(true);
      await loadData(currentRange);
      setRefreshing(false);
    }
  }, [currentRange, loadData]);

  // 格式化日期标签
  const formatDateLabel = (dateStr: string): string => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };

  // 准备体重图表数据
  const weightChartData = weightData.map((d) => ({
    date: formatDateLabel(d.date),
    value: d.weight,
  }));

  // 准备卡路里图表数据
  const caloriesChartData = dietData.map((d) => ({
    label: formatDateLabel(d.date),
    value: d.calories,
  }));

  // 准备营养成分饼图数据
  const nutritionPieData = dietTotal
    ? [
        { label: t('diet.protein'), value: dietTotal.protein, color: '#10B981' },
        { label: t('diet.carbs'), value: dietTotal.carbs, color: '#3B82F6' },
        { label: t('diet.fat'), value: dietTotal.fat, color: '#F59E0B' },
      ]
    : [];

  // 准备运动时长图表数据
  const exerciseDurationData = exerciseData.map((d) => ({
    label: formatDateLabel(d.date),
    value: d.duration,
  }));

  // 准备运动类型饼图数据
  const exerciseTypePieData = exerciseTypeData.map((d, i) => ({
    label: d.exercise_type,
    value: d.total_duration,
    color: ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EC4899', '#14B8A6'][i % 6],
  }));

  // 计算卡路里百分比
  const caloriesPercentage = goal?.dailyCalories && dietTotal
    ? Math.round((dietTotal.calories / (goal.dailyCalories * dietTotal.days)) * 100)
    : null;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('analysis.title')}</Text>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* 时间范围选择器 */}
        <TimeRangeSelector onRangeChange={handleRangeChange} />

        {/* 体重趋势 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('analysis.weightTrend')}</Text>
          {weightData.length > 0 ? (
            <>
              <LineChart
                data={weightChartData}
                height={200}
                color={theme.colors.primary.main}
                targetLine={goal?.targetWeight}
                targetLabel={t('home.targetWeight')}
                unit="kg"
              />
              {weightStats && (
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{weightStats.min}</Text>
                    <Text style={styles.statLabel}>{t('analysis.min')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{weightStats.max}</Text>
                    <Text style={styles.statLabel}>{t('analysis.max')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{weightStats.avg}</Text>
                    <Text style={styles.statLabel}>{t('analysis.avg')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text
                      style={[
                        styles.statValue,
                        {
                          color:
                            weightStats.change < 0
                              ? theme.colors.success
                              : weightStats.change > 0
                              ? theme.colors.error
                              : theme.colors.text.primary,
                        },
                      ]}
                    >
                      {weightStats.change > 0 ? '+' : ''}
                      {weightStats.change}
                    </Text>
                    <Text style={styles.statLabel}>{t('analysis.change')}</Text>
                  </View>
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('common.noData')}</Text>
            </View>
          )}
        </View>

        {/* 饮食分析 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('analysis.dietTrend')}</Text>
          {dietData.length > 0 ? (
            <>
              <BarChart
                data={caloriesChartData}
                height={180}
                color={theme.colors.warning}
                targetLine={goal?.dailyCalories}
                targetLabel={t('analysis.targetCalories')}
                unit="kcal"
              />
              {dietTotal && (
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>
                      {Math.round(dietTotal.calories / dietTotal.days)}
                    </Text>
                    <Text style={styles.statLabel}>{t('analysis.avgDaily')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{dietTotal.days}</Text>
                    <Text style={styles.statLabel}>{t('analysis.days')}</Text>
                  </View>
                  {caloriesPercentage !== null && (
                    <View style={styles.statItem}>
                      <Text
                        style={[
                          styles.statValue,
                          {
                            color:
                              caloriesPercentage <= 100
                                ? theme.colors.success
                                : theme.colors.error,
                          },
                        ]}
                      >
                        {caloriesPercentage}%
                      </Text>
                      <Text style={styles.statLabel}>{t('analysis.targetRatio')}</Text>
                    </View>
                  )}
                </View>
              )}

              {/* 营养成分饼图 */}
              {dietTotal && dietTotal.calories > 0 && (
                <View style={styles.nutritionSection}>
                  <Text style={styles.subTitle}>{t('analysis.nutritionRatio')}</Text>
                  <PieChart
                    data={nutritionPieData}
                    size={160}
                    showLegend={true}
                    showPercentages={true}
                    unit="g"
                  />
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('common.noData')}</Text>
            </View>
          )}
        </View>

        {/* 运动分析 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('analysis.exerciseTrend')}</Text>
          {exerciseData.length > 0 ? (
            <>
              <BarChart
                data={exerciseDurationData}
                height={180}
                color={theme.colors.info}
                unit={t('home.minutes')}
              />
              {exerciseTotal && (
                <View style={styles.statsRow}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{exerciseTotal.count}</Text>
                    <Text style={styles.statLabel}>{t('analysis.totalTimes')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{exerciseTotal.totalDuration}</Text>
                    <Text style={styles.statLabel}>{t('analysis.totalMinutes')}</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>{exerciseTotal.totalCalories}</Text>
                    <Text style={styles.statLabel}>{t('analysis.totalCalories')}</Text>
                  </View>
                </View>
              )}

              {/* 运动类型分布 */}
              {exerciseTypeData.length > 0 && (
                <View style={styles.nutritionSection}>
                  <Text style={styles.subTitle}>{t('analysis.exerciseTypeDistribution')}</Text>
                  <PieChart
                    data={exerciseTypePieData}
                    size={160}
                    showLegend={true}
                    showPercentages={true}
                    unit={t('home.minutes')}
                  />
                </View>
              )}
            </>
          ) : (
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>{t('common.noData')}</Text>
            </View>
          )}
        </View>

        {/* 底部间距 */}
        <View style={styles.bottomSpacer} />
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
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.background.primary,
  },
  title: {
    fontSize: theme.fontSize.h2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    backgroundColor: theme.colors.background.primary,
    marginTop: theme.spacing.base,
    paddingVertical: theme.spacing.lg,
    paddingHorizontal: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.base,
  },
  subTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.base,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.lg,
    paddingTop: theme.spacing.base,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  statLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: 4,
  },
  nutritionSection: {
    marginTop: theme.spacing.xl,
    alignItems: 'center',
  },
  emptyState: {
    height: 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
  },
  bottomSpacer: {
    height: theme.spacing.xl,
  },
});

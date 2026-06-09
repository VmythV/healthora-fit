// app/settings/goals.tsx
// 目标设置页面

import React, { useState, useEffect } from 'react'
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter } from 'expo-router'
import { theme } from '@/constants/theme'
import { useI18n } from '@/hooks/useI18n'
import { useGoals } from '@/hooks/useGoals'
import { useWeightRecords } from '@/hooks/useWeightRecords'
import { ProgressRing } from '@/components/charts/ProgressRing'
import { Icon, BackIcon } from '@/components/icons'
import { showNotification } from '@/components/ui'

export default function GoalsScreen() {
  const { t } = useI18n()
  const router = useRouter()
  const { activeGoal, goals, loadActive, loadAll, setGoal } = useGoals()
  const { latestWeight, loadLatest } = useWeightRecords()

  const [targetWeight, setTargetWeight] = useState('')
  const [isEditing, setIsEditing] = useState(false)

  useEffect(() => {
    loadActive('target_weight')
    loadAll()
    loadLatest()
  }, [])

  useEffect(() => {
    if (activeGoal && activeGoal.targetValue != null) {
      setTargetWeight(activeGoal.targetValue.toString())
    }
  }, [activeGoal])

  // 计算进度
  const calculateProgress = () => {
    if (!activeGoal || !latestWeight) return null

    const start = activeGoal.startValue || latestWeight.weight
    const target = activeGoal.targetValue
    const current = latestWeight.weight

    // 计算完成百分比
    const totalChange = Math.abs(start - target)
    const currentChange = Math.abs(start - current)
    const progress = totalChange > 0 ? Math.min(currentChange / totalChange, 1) : 0

    return {
      progress,
      current,
      target,
      remaining: Math.abs(current - target),
      isAchieved: Math.abs(current - target) < 0.5,
    }
  }

  const progressInfo = calculateProgress()

  // 保存目标
  const handleSave = async () => {
    const weight = parseFloat(targetWeight)
    if (isNaN(weight) || weight < 20 || weight > 300) {
      showNotification(t('weight.invalidWeight'), 'error')
      return
    }

    try {
      await setGoal({
        goalType: 'target_weight',
        targetValue: weight,
        startValue: latestWeight?.weight,
        startDate: new Date().toISOString().split('T')[0],
      })
      await loadAll()
      setIsEditing(false)
      showNotification(t('settings.goals.saveSuccess'), 'success')
    } catch (error) {
      showNotification(t('settings.goals.saveFailed'), 'error')
    }
  }

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <BackIcon size={24} color={theme.colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.title}>{t('settings.goals.title')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* 编辑模式：显示输入表单 */}
        {isEditing && (
          <View style={styles.formCard}>
            <Text style={styles.formTitle}>
              {activeGoal ? t('settings.goals.editTarget') : t('settings.goals.setTarget')}
            </Text>

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
                    setIsEditing(false)
                    if (activeGoal?.targetValue != null) {
                      setTargetWeight(activeGoal.targetValue.toString())
                    }
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

        {/* 查看模式：显示当前目标 */}
        {!isEditing && activeGoal && (
          <View style={styles.progressCard}>
            {/* 进度环（仅在有体重记录时显示） */}
            {progressInfo && (
              <>
                <ProgressRing
                  progress={progressInfo.progress}
                  size={120}
                  color={progressInfo.isAchieved ? theme.colors.success : theme.colors.primary.main}
                  label={
                    progressInfo.isAchieved
                      ? t('settings.goals.achieved')
                      : t('settings.goals.inProgress')
                  }
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
                      {progressInfo.remaining > 0
                        ? `${progressInfo.remaining.toFixed(1)} kg`
                        : t('settings.goals.achieved')}
                    </Text>
                  </View>
                </View>
              </>
            )}

            {/* 目标摘要（始终显示） */}
            <View style={[styles.goalSummary, !progressInfo && styles.goalSummaryFirst]}>
              <View style={styles.goalSummaryRow}>
                <Text style={styles.goalSummaryLabel}>{t('weight.targetWeight')}</Text>
                <Text style={styles.goalSummaryValue}>{activeGoal.targetValue} kg</Text>
              </View>
              {latestWeight && (
                <View style={styles.goalSummaryRow}>
                  <Text style={styles.goalSummaryLabel}>{t('weight.currentWeight')}</Text>
                  <Text style={styles.goalSummaryValue}>{latestWeight.weight} kg</Text>
                </View>
              )}
              {activeGoal.startDate && (
                <View style={styles.goalSummaryRow}>
                  <Text style={styles.goalSummaryLabel}>{t('common.date')}</Text>
                  <Text style={styles.goalSummaryValue}>{activeGoal.startDate}</Text>
                </View>
              )}
            </View>

            <TouchableOpacity style={styles.editButton} onPress={() => setIsEditing(true)}>
              <Text style={styles.editButtonText}>{t('common.edit')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 无目标：直接显示设置表单 */}
        {!isEditing && !activeGoal && (
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

            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>{t('common.save')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* 历史变更 */}
        {goals.length > 1 && (
          <View style={styles.historyCard}>
            <View style={styles.tipsTitleRow}>
              <Icon name="chart-bar" size={18} color={theme.colors.text.primary} />
              <Text style={styles.tipsTitle}>{t('settings.goals.history')}</Text>
            </View>
            {goals
              .filter((g) => g.goalType === 'target_weight')
              .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
              .map((goal, index, arr) => {
                const dateStr =
                  goal.startDate || (goal.createdAt ? goal.createdAt.split('T')[0] : '')
                const isLast = index === arr.length - 1
                return (
                  <View
                    key={goal.id}
                    style={[styles.historyItem, isLast ? undefined : styles.historyItemBorder]}
                  >
                    <View style={styles.historyLeft}>
                      <View
                        style={[
                          styles.historyDot,
                          {
                            backgroundColor: goal.isActive
                              ? theme.colors.primary.main
                              : theme.colors.text.tertiary,
                          },
                        ]}
                      />
                      <View>
                        <Text style={styles.historyValue}>{goal.targetValue} kg</Text>
                        <Text style={styles.historyDate}>{dateStr}</Text>
                      </View>
                    </View>
                    {goal.isActive ? (
                      <View style={styles.activeBadge}>
                        <Text style={styles.activeBadgeText}>{t('settings.ai.active')}</Text>
                      </View>
                    ) : null}
                  </View>
                )
              })}
            <Text style={styles.historyHint}>{t('settings.goals.historyHint')}</Text>
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
  )
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
  goalSummary: {
    width: '100%',
    marginTop: theme.spacing.xl,
  },
  goalSummaryFirst: {
    marginTop: 0,
  },
  goalSummaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  goalSummaryLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
  goalSummaryValue: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
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
  historyCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    marginBottom: theme.spacing.xl,
  },
  historyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: theme.spacing.md,
  },
  historyItemBorder: {
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  historyLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  historyDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  historyValue: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  historyDate: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  historyHint: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
  },
  activeBadge: {
    backgroundColor: theme.colors.primary.light,
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
  },
  activeBadgeText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.primary.dark,
  },
})

// components/exercise/ExerciseRecordForm.tsx
// 运动记录表单
//
// P2-21：用 DateTimeStepper 替换内嵌 100+ 行 RNModal 时间选择器

import { logger } from '@/utils/logger'
import React, { useState, useEffect } from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { theme } from '@/constants/theme'
import { useI18n } from '@/hooks/useI18n'
import { useExerciseRecords } from '@/hooks/useExerciseRecords'
import { ExerciseTypeSelector } from './ExerciseTypeSelector'
import { DurationInput } from './DurationInput'
import { ScreenshotPicker } from './ScreenshotPicker'
import { DateTimeStepper } from './DateTimeStepper'
import { Card } from '@/components/ui'
import { Icon } from '@/components/icons'
import { ExerciseAnalysisResult } from '@/types/exercise'
import { showNotification } from '@/components/ui'

interface ExerciseRecordFormProps {
  initialType?: string
  initialDuration?: number
  initialCalories?: number
  initialDistance?: number
  initialNote?: string
  recordId?: number // 编辑模式
  onSuccess?: () => void
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
}

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
  const { t } = useI18n()
  const router = useRouter()
  const { addRecord, updateRecord } = useExerciseRecords()

  const [exerciseType, setExerciseType] = useState(initialType)
  const [duration, setDuration] = useState(initialDuration)
  const [calories, setCalories] = useState(
    initialCalories || estimateCalories(initialType, initialDuration)
  )
  const [distance, setDistance] = useState(initialDistance || 0)
  const [note, setNote] = useState(initialNote)
  const [saving, setSaving] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<ExerciseAnalysisResult | null>(null)
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null)
  const [screenshotUri, setScreenshotUri] = useState<string | null>(null)
  const [recordTimestamp, setRecordTimestamp] = useState(new Date())

  // AI 识别成功消息自动消失
  useEffect(() => {
    if (aiSuccessMessage) {
      const timer = setTimeout(() => setAiSuccessMessage(null), 3000)
      return () => clearTimeout(timer)
    }
  }, [aiSuccessMessage])

  // 估算卡路里
  function estimateCalories(type: string, minutes: number): number {
    const rate = CALORIES_PER_MINUTE[type] || 6
    return Math.round(rate * minutes)
  }

  // 更新运动类型
  const handleTypeChange = (type: string) => {
    setExerciseType(type)
    setCalories(estimateCalories(type, duration))
  }

  // 更新时长
  const handleDurationChange = (minutes: number) => {
    setDuration(minutes)
    setCalories(estimateCalories(exerciseType, minutes))
  }

  // 截图分析完成 - 直接填充表单
  const handleAnalysisComplete = (result: ExerciseAnalysisResult, imageUri: string) => {
    setAnalysisResult(result)
    setScreenshotUri(imageUri)
    setExerciseType(result.exerciseType)
    setDuration(result.durationMinutes)
    setCalories(result.caloriesBurned)
    if (result.distanceKm) {
      setDistance(result.distanceKm)
    }
    // 如果 AI 识别到了时间，使用识别的时间
    if (result.timestamp) {
      setRecordTimestamp(new Date(result.timestamp))
    }
    setAiSuccessMessage(t('exercise.aiRecognitionSuccess'))
  }

  // 保存
  const handleSave = async () => {
    if (duration <= 0) {
      showNotification(t('exercise.invalidDuration'), 'error')
      return
    }

    setSaving(true)
    try {
      const recordData = {
        timestamp: recordTimestamp.toISOString(),
        exerciseType,
        durationMinutes: duration,
        caloriesBurned: calories,
        distanceKm: distance > 0 ? distance : undefined,
        source: (analysisResult ? 'screenshot' : 'manual') as 'manual' | 'screenshot',
        screenshotUri: screenshotUri || undefined,
        rawData: analysisResult?.rawText,
        note,
      }

      if (recordId) {
        await updateRecord(recordId, recordData)
      } else {
        await addRecord(recordData)
      }

      onSuccess?.()
      router.back()
    } catch (error) {
      logger.error('[ExerciseForm] 保存失败:', error)
      showNotification(t('error.saveFailed'), 'error')
    } finally {
      setSaving(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* AI 识别成功提示 */}
        {aiSuccessMessage && (
          <View style={styles.successBanner}>
            <Icon name="ai" size={16} color="#FFFFFF" />
            <Text style={styles.successBannerText}>{aiSuccessMessage}</Text>
          </View>
        )}

        {/* 截图识别 */}
        <View style={styles.section}>
          <ScreenshotPicker
            onAnalysisComplete={handleAnalysisComplete}
            onError={(error) => {
              setAnalysisResult(null)
              logger.error('[ExerciseForm] 截图分析错误:', error)
            }}
          />
        </View>

        {/* 运动时间 —— 用 DateTimeStepper 替代内嵌 RNModal */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('exercise.recordTime')}</Text>
          <DateTimeStepper value={recordTimestamp} onChange={setRecordTimestamp} />
        </View>

        {/* 运动类型 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('exercise.exerciseType')}</Text>
          <ExerciseTypeSelector value={exerciseType} onChange={handleTypeChange} />
        </View>

        {/* 运动时长 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('exercise.duration')}</Text>
          <DurationInput value={duration} onChange={handleDurationChange} />
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
  )
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
  // AI 识别成功横幅
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.xl,
    backgroundColor: theme.colors.success,
  },
  successBannerText: {
    fontSize: theme.fontSize.bodySm,
    fontWeight: theme.fontWeight.medium,
    color: '#FFFFFF',
  },
})

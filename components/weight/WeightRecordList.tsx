// components/weight/WeightRecordList.tsx
// 体重记录列表
//
// P1-8 优化：
// - 模块顶层 helper（formatDate / formatTime）
// - 行级 WeightRow 提取为 React.memo 组件
// - renderItem / keyExtractor / handleDelete 改 useCallback
// - 趋势（依赖 records[index+1]）在 renderItem 内联计算

import React, { useCallback } from 'react'
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ListRenderItem } from 'react-native'
import { theme } from '@/constants/theme'
import { useI18n } from '@/hooks/useI18n'
import { useWeightRecords } from '@/hooks/useWeightRecords'
import { WeightRecord } from '@/types/weight'
import { Card, Empty } from '@/components/ui'
import { Icon, TrendUpIcon, TrendDownIcon, TrendFlatIcon } from '@/components/icons'
import { showConfirm } from '@/components/ui'

interface WeightRecordListProps {
  onRecordPress?: (record: WeightRecord) => void
}

// 模块级 helper
function formatTime(timestamp: string): string {
  const date = new Date(timestamp)
  return date.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })
}

function formatDate(timestamp: string, todayLabel: string, yesterdayLabel: string): string {
  const date = new Date(timestamp)
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)
  if (date.toDateString() === today.toDateString()) return todayLabel
  if (date.toDateString() === yesterday.toDateString()) return yesterdayLabel
  return date.toLocaleDateString('zh-CN', { month: 'short', day: 'numeric' })
}

interface WeightRowProps {
  item: WeightRecord
  dateLabel: string
  kgLabel: string
  trendDiff: number | null
  onPress?: (record: WeightRecord) => void
  onDelete: (id: number) => void
}

const WeightRow = React.memo(function WeightRow({
  item,
  dateLabel,
  kgLabel,
  trendDiff,
  onPress,
  onDelete,
}: WeightRowProps) {
  const handlePress = useCallback(() => onPress?.(item), [item, onPress])
  const handleDelete = useCallback(() => onDelete(item.id), [item.id, onDelete])

  return (
    <TouchableOpacity onPress={handlePress} activeOpacity={0.7}>
      <Card style={styles.recordCard}>
        <View style={styles.recordHeader}>
          <View style={styles.dateInfo}>
            <Text style={styles.date}>{dateLabel}</Text>
            <Text style={styles.time}>{formatTime(item.timestamp)}</Text>
          </View>
          <View style={styles.weightInfo}>
            <Text style={styles.weightValue}>{item.weight.toFixed(1)}</Text>
            <Text style={styles.weightUnit}>{kgLabel}</Text>
          </View>
        </View>

        {trendDiff !== null && (
          <View style={styles.detailRow}>
            <View style={styles.trendRow}>
              {trendDiff > 0 && <TrendUpIcon size={14} color={theme.colors.error} />}
              {trendDiff < 0 && <TrendDownIcon size={14} color={theme.colors.success} />}
              {trendDiff === 0 && <TrendFlatIcon size={14} color={theme.colors.text.tertiary} />}
              <Text
                style={[
                  styles.trendText,
                  {
                    color:
                      trendDiff > 0
                        ? theme.colors.error
                        : trendDiff < 0
                          ? theme.colors.success
                          : theme.colors.text.tertiary,
                  },
                ]}
              >
                {Math.abs(trendDiff).toFixed(1)} {kgLabel}
              </Text>
            </View>
            {item.note && (
              <View style={styles.noteContainer}>
                <Icon name="note" size={14} color={theme.colors.text.tertiary} />
                <Text style={styles.noteText} numberOfLines={1}>
                  {' '}
                  {item.note}
                </Text>
              </View>
            )}
          </View>
        )}
        {!trendDiff && item.note && (
          <View style={styles.detailRow}>
            <View style={styles.noteContainer}>
              <Icon name="note" size={14} color={theme.colors.text.tertiary} />
              <Text style={styles.noteText} numberOfLines={1}>
                {' '}
                {item.note}
              </Text>
            </View>
          </View>
        )}

        <TouchableOpacity style={styles.deleteButton} onPress={handleDelete}>
          <Icon name="delete" size={16} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
      </Card>
    </TouchableOpacity>
  )
})

/**
 * 体重记录列表
 */
export function WeightRecordList({ onRecordPress }: WeightRecordListProps) {
  const { t } = useI18n()
  const { records, loading, deleteRecord } = useWeightRecords()

  const handleDelete = useCallback(
    async (id: number) => {
      const ok = await showConfirm({
        title: t('confirm.delete.title'),
        message: t('confirm.delete.message'),
        type: 'danger',
        confirmText: t('common.delete'),
        cancelText: t('common.cancel'),
      })
      if (ok) deleteRecord(id)
    },
    [t, deleteRecord]
  )

  const todayLabel = t('common.today')
  const yesterdayLabel = t('common.yesterday')

  const renderItem: ListRenderItem<WeightRecord> = useCallback(
    ({ item, index }) => {
      // 趋势：当前 vs 上一条（index+1 是更早的记录，因 DESC 排序）
      const trendDiff = index < records.length - 1 ? item.weight - records[index + 1].weight : null
      return (
        <WeightRow
          item={item}
          dateLabel={formatDate(item.timestamp, todayLabel, yesterdayLabel)}
          kgLabel={t('weight.kg')}
          trendDiff={trendDiff}
          onPress={onRecordPress}
          onDelete={handleDelete}
        />
      )
    },
    [records, todayLabel, yesterdayLabel, t, onRecordPress, handleDelete]
  )

  const keyExtractor = useCallback((item: WeightRecord) => item.id.toString(), [])

  if (!loading && records.length === 0) {
    return <Empty icon="weight" title={t('weight.noRecord')} description={t('common.comingSoon')} />
  }

  return (
    <FlatList
      data={records}
      renderItem={renderItem}
      keyExtractor={keyExtractor}
      contentContainerStyle={styles.list}
      showsVerticalScrollIndicator={false}
    />
  )
}

const styles = StyleSheet.create({
  list: {
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  recordCard: {
    padding: theme.spacing.base,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateInfo: {
    flex: 1,
  },
  date: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  time: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  weightInfo: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: theme.spacing.xs,
  },
  weightValue: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.primary.main,
  },
  weightUnit: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
    borderTopWidth: 1,
    borderTopColor: theme.colors.border.light,
  },
  trendRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  trendText: {
    fontSize: theme.fontSize.bodySm,
    fontWeight: theme.fontWeight.medium,
  },
  noteContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    justifyContent: 'flex-end',
  },
  noteText: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
  },
  deleteButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    padding: theme.spacing.xs,
  },
})

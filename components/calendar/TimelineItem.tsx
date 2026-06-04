// components/calendar/TimelineItem.tsx
// 时间轴单项组件

import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
} from 'react-native';
import Animated, { FadeInLeft } from 'react-native-reanimated';
import { theme } from '@/constants/theme';
import { Icon } from '@/components/icons';
import { IconName } from '@/components/icons/Icon';
import { DietRecord } from '@/types/diet';
import { ExerciseRecord } from '@/types/exercise';

export interface TimelineItemData {
  id: string;
  type: 'diet' | 'exercise';
  time: string;
  timeLabel: string;
  title: string;
  detail: string;
  iconName: IconName;
  record: DietRecord | ExerciseRecord;
}

interface TimelineItemProps {
  item: TimelineItemData;
  isLast: boolean;
  index: number;
  onPress: (item: TimelineItemData) => void;
}

/**
 * 时间轴单项
 */
export function TimelineItem({ item, isLast, index, onPress }: TimelineItemProps) {
  return (
    <Animated.View
      entering={FadeInLeft.delay(index * 80).duration(400).springify()}
      style={styles.container}
    >
      {/* 左侧时间轴 */}
      <View style={styles.timeAxis}>
        <Text style={styles.timeLabel}>{item.timeLabel}</Text>
        <View style={styles.dotLine}>
          <View style={styles.dot} />
          {!isLast && <View style={styles.line} />}
        </View>
      </View>

      {/* 右侧内容卡片 */}
      <TouchableOpacity
        style={styles.card}
        onPress={() => onPress(item)}
        activeOpacity={0.7}
      >
        <View style={styles.iconContainer}>
          <Icon
            name={item.iconName}
            size={22}
            color={theme.colors.primary.main}
          />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.title} numberOfLines={1}>
            {item.title}
          </Text>
          <Text style={styles.detail} numberOfLines={2}>
            {item.detail}
          </Text>
        </View>
        <Icon
          name="search"
          size={14}
          color={theme.colors.text.tertiary}
        />
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    paddingHorizontal: theme.spacing.xl,
  },
  timeAxis: {
    width: 55,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: theme.fontSize.caption,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.tertiary,
    marginBottom: 4,
  },
  dotLine: {
    alignItems: 'center',
    flex: 1,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: theme.colors.primary.main,
    borderWidth: 2,
    borderColor: theme.colors.primary.light,
  },
  line: {
    flex: 1,
    width: 2,
    backgroundColor: theme.colors.border.light,
    marginTop: 4,
    marginBottom: 4,
  },
  card: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    marginLeft: theme.spacing.md,
    marginBottom: theme.spacing.md,
    padding: theme.spacing.md,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
  },
  iconContainer: {
    width: 22,
    height: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  detail: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
    lineHeight: 16,
  },
});

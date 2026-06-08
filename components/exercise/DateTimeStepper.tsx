// components/exercise/DateTimeStepper.tsx
// 时间步进选择器
//
// P2-21：从 ExerciseRecordForm 抽出，封装 +/- 5min、+/- 1day、"现在"快捷键。
// 可在未来其他表单（饮食/体重）复用。

import React, { useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal as RNModal,
  Platform,
} from 'react-native';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';
import { theme } from '@/constants/theme';

interface DateTimeStepperProps {
  value: Date;
  onChange: (date: Date) => void;
  /** "+/-" 按钮的步进（分钟）。默认 5 */
  minuteStep?: number;
  /** "+/-" 按钮的步进（天）。默认 1 */
  dayStep?: number;
}

function pad(n: number): string {
  return String(n).padStart(2, '0');
}

function formatDateTime(d: Date): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function shiftDate(value: Date, field: 'year' | 'month' | 'day' | 'hour' | 'minute', delta: number): Date {
  const d = new Date(value);
  switch (field) {
    case 'year': d.setFullYear(d.getFullYear() + delta); break;
    case 'month': d.setMonth(d.getMonth() + delta); break;
    case 'day': d.setDate(d.getDate() + delta); break;
    case 'hour': d.setHours(d.getHours() + delta); break;
    case 'minute': d.setMinutes(d.getMinutes() + delta); break;
  }
  return d;
}

/**
 * 时间步进选择器（受控）
 *
 * - 显示当前 value
 * - 点击展开 Modal：日期 +/-1 天、时间 +/-minuteStep 分钟、"现在"快捷键
 * - 通过 onChange 回调新值
 */
export function DateTimeStepper({
  value,
  onChange,
  minuteStep = 5,
  dayStep = 1,
}: DateTimeStepperProps) {
  const [open, setOpen] = React.useState(false);

  const adjust = useCallback(
    (field: 'year' | 'month' | 'day' | 'hour' | 'minute', delta: number) => {
      onChange(shiftDate(value, field, delta));
    },
    [value, onChange]
  );

  const setNow = useCallback(() => {
    onChange(new Date());
  }, [onChange]);

  return (
    <>
      <TouchableOpacity onPress={() => setOpen(true)} activeOpacity={0.7}>
        <Card style={styles.timeCard}>
          <Icon name="calendar" size={20} color={theme.colors.primary.main} />
          <Text style={styles.timeText}>{formatDateTime(value)}</Text>
          <Icon name="edit" size={16} color={theme.colors.text.tertiary} />
        </Card>
      </TouchableOpacity>

      <RNModal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <TouchableOpacity
          style={styles.overlay}
          activeOpacity={1}
          onPress={() => setOpen(false)}
        >
          <TouchableOpacity
            style={styles.container}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
          >
            <Text style={styles.title}>选择日期时间</Text>

            <View style={styles.row}>
              <Text style={styles.label}>日期</Text>
              <View style={styles.adjust}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => adjust('day', -dayStep)}
                >
                  <Text style={styles.btnText}>-</Text>
                </TouchableOpacity>
                <Text style={styles.value}>
                  {`${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`}
                </Text>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => adjust('day', dayStep)}
                >
                  <Text style={styles.btnText}>+</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.row}>
              <Text style={styles.label}>时间</Text>
              <View style={styles.adjust}>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => adjust('minute', -minuteStep)}
                >
                  <Text style={styles.btnText}>-{minuteStep}m</Text>
                </TouchableOpacity>
                <Text style={styles.value}>
                  {`${pad(value.getHours())}:${pad(value.getMinutes())}`}
                </Text>
                <TouchableOpacity
                  style={styles.btn}
                  onPress={() => adjust('minute', minuteStep)}
                >
                  <Text style={styles.btnText}>+{minuteStep}m</Text>
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.quickRow}>
              <TouchableOpacity style={styles.quickBtn} onPress={setNow}>
                <Text style={styles.quickText}>现在</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.confirmBtn}
              onPress={() => setOpen(false)}
            >
              <Text style={styles.confirmText}>确定</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </TouchableOpacity>
      </RNModal>
    </>
  );
}

const styles = StyleSheet.create({
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.base,
  },
  timeText: {
    flex: 1,
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.primary,
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    width: '85%',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.xl,
    padding: theme.spacing.xl,
    ...theme.shadow.lg,
  },
  title: {
    fontSize: theme.fontSize.h4,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.text.secondary,
    width: 50,
  },
  adjust: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
  },
  btn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: theme.colors.background.tertiary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  btnText: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  value: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary.main,
    minWidth: 130,
    textAlign: 'center',
  },
  quickRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: theme.spacing.xl,
  },
  quickBtn: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.sm,
    backgroundColor: theme.colors.background.secondary,
    borderRadius: theme.borderRadius.full,
  },
  quickText: {
    fontSize: theme.fontSize.bodySm,
    fontWeight: theme.fontWeight.medium,
    color: theme.colors.primary.main,
  },
  confirmBtn: {
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
    paddingVertical: theme.spacing.md,
    alignItems: 'center',
  },
  confirmText: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
});

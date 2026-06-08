// app/exercise/record.tsx
// 运动记录页面
//
// P3-42：i18n headerTitle

import React, { useLayoutEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useI18n } from '@/hooks/useI18n';
import { ExerciseRecordForm } from '@/components/exercise';

export default function ExerciseRecordScreen() {
  const { t } = useI18n();
  const router = useRouter();
  useLayoutEffect(() => {
    router.setOptions({ title: t('exercise.recordTitle') });
  }, [router, t]);

  const params = useLocalSearchParams<{
    recordId?: string;
    exerciseType?: string;
    duration?: string;
    calories?: string;
    distance?: string;
    note?: string;
  }>();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <ExerciseRecordForm
        recordId={params.recordId ? Number(params.recordId) : undefined}
        initialType={params.exerciseType}
        initialDuration={params.duration ? Number(params.duration) : undefined}
        initialCalories={params.calories ? Number(params.calories) : undefined}
        initialDistance={params.distance ? Number(params.distance) : undefined}
        initialNote={params.note}
      />
    </SafeAreaView>
  );
}

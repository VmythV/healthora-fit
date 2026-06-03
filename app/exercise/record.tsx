// app/exercise/record.tsx
// 运动记录页面

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { ExerciseRecordForm } from '@/components/exercise';

export default function ExerciseRecordScreen() {
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

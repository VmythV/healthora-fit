// app/weight/record.tsx
// 体重记录页面

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams } from 'expo-router';
import { WeightRecordForm } from '@/components/weight';

export default function WeightRecordScreen() {
  const params = useLocalSearchParams<{
    recordId?: string;
    weight?: string;
  }>();

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <WeightRecordForm
        recordId={params.recordId ? Number(params.recordId) : undefined}
        initialWeight={params.weight ? Number(params.weight) : 70}
      />
    </SafeAreaView>
  );
}

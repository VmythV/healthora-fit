// app/weight/record.tsx
// 体重记录页面
//
// P3-42：i18n headerTitle

import React, { useLayoutEffect } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useLocalSearchParams, useRouter } from 'expo-router'
import { useNavigation } from '@react-navigation/native'
import { useI18n } from '@/hooks/useI18n'
import { WeightRecordForm } from '@/components/weight'

export default function WeightRecordScreen() {
  const { t } = useI18n()
  const router = useRouter()
  const navigation = useNavigation()
  // expo-router 6.x：useRouter() 不再有 setOptions，改用 useNavigation() from @react-navigation/native
  useLayoutEffect(() => {
    navigation.setOptions({ title: t('weight.recordTitle') })
  }, [navigation, t])

  const params = useLocalSearchParams<{
    recordId?: string
    weight?: string
  }>()

  return (
    <SafeAreaView style={{ flex: 1 }} edges={['bottom']}>
      <WeightRecordForm
        recordId={params.recordId ? Number(params.recordId) : undefined}
        initialWeight={params.weight ? Number(params.weight) : 70}
      />
    </SafeAreaView>
  )
}

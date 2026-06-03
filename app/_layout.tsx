import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <>
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="(tabs)" />
        <Stack.Screen
          name="diet/record"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: '记录饮食',
          }}
        />
        <Stack.Screen
          name="exercise/record"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: '记录运动',
          }}
        />
        <Stack.Screen
          name="weight/record"
          options={{
            presentation: 'modal',
            headerShown: true,
            headerTitle: '记录体重',
          }}
        />
        <Stack.Screen
          name="settings/ai-config"
          options={{
            headerShown: true,
            headerTitle: 'AI 配置',
          }}
        />
        <Stack.Screen
          name="icons-preview"
          options={{
            headerShown: true,
            headerTitle: '图标预览',
          }}
        />
      </Stack>
      <StatusBar style="auto" />
    </>
  );
}

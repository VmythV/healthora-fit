import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { ErrorBoundary } from '@/components/ErrorBoundary';

export default function RootLayout() {
  useFrameworkReady();

  return (
    <ErrorBoundary>
      <SafeAreaProvider>
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
            name="settings/goals"
            options={{
              headerShown: true,
              headerTitle: '目标设置',
            }}
          />
          <Stack.Screen
            name="settings/about"
            options={{
              headerShown: true,
              headerTitle: '关于',
            }}
          />
          <Stack.Screen
            name="settings/health-connect"
            options={{
              headerShown: true,
              headerTitle: '健康数据连接',
            }}
          />
        </Stack>
        <StatusBar style="auto" />
      </SafeAreaProvider>
    </ErrorBoundary>
  );
}

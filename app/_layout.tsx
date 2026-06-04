import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useDatabase } from '@/hooks/useDatabase';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import { logger } from '@/utils/logger';
import { NotificationProvider } from '@/hooks/useNotification';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';

export default function RootLayout() {
  useFrameworkReady();
  const { isReady, isLoading, error } = useDatabase();

  // 初始化日志系统
  useEffect(() => {
    logger.init();
  }, []);

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#10B981" />
        <Text style={styles.loadingText}>正在初始化...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>初始化失败</Text>
        <Text style={styles.errorDetail}>{error}</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <ErrorBoundary>
        <SafeAreaProvider>
          <NotificationProvider>
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
          </NotificationProvider>
        </SafeAreaProvider>
      </ErrorBoundary>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6B7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#EF4444',
    marginBottom: 8,
  },
  errorDetail: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
  },
});

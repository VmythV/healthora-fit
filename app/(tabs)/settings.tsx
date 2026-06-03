import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';

export default function SettingsScreen() {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>设置</Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 目标设置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🎯 目标设置</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuLabel}>目标体重</Text>
            <Text style={styles.menuValue}>未设置</Text>
          </TouchableOpacity>
        </View>

        {/* AI 配置 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🤖 AI 配置</Text>
          <TouchableOpacity
            style={styles.menuItem}
            onPress={() => router.push('/settings/ai-config')}
          >
            <Text style={styles.menuLabel}>AI 服务配置</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* 健康数据 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📱 健康数据连接</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuLabel}>Health Connect</Text>
            <Text style={styles.menuValue}>未连接</Text>
          </TouchableOpacity>
        </View>

        {/* 数据管理 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>📦 数据管理</Text>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuLabel}>导出数据</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.menuItem}>
            <Text style={styles.menuLabel}>导入数据</Text>
            <Text style={styles.menuArrow}>→</Text>
          </TouchableOpacity>
        </View>

        {/* 关于 */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>ℹ️ 关于</Text>
          <View style={styles.menuItem}>
            <Text style={styles.menuLabel}>版本</Text>
            <Text style={styles.menuValue}>1.0.0</Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  header: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    backgroundColor: theme.colors.background.primary,
  },
  title: {
    fontSize: theme.fontSize.h2,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
  },
  section: {
    marginTop: theme.spacing.xl,
  },
  sectionTitle: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.secondary,
    paddingHorizontal: theme.spacing.xl,
    marginBottom: theme.spacing.sm,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: theme.colors.background.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.base,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border.light,
  },
  menuLabel: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.primary,
  },
  menuValue: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
  },
  menuArrow: {
    fontSize: theme.fontSize.bodyLg,
    color: theme.colors.text.tertiary,
  },
});

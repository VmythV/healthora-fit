import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';

export default function HomeScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Healthora Fit</Text>
        <Text style={styles.subtitle}>健康光环</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.statusCard}>
          <Text style={styles.statusTitle}>今日状态</Text>
          <Text style={styles.statusStars}>⭐⭐⭐⭐☆</Text>
          <Text style={styles.statusText}>做得不错</Text>
        </View>

        <View style={styles.summaryRow}>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>--</Text>
            <Text style={styles.summaryLabel}>体重 (kg)</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>餐记录</Text>
          </View>
          <View style={styles.summaryCard}>
            <Text style={styles.summaryValue}>0</Text>
            <Text style={styles.summaryLabel}>运动 (min)</Text>
          </View>
        </View>

        <View style={styles.placeholder}>
          <Text style={styles.placeholderText}>首页功能开发中...</Text>
        </View>
      </View>
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
    color: theme.colors.primary.main,
  },
  subtitle: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
  },
  statusCard: {
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    alignItems: 'center',
    ...theme.shadow.md,
  },
  statusTitle: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  statusStars: {
    fontSize: 28,
    letterSpacing: 4,
  },
  statusText: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.primary.main,
    marginTop: theme.spacing.sm,
  },
  summaryRow: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  summaryCard: {
    flex: 1,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.base,
    alignItems: 'center',
    ...theme.shadow.sm,
  },
  summaryValue: {
    fontSize: theme.fontSize.h3,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  summaryLabel: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
  },
});

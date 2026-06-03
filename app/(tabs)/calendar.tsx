import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';

export default function CalendarScreen() {
  const { t } = useI18n();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('calendar.title')}</Text>
      </View>

      <View style={styles.content}>
        <View style={styles.placeholder}>
          <Text style={styles.placeholderIcon}>📅</Text>
          <Text style={styles.placeholderText}>{t('common.comingSoon')}</Text>
          <Text style={styles.placeholderSubtext}>{t('calendar.monthView')} / {t('calendar.dayView')}</Text>
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
    color: theme.colors.text.primary,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholder: {
    alignItems: 'center',
  },
  placeholderIcon: {
    fontSize: 64,
    marginBottom: theme.spacing.xl,
  },
  placeholderText: {
    fontSize: theme.fontSize.bodyLg,
    color: theme.colors.text.secondary,
    marginBottom: theme.spacing.sm,
  },
  placeholderSubtext: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
  },
});

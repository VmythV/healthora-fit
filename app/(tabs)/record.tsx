import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { Icon, ArrowRightIcon } from '@/components/icons';

export default function RecordScreen() {
  const router = useRouter();
  const { t } = useI18n();

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>{t('record.title')}</Text>
        <Text style={styles.subtitle}>{t('record.subtitle')}</Text>
      </View>

      <View style={styles.content}>
        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/diet/record')}
        >
          <View style={styles.cardIconContainer}>
            <Icon name="bowl" size={36} color={theme.colors.primary.main} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{t('record.diet.title')}</Text>
            <Text style={styles.cardDesc}>{t('record.diet.desc')}</Text>
          </View>
          <ArrowRightIcon size={20} color={theme.colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/exercise/record')}
        >
          <View style={styles.cardIconContainer}>
            <Icon name="running" size={36} color={theme.colors.primary.main} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{t('record.exercise.title')}</Text>
            <Text style={styles.cardDesc}>{t('record.exercise.desc')}</Text>
          </View>
          <ArrowRightIcon size={20} color={theme.colors.text.tertiary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.card}
          onPress={() => router.push('/weight/record')}
        >
          <View style={styles.cardIconContainer}>
            <Icon name="weight" size={36} color={theme.colors.primary.main} />
          </View>
          <View style={styles.cardInfo}>
            <Text style={styles.cardTitle}>{t('record.weight.title')}</Text>
            <Text style={styles.cardDesc}>{t('record.weight.desc')}</Text>
          </View>
          <ArrowRightIcon size={20} color={theme.colors.text.tertiary} />
        </TouchableOpacity>
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
  subtitle: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    padding: theme.spacing.xl,
    ...theme.shadow.md,
  },
  cardIconContainer: {
    marginRight: theme.spacing.base,
  },
  cardInfo: {
    flex: 1,
  },
  cardTitle: {
    fontSize: theme.fontSize.bodyLg,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  cardDesc: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.xs,
  },
});

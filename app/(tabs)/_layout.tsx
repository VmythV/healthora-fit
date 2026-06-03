import { Tabs } from 'expo-router';
import { Platform, View, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';
import { Icon } from '@/components/icons';
import { useI18n } from '@/hooks/useI18n';

export default function TabLayout() {
  const { t } = useI18n();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: theme.colors.primary.main,
        tabBarInactiveTintColor: theme.colors.tab.inactive,
        tabBarStyle: {
          backgroundColor: theme.colors.tab.background,
          borderTopColor: theme.colors.tab.border,
          height: Platform.OS === 'ios' ? 88 : 72,
          paddingBottom: Platform.OS === 'ios' ? 28 : 16,
          paddingTop: 8,
        },
        tabBarLabelStyle: {
          fontSize: theme.fontSize.tiny,
          fontWeight: theme.fontWeight.medium,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('tabs.home'),
          tabBarIcon: ({ color }) => <Icon name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: t('tabs.calendar'),
          tabBarIcon: ({ color }) => <Icon name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="record"
        options={{
          title: '',
          tabBarIcon: ({ color }) => <AddButton color={color} />,
        }}
      />
      <Tabs.Screen
        name="analysis"
        options={{
          title: t('tabs.analysis'),
          tabBarIcon: ({ color }) => <Icon name="chart" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: t('tabs.settings'),
          tabBarIcon: ({ color }) => <Icon name="settings" size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}

// 添加按钮（特殊样式）
function AddButton({ color }: { color: string }) {
  return (
    <View style={styles.addButtonContainer}>
      <View style={[styles.addButton, { backgroundColor: theme.colors.primary.main }]}>
        <Icon name="add" size={28} color="#FFFFFF" />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  addButtonContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.md,
  },
});

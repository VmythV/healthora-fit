import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export default function AIConfigScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>AI 配置页面 - 开发中</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.background.primary,
  },
  text: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
  },
});

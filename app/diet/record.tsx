import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@/constants/theme';

export default function DietRecordScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>饮食记录页面 - 开发中</Text>
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

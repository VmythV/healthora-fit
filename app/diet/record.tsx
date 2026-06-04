// app/diet/record.tsx
// 饮食记录页面

import { logger } from '@/utils/logger';
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { aiService } from '@/services/ai';
import { DietRecordForm } from '@/components/diet';
import { FoodItem } from '@/types/diet';
import { Icon } from '@/components/icons';

export default function DietRecordScreen() {
  const { t } = useI18n();
  const router = useRouter();
  const params = useLocalSearchParams<{
    photoUri?: string;
    foods?: string;
  }>();

  const [photoUri, setPhotoUri] = useState<string | undefined>(params.photoUri);
  const [foods, setFoods] = useState<FoodItem[]>(
    params.foods ? JSON.parse(params.foods) : []
  );
  const [analyzing, setAnalyzing] = useState(false);

  // 拍照
  const handleTakePhoto = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), t('error.permission'));
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      await analyzeImage(result.assets[0].uri);
    }
  };

  // 从相册选择
  const handlePickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert(t('common.error'), t('error.permission'));
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
      await analyzeImage(result.assets[0].uri);
    }
  };

  // AI 分析
  const analyzeImage = async (uri: string) => {
    logger.log('[AI] diet/record - 开始分析图片:', uri);
    // 确保配置已加载
    if (!aiService.isConfigured()) {
      logger.log('[AI] diet/record - 配置未缓存，尝试加载...');
      await aiService.loadConfig();
    }
    if (!aiService.isConfigured()) {
      logger.warn('[AI] diet/record - 配置加载后仍不可用');
      Alert.alert(
        t('settings.ai.title'),
        t('settings.ai.notConfigured'),
        [
          { text: t('common.cancel'), style: 'cancel' },
          {
            text: t('common.ok'),
            onPress: () => router.push('/settings/ai-config'),
          },
        ]
      );
      return;
    }

    setAnalyzing(true);
    try {
      const result = await aiService.analyzeFood(uri);
      logger.log('[AI] diet/record - 分析结果:', JSON.stringify(result));
      setFoods(result.foods);
    } catch (error) {
      logger.error('[AI] diet/record - 分析失败:', error);
      Alert.alert(t('common.error'), t('error.aiFailed'));
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      {/* 图片选择区域 */}
      {!photoUri && (
        <View style={styles.imageSection}>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={handleTakePhoto}
          >
            <Icon name="camera" size={32} color={theme.colors.primary.main} />
            <Text style={styles.imageButtonText}>{t('diet.takePhoto')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.imageButton}
            onPress={handlePickImage}
          >
            <Icon name="add" size={32} color={theme.colors.secondary.main} />
            <Text style={styles.imageButtonText}>{t('diet.fromGallery')}</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* 分析中提示 */}
      {analyzing && (
        <View style={styles.analyzing}>
          <ActivityIndicator size="large" color={theme.colors.primary.main} />
          <Text style={styles.analyzingText}>{t('diet.analyzing')}</Text>
        </View>
      )}

      {/* 表单 */}
      <DietRecordForm
        photoUri={photoUri}
        initialFoods={foods}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background.secondary,
  },
  imageSection: {
    flexDirection: 'row',
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  imageButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.xl,
    backgroundColor: theme.colors.background.primary,
    borderRadius: theme.borderRadius.lg,
    borderWidth: 2,
    borderColor: theme.colors.border.light,
    borderStyle: 'dashed',
  },
  imageButtonText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.sm,
  },
  analyzing: {
    padding: theme.spacing['2xl'],
    alignItems: 'center',
  },
  analyzingText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.secondary,
    marginTop: theme.spacing.base,
  },
});

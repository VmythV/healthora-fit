// components/exercise/ScreenshotPicker.tsx
// 运动截图选择组件

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { theme } from '@/constants/theme';
import { useI18n } from '@/hooks/useI18n';
import { Card } from '@/components/ui';
import { Icon } from '@/components/icons';
import { ExerciseAnalysisResult } from '@/types/exercise';
import { exerciseAnalysisService } from '@/services/exerciseAnalysis';
import { aiService } from '@/services/ai';

interface ScreenshotPickerProps {
  onAnalysisComplete: (result: ExerciseAnalysisResult, imageUri: string) => void;
  onError?: (error: string) => void;
}

/**
 * 运动截图选择组件
 */
export function ScreenshotPicker({ onAnalysisComplete, onError }: ScreenshotPickerProps) {
  const { t } = useI18n();
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 组件挂载时加载 AI 配置
  useEffect(() => {
    loadAiConfig();
  }, []);

  // 加载 AI 配置
  const loadAiConfig = async () => {
    try {
      console.log('[AI] ScreenshotPicker - 组件挂载，加载配置...');
      await aiService.loadConfig();
    } catch (err) {
      console.error('[AI] ScreenshotPicker - 加载配置失败:', err);
    }
  };

  // 选择图片
  const pickImage = async () => {
    try {
      // 请求权限
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('exercise.permissionRequired'));
        return;
      }

      // 选择图片
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: 'images',
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1.0,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        setError(null);
        analyzeImage(uri);
      }
    } catch (err) {
      console.error('选择图片失败:', err);
      Alert.alert(t('common.error'), t('exercise.imagePickFailed'));
    }
  };

  // 拍照
  const takePhoto = async () => {
    try {
      // 请求权限
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(t('common.error'), t('exercise.permissionRequired'));
        return;
      }

      // 拍照
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1.0,
      });

      if (!result.canceled && result.assets[0]) {
        const uri = result.assets[0].uri;
        setImageUri(uri);
        setError(null);
        analyzeImage(uri);
      }
    } catch (err) {
      console.error('拍照失败:', err);
      Alert.alert(t('common.error'), t('exercise.cameraFailed'));
    }
  };

  // 分析图片
  const analyzeImage = async (uri: string) => {
    console.log('[AI] ScreenshotPicker - 开始分析:', uri);
    setAnalyzing(true);
    setError(null);

    try {
      // 确保 AI 配置已加载
      if (!aiService.isConfigured()) {
        console.log('[AI] ScreenshotPicker - 配置未缓存，尝试加载...');
        await aiService.loadConfig();
      }

      if (!aiService.isConfigured()) {
        console.warn('[AI] ScreenshotPicker - 配置不可用');
        throw new Error(t('exercise.aiNotConfigured'));
      }

      const result = await exerciseAnalysisService.analyzeScreenshot(uri);
      console.log('[AI] ScreenshotPicker - 分析完成:', JSON.stringify(result));
      onAnalysisComplete(result, uri);
    } catch (err) {
      const message = err instanceof Error ? err.message : t('exercise.analysisFailed');
      console.error('[AI] ScreenshotPicker - 分析失败:', err);
      setError(message);
      onError?.(message);
    } finally {
      setAnalyzing(false);
    }
  };

  // 清除图片
  const clearImage = () => {
    setImageUri(null);
    setError(null);
  };

  return (
    <Card style={styles.container}>
      <View style={styles.header}>
        <Icon name="camera" size={20} color={theme.colors.primary.main} />
        <Text style={styles.title}>{t('exercise.screenshotAnalysis')}</Text>
      </View>

      <Text style={styles.description}>{t('exercise.screenshotDescription')}</Text>

      {/* 图片预览 */}
      {imageUri ? (
        <View style={styles.previewContainer}>
          <Image source={{ uri: imageUri }} style={styles.preview} resizeMode="contain" />
          <TouchableOpacity style={styles.clearButton} onPress={clearImage}>
            <Icon name="close" size={16} color={theme.colors.text.tertiary} />
          </TouchableOpacity>
        </View>
      ) : (
        <View style={styles.placeholder}>
          <Icon name="camera" size={48} color={theme.colors.text.tertiary} />
          <Text style={styles.placeholderText}>{t('exercise.noScreenshot')}</Text>
        </View>
      )}

      {/* 分析状态 */}
      {analyzing && (
        <View style={styles.analyzingContainer}>
          <ActivityIndicator size="small" color={theme.colors.primary.main} />
          <Text style={styles.analyzingText}>{t('exercise.analyzing')}</Text>
        </View>
      )}

      {/* 错误信息 */}
      {error && (
        <View style={styles.errorContainer}>
          <Icon name="warning" size={16} color={theme.colors.error} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      )}

      {/* 操作按钮 */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionButton} onPress={pickImage}>
          <Icon name="food" size={20} color="#FFFFFF" />
          <Text style={styles.actionText}>{t('exercise.fromGallery')}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
          <Icon name="camera" size={20} color="#FFFFFF" />
          <Text style={styles.actionText}>{t('exercise.takePhoto')}</Text>
        </TouchableOpacity>
      </View>
    </Card>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: theme.spacing.xl,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.sm,
  },
  title: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: theme.colors.text.primary,
  },
  description: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
    marginBottom: theme.spacing.lg,
    lineHeight: 20,
  },
  previewContainer: {
    position: 'relative',
    marginBottom: theme.spacing.lg,
  },
  preview: {
    width: '100%',
    height: 200,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.secondary,
  },
  clearButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    right: theme.spacing.sm,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: theme.colors.background.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...theme.shadow.sm,
  },
  placeholder: {
    height: 200,
    borderRadius: theme.borderRadius.lg,
    backgroundColor: theme.colors.background.secondary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: theme.spacing.lg,
  },
  placeholderText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.tertiary,
    marginTop: theme.spacing.sm,
  },
  analyzingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
  },
  analyzingText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.primary.main,
  },
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.base,
    backgroundColor: theme.colors.error + '10',
    borderRadius: theme.borderRadius.lg,
  },
  errorText: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.error,
    flex: 1,
  },
  actions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.sm,
    paddingVertical: theme.spacing.md,
    backgroundColor: theme.colors.primary.main,
    borderRadius: theme.borderRadius.lg,
    ...theme.shadow.sm,
  },
  actionText: {
    fontSize: theme.fontSize.body,
    fontWeight: theme.fontWeight.semibold,
    color: '#FFFFFF',
  },
});

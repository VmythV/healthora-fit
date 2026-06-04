// services/dataTransfer.ts
// 数据导入导出服务

import { logger } from '@/utils/logger';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { database } from '@/database';
import { dietQueries } from '@/database/queries/diet';
import { exerciseQueries } from '@/database/queries/exercise';
import { weightQueries } from '@/database/queries/weight';
import { goalQueries } from '@/database/queries/goals';
import { aiConfigQueries } from '@/database/queries/aiConfig';

interface ExportData {
  version: string;
  exportDate: string;
  data: {
    dietRecords: any[];
    exerciseRecords: any[];
    weightRecords: any[];
    goals: any[];
    aiConfig: any[];
  };
}

interface ImportResult {
  success: boolean;
  message: string;
  counts: {
    dietRecords: number;
    exerciseRecords: number;
    weightRecords: number;
    goals: number;
    aiConfig: number;
  };
}

export const dataTransferService = {
  /**
   * 导出所有数据为 JSON
   */
  async exportData(): Promise<string> {
    try {
      // 获取所有数据
      const [dietRecords, exerciseRecords, weightRecords, goals, aiConfig] = await Promise.all([
        dietQueries.getRecent(10000),
        exerciseQueries.getByDateRange('2000-01-01', '2099-12-31'),
        weightQueries.getRecent(10000),
        goalQueries.getAll(),
        aiConfigQueries.getAll(),
      ]);

      // 构建导出数据
      const exportData: ExportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        data: {
          dietRecords,
          exerciseRecords,
          weightRecords,
          goals,
          aiConfig,
        },
      };

      // 转换为 JSON 字符串
      const jsonString = JSON.stringify(exportData, null, 2);

      // 保存到临时文件
      const fileName = `healthora-fit-backup-${new Date().toISOString().split('T')[0]}.json`;
      const filePath = `${FileSystem.documentDirectory}${fileName}`;

      await FileSystem.writeAsStringAsync(filePath, jsonString, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 分享文件
      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(filePath, {
          mimeType: 'application/json',
          dialogTitle: '导出 Healthora Fit 数据',
          UTI: 'public.json',
        });
      }

      return filePath;
    } catch (error) {
      logger.error('[DataTransfer] Export failed:', error);
      throw new Error('数据导出失败');
    }
  },

  /**
   * 从 JSON 文件导入数据
   */
  async importData(): Promise<ImportResult> {
    try {
      // 选择文件
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('未选择文件');
      }

      const fileUri = result.assets[0].uri;

      // 读取文件内容
      const jsonString = await FileSystem.readAsStringAsync(fileUri, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // 解析 JSON
      const importData: ExportData = JSON.parse(jsonString);

      // 验证数据格式
      if (!importData.version || !importData.data) {
        throw new Error('无效的备份文件格式');
      }

      const counts = {
        dietRecords: 0,
        exerciseRecords: 0,
        weightRecords: 0,
        goals: 0,
        aiConfig: 0,
      };

      // 导入饮食记录
      if (importData.data.dietRecords && Array.isArray(importData.data.dietRecords)) {
        for (const record of importData.data.dietRecords) {
          try {
            await dietQueries.insert({
              timestamp: record.timestamp,
              photoUri: record.photo_uri,
              foodsJson: record.foods_json,
              totalCalories: record.total_calories,
              totalProtein: record.total_protein,
              totalCarbs: record.total_carbs,
              totalFat: record.total_fat,
              mealType: record.meal_type,
              note: record.note,
              isEdited: record.is_edited === 1,
            });
            counts.dietRecords++;
          } catch (e) {
            logger.warn('[DataTransfer] Skip diet record:', e);
          }
        }
      }

      // 导入运动记录
      if (importData.data.exerciseRecords && Array.isArray(importData.data.exerciseRecords)) {
        for (const record of importData.data.exerciseRecords) {
          try {
            await exerciseQueries.insert({
              timestamp: record.timestamp,
              exerciseType: record.exercise_type,
              durationMinutes: record.duration_minutes,
              caloriesBurned: record.calories_burned,
              distanceKm: record.distance_km,
              heartRateAvg: record.heart_rate_avg,
              source: record.source,
              screenshotUri: record.screenshot_uri,
              rawData: record.raw_data,
              note: record.note,
            });
            counts.exerciseRecords++;
          } catch (e) {
            logger.warn('[DataTransfer] Skip exercise record:', e);
          }
        }
      }

      // 导入体重记录
      if (importData.data.weightRecords && Array.isArray(importData.data.weightRecords)) {
        for (const record of importData.data.weightRecords) {
          try {
            await weightQueries.insert({
              timestamp: record.timestamp,
              weight: record.weight,
              bodyFatPercentage: record.body_fat_percentage,
              muscleMass: record.muscle_mass,
              source: record.source,
              note: record.note,
            });
            counts.weightRecords++;
          } catch (e) {
            logger.warn('[DataTransfer] Skip weight record:', e);
          }
        }
      }

      // 导入目标
      if (importData.data.goals && Array.isArray(importData.data.goals)) {
        for (const goal of importData.data.goals) {
          try {
            await goalQueries.set({
              goalType: goal.goal_type,
              targetValue: goal.target_value,
              startValue: goal.start_value,
              startDate: goal.start_date,
              targetDate: goal.target_date,
            });
            counts.goals++;
          } catch (e) {
            logger.warn('[DataTransfer] Skip goal:', e);
          }
        }
      }

      // 导入 AI 配置（不导入 API Key，保护隐私）
      if (importData.data.aiConfig && Array.isArray(importData.data.aiConfig)) {
        for (const config of importData.data.aiConfig) {
          try {
            await aiConfigQueries.save({
              apiEndpoint: config.api_endpoint,
              apiKey: '', // 不导入 API Key
              modelName: config.model_name,
            });
            counts.aiConfig++;
          } catch (e) {
            logger.warn('[DataTransfer] Skip AI config:', e);
          }
        }
      }

      return {
        success: true,
        message: '数据导入成功',
        counts,
      };
    } catch (error) {
      logger.error('[DataTransfer] Import failed:', error);
      throw error instanceof Error ? error : new Error('数据导入失败');
    }
  },
};

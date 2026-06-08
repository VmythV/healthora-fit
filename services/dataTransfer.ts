// services/dataTransfer.ts
// 数据导入导出服务
//
// P2-18：importData 改批量 + withTransactionAsync
// P2-19：exportData 用分批 yield 让 UI 不卡
// P2-36：insertMany 内部带去重（基于 timestamp）

import { logger } from '@/utils/logger';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as DocumentPicker from 'expo-document-picker';
import { database } from '@/database';
import { dietQueries, MAX_EXPORT_RECORDS as DIET_MAX } from '@/database/queries/diet';
import { exerciseQueries } from '@/database/queries/exercise';
import { weightQueries, MAX_EXPORT_RECORDS as WEIGHT_MAX } from '@/database/queries/weight';
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
  skipped: {
    dietRecords: number;
    exerciseRecords: number;
    weightRecords: number;
  };
}

/**
 * 让出主线程的辅助：每 50ms 让 UI 呼吸
 */
function yieldToUI(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

export const dataTransferService = {
  /**
   * 导出所有数据为 JSON
   *
   * P2-19：分批 yield —— 每张表查询完让出主线程，避免 UI 冻结。
   */
  async exportData(): Promise<string> {
    try {
      // 第一批：饮食 + 运动
      const [dietRecords, exerciseRecords] = await Promise.all([
        dietQueries.getRecent(DIET_MAX),
        exerciseQueries.getByDateRange('2000-01-01', '2099-12-31'),
      ]);
      await yieldToUI();

      // 第二批：体重 + 目标
      const [weightRecords, goals] = await Promise.all([
        weightQueries.getRecent(WEIGHT_MAX),
        goalQueries.getAll(),
      ]);
      await yieldToUI();

      // 第三批：AI 配置
      const aiConfig = await aiConfigQueries.getAll();
      await yieldToUI();

      const exportData: ExportData = {
        version: '1.0.0',
        exportDate: new Date().toISOString(),
        data: { dietRecords, exerciseRecords, weightRecords, goals, aiConfig },
      };

      const jsonString = JSON.stringify(exportData, null, 2);
      await yieldToUI();

      const fileName = `healthora-fit-backup-${new Date().toISOString().split('T')[0]}.json`;
      const file = new File(Paths.document, fileName);
      file.create({ overwrite: true });
      file.write(jsonString);

      const isAvailable = await Sharing.isAvailableAsync();
      if (isAvailable) {
        await Sharing.shareAsync(file.uri, {
          mimeType: 'application/json',
          dialogTitle: '导出 Healthora Fit 数据',
          UTI: 'public.json',
        });
      }

      return file.uri;
    } catch (error) {
      logger.error('[DataTransfer] Export failed:', error);
      throw new Error('数据导出失败');
    }
  },

  /**
   * 从 JSON 文件导入数据
   *
   * P2-18：用 db.withTransactionAsync 包裹整段导入，半途失败能 rollback
   * P2-36：insertMany 内部去重（基于 timestamp）
   */
  async importData(): Promise<ImportResult> {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: 'application/json',
        copyToCacheDirectory: true,
      });

      if (result.canceled || !result.assets || result.assets.length === 0) {
        throw new Error('未选择文件');
      }

      const fileUri = result.assets[0].uri;
      const jsonString = await new File(fileUri).text();
      const importData: ExportData = JSON.parse(jsonString);

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
      const skipped = {
        dietRecords: 0,
        exerciseRecords: 0,
        weightRecords: 0,
      };

      // P2-18：整段事务包住
      const db = database.getDatabase();
      await db.withTransactionAsync(async () => {
        // 饮食记录：批量 + 去重
        if (importData.data.dietRecords && Array.isArray(importData.data.dietRecords)) {
          const formatted = importData.data.dietRecords.map((r: any) => ({
            timestamp: r.timestamp,
            photoUri: r.photoUri,
            foodsJson: r.foodsJson,
            totalCalories: r.totalCalories,
            totalProtein: r.totalProtein,
            totalCarbs: r.totalCarbs,
            totalFat: r.totalFat,
            mealType: r.mealType,
            note: r.note,
            isEdited: r.isEdited === 1 || r.isEdited === true,
          }));
          const result = await dietQueries.insertMany(formatted);
          counts.dietRecords = result.inserted;
          skipped.dietRecords = result.skipped;
        }

        // 运动记录：批量 + 去重
        if (importData.data.exerciseRecords && Array.isArray(importData.data.exerciseRecords)) {
          const formatted = importData.data.exerciseRecords.map((r: any) => ({
            timestamp: r.timestamp,
            exerciseType: r.exerciseType,
            durationMinutes: r.durationMinutes,
            caloriesBurned: r.caloriesBurned,
            distanceKm: r.distanceKm,
            heartRateAvg: r.heartRateAvg,
            source: r.source,
            screenshotUri: r.screenshotUri,
            rawData: r.rawData,
            note: r.note,
          }));
          const result = await exerciseQueries.insertMany(formatted);
          counts.exerciseRecords = result.inserted;
          skipped.exerciseRecords = result.skipped;
        }

        // 体重记录：批量 + 去重
        if (importData.data.weightRecords && Array.isArray(importData.data.weightRecords)) {
          const formatted = importData.data.weightRecords.map((r: any) => ({
            timestamp: r.timestamp,
            weight: r.weight,
            bodyFatPercentage: r.bodyFatPercentage,
            muscleMass: r.muscleMass,
            source: r.source,
            note: r.note,
          }));
          const result = await weightQueries.insertMany(formatted);
          counts.weightRecords = result.inserted;
          skipped.weightRecords = result.skipped;
        }

        // 目标：逐条 set（其内部已有 deactivate + 保留历史语义，保留单条调用）
        if (importData.data.goals && Array.isArray(importData.data.goals)) {
          for (const goal of importData.data.goals) {
            try {
              await goalQueries.set({
                goalType: goal.goalType,
                targetValue: goal.targetValue,
                startValue: goal.startValue,
                startDate: goal.startDate,
                targetDate: goal.targetDate,
              });
              counts.goals++;
            } catch (e) {
              logger.warn('[DataTransfer] Skip goal:', e);
            }
          }
        }

        // AI 配置：逐条 save（apiKey 强制空，保护隐私）
        if (importData.data.aiConfig && Array.isArray(importData.data.aiConfig)) {
          for (const config of importData.data.aiConfig) {
            try {
              await aiConfigQueries.save({
                apiEndpoint: config.apiEndpoint,
                apiKey: '',
                modelName: config.modelName,
              });
              counts.aiConfig++;
            } catch (e) {
              logger.warn('[DataTransfer] Skip AI config:', e);
            }
          }
        }
      });

      return {
        success: true,
        message: '数据导入成功',
        counts,
        skipped,
      };
    } catch (error) {
      logger.error('[DataTransfer] Import failed:', error);
      throw error instanceof Error ? error : new Error('数据导入失败');
    }
  },
};

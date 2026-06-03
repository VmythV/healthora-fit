// services/health/mock.ts
// 模拟健康数据服务（用于开发和测试）

import {
  HealthDataService,
  HealthWeightData,
  HealthExerciseData,
  HealthSyncResult,
  HealthConnectionStatus,
  HealthPermissions,
} from './types';
import { weightQueries } from '@/database/queries/weight';
import { exerciseQueries } from '@/database/queries/exercise';

export class MockHealthDataService implements HealthDataService {
  private isConnected = false;
  private permissions: HealthPermissions = {
    readWeight: false,
    readExercise: false,
    writeWeight: false,
    writeExercise: false,
  };

  getPlatformName(): string {
    return 'Mock Health Service';
  }

  async isAvailable(): Promise<boolean> {
    return true; // 模拟服务始终可用
  }

  async requestPermissions(): Promise<HealthPermissions> {
    // 模拟权限请求
    this.permissions = {
      readWeight: true,
      readExercise: true,
      writeWeight: true,
      writeExercise: true,
    };
    this.isConnected = true;
    return this.permissions;
  }

  async checkPermissions(): Promise<HealthPermissions> {
    return this.permissions;
  }

  async getConnectionStatus(): Promise<HealthConnectionStatus> {
    return {
      isConnected: this.isConnected,
      platform: 'mock',
      lastSyncDate: this.isConnected ? new Date().toISOString() : undefined,
    };
  }

  async readWeightData(startDate: string, endDate: string): Promise<HealthWeightData[]> {
    if (!this.permissions.readWeight) {
      throw new Error('No permission to read weight data');
    }

    // 生成模拟数据
    const data: HealthWeightData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // 随机生成体重数据（70-75 kg 之间波动）
      const baseWeight = 72;
      const variation = Math.sin(d.getTime() / (1000 * 60 * 60 * 24 * 7)) * 2;
      const weight = baseWeight + variation + (Math.random() - 0.5) * 0.5;

      data.push({
        date: d.toISOString().split('T')[0],
        weight: Math.round(weight * 10) / 10,
        source: 'Mock Health Service',
      });
    }

    return data;
  }

  async readExerciseData(startDate: string, endDate: string): Promise<HealthExerciseData[]> {
    if (!this.permissions.readExercise) {
      throw new Error('No permission to read exercise data');
    }

    // 生成模拟数据
    const data: HealthExerciseData[] = [];
    const start = new Date(startDate);
    const end = new Date(endDate);
    const exerciseTypes = ['running', 'walking', 'cycling', 'strength'];

    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      // 随机决定是否有运动（70% 概率）
      if (Math.random() > 0.3) {
        const exerciseType = exerciseTypes[Math.floor(Math.random() * exerciseTypes.length)];
        const duration = Math.floor(Math.random() * 60) + 20; // 20-80 分钟
        const caloriesPerMinute = exerciseType === 'running' ? 10 :
          exerciseType === 'cycling' ? 8 :
          exerciseType === 'strength' ? 6 : 4;

        data.push({
          date: d.toISOString().split('T')[0],
          exerciseType,
          durationMinutes: duration,
          caloriesBurned: duration * caloriesPerMinute,
          source: 'Mock Health Service',
        });
      }
    }

    return data;
  }

  async syncData(): Promise<HealthSyncResult> {
    if (!this.isConnected) {
      return {
        success: false,
        message: '未连接到健康平台',
        counts: { weight: 0, exercise: 0 },
        errors: ['Not connected'],
      };
    }

    try {
      // 获取最近 30 天的数据
      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // 读取数据
      const [weightData, exerciseData] = await Promise.all([
        this.readWeightData(startDate, endDate),
        this.readExerciseData(startDate, endDate),
      ]);

      // 保存到数据库
      let weightCount = 0;
      let exerciseCount = 0;

      for (const weight of weightData) {
        try {
          await weightQueries.insert({
            timestamp: `${weight.date}T12:00:00`,
            weight: weight.weight,
            bodyFatPercentage: weight.bodyFatPercentage,
            source: 'health_sync',
          });
          weightCount++;
        } catch (e) {
          // 忽略重复数据
        }
      }

      for (const exercise of exerciseData) {
        try {
          await exerciseQueries.insert({
            timestamp: `${exercise.date}T18:00:00`,
            exerciseType: exercise.exerciseType,
            durationMinutes: exercise.durationMinutes,
            caloriesBurned: exercise.caloriesBurned,
            distanceKm: exercise.distanceKm,
            source: 'health_sync',
          });
          exerciseCount++;
        } catch (e) {
          // 忽略重复数据
        }
      }

      return {
        success: true,
        message: '数据同步成功',
        counts: {
          weight: weightCount,
          exercise: exerciseCount,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: '数据同步失败',
        counts: { weight: 0, exercise: 0 },
        errors: [error instanceof Error ? error.message : 'Unknown error'],
      };
    }
  }

  async disconnect(): Promise<void> {
    this.isConnected = false;
    this.permissions = {
      readWeight: false,
      readExercise: false,
      writeWeight: false,
      writeExercise: false,
    };
  }
}

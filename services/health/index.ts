// services/health/index.ts
// 健康数据服务入口

import { HealthDataService } from './types'
import { MockHealthDataService } from './mock'

// 单例实例
let healthService: HealthDataService | null = null

/**
 * 获取健康数据服务实例
 */
export function getHealthService(): HealthDataService {
  if (!healthService) {
    // 目前使用模拟服务
    // 未来可以根据平台使用真实的服务
    // if (Platform.OS === 'android') {
    //   healthService = new AndroidHealthConnectService();
    // } else if (Platform.OS === 'ios') {
    //   healthService = new IOSHealthKitService();
    // } else {
    //   healthService = new MockHealthDataService();
    // }
    healthService = new MockHealthDataService()
  }
  return healthService
}

/**
 * 重置服务实例（用于测试）
 */
export function resetHealthService(): void {
  healthService = null
}

export * from './types'

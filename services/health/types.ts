// services/health/types.ts
// 健康数据服务类型定义

/**
 * 健康数据类型
 */
export type HealthDataType = 'weight' | 'exercise' | 'steps' | 'heart_rate'

/**
 * 体重数据
 */
export interface HealthWeightData {
  date: string // ISO 日期字符串
  weight: number // kg
  bodyFatPercentage?: number
  source: string // 数据来源
}

/**
 * 运动数据
 */
export interface HealthExerciseData {
  date: string
  exerciseType: string
  durationMinutes: number
  caloriesBurned?: number
  distanceKm?: number
  source: string
}

/**
 * 健康数据同步结果
 */
export interface HealthSyncResult {
  success: boolean
  message: string
  counts: {
    weight: number
    exercise: number
  }
  errors?: string[]
}

/**
 * 健康平台连接状态
 */
export interface HealthConnectionStatus {
  isConnected: boolean
  platform: 'health_connect' | 'healthkit' | 'mock'
  lastSyncDate?: string
  error?: string
}

/**
 * 健康数据权限
 */
export interface HealthPermissions {
  readWeight: boolean
  readExercise: boolean
  writeWeight: boolean
  writeExercise: boolean
}

/**
 * 健康数据服务接口
 */
export interface HealthDataService {
  /**
   * 获取平台名称
   */
  getPlatformName(): string

  /**
   * 检查是否可用
   */
  isAvailable(): Promise<boolean>

  /**
   * 请求权限
   */
  requestPermissions(): Promise<HealthPermissions>

  /**
   * 检查权限状态
   */
  checkPermissions(): Promise<HealthPermissions>

  /**
   * 获取连接状态
   */
  getConnectionStatus(): Promise<HealthConnectionStatus>

  /**
   * 读取体重数据
   */
  readWeightData(startDate: string, endDate: string): Promise<HealthWeightData[]>

  /**
   * 读取运动数据
   */
  readExerciseData(startDate: string, endDate: string): Promise<HealthExerciseData[]>

  /**
   * 同步数据到应用
   */
  syncData(): Promise<HealthSyncResult>

  /**
   * 断开连接
   */
  disconnect(): Promise<void>
}

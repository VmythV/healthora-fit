// 体重记录相关类型

export type WeightSource = 'manual' | 'health_connect'

export interface WeightRecord {
  id: number
  timestamp: string
  weight: number // kg, 精确到 0.1
  bodyFatPercentage?: number
  muscleMass?: number
  source: WeightSource
  note?: string
  createdAt: string
}

// 体重统计
export interface WeightStats {
  min: number
  max: number
  avg: number
  first: number
  last: number
  change: number
}

// 创建记录的输入类型
export interface CreateWeightRecordInput {
  timestamp: string
  weight: number
  bodyFatPercentage?: number
  muscleMass?: number
  source: WeightSource
  note?: string
}

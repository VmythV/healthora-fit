// 运动记录相关类型

export type ExerciseSource = 'manual' | 'screenshot' | 'health_connect';

export interface ExerciseRecord {
  id: number;
  timestamp: string;
  exerciseType: string;
  durationMinutes: number;
  caloriesBurned?: number;
  distanceKm?: number;
  heartRateAvg?: number;
  source: ExerciseSource;
  screenshotUri?: string;
  rawData?: string;        // 原始同步数据 JSON
  note?: string;
  createdAt: string;
  updatedAt: string;
}

// AI 分析结果
export interface ExerciseAnalysisResult {
  exerciseType: string;
  durationMinutes: number;
  caloriesBurned: number;
  distanceKm?: number;
  heartRateAvg?: number;
  timestamp?: string;
  confidence: 'high' | 'medium' | 'low';
  rawText?: string;
}

// 创建记录的输入类型
export interface CreateExerciseRecordInput {
  timestamp: string;
  exerciseType: string;
  durationMinutes: number;
  caloriesBurned?: number;
  distanceKm?: number;
  source: ExerciseSource;
  screenshotUri?: string;
  note?: string;
}

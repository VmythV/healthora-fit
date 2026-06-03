// 目标相关类型

export type GoalType = 'target_weight' | 'daily_calories' | 'weekly_exercise' | 'exercise_duration';

export interface Goal {
  id: number;
  goalType: GoalType;
  targetValue: number;
  startValue?: number;
  startDate?: string;
  targetDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// 创建目标的输入类型
export interface CreateGoalInput {
  goalType: GoalType;
  targetValue: number;
  startValue?: number;
  startDate?: string;
  targetDate?: string;
}

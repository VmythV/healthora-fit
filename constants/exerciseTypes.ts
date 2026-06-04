// 运动类型定义

export interface ExerciseType {
  id: string;
  name: string;
  icon: string;
  caloriesPerMinute: number; // 平均每分钟消耗卡路里
}

export const EXERCISE_TYPES: ExerciseType[] = [
  { id: 'running', name: '跑步', icon: 'running', caloriesPerMinute: 10 },
  { id: 'walking', name: '步行', icon: 'walking', caloriesPerMinute: 5 },
  { id: 'cycling', name: '骑行', icon: 'cycling', caloriesPerMinute: 8 },
  { id: 'swimming', name: '游泳', icon: 'swimming', caloriesPerMinute: 11 },
  { id: 'strength', name: '力量训练', icon: 'strength', caloriesPerMinute: 7 },
  { id: 'yoga', name: '瑜伽', icon: 'yoga', caloriesPerMinute: 4 },
  { id: 'hiit', name: 'HIIT', icon: 'hiit', caloriesPerMinute: 12 },
  { id: 'other', name: '其他', icon: 'other-exercise', caloriesPerMinute: 6 },
];

export function getExerciseType(id: string): ExerciseType | undefined {
  return EXERCISE_TYPES.find((type) => type.id === id);
}

export function calculateCalories(exerciseTypeId: string, durationMinutes: number): number {
  const type = getExerciseType(exerciseTypeId);
  if (!type) return 0;
  return Math.round(type.caloriesPerMinute * durationMinutes);
}

// 餐次类型定义

export interface MealType {
  id: string
  name: string
  icon: string
  timeRange: {
    start: number // 小时 (0-23)
    end: number
  }
}

export const MEAL_TYPES: MealType[] = [
  {
    id: 'breakfast',
    name: '早餐',
    icon: 'sunrise',
    timeRange: { start: 5, end: 10 },
  },
  {
    id: 'lunch',
    name: '午餐',
    icon: 'plate',
    timeRange: { start: 11, end: 14 },
  },
  {
    id: 'dinner',
    name: '晚餐',
    icon: 'moon',
    timeRange: { start: 17, end: 21 },
  },
  {
    id: 'snack',
    name: '加餐',
    icon: 'cookie',
    timeRange: { start: 0, end: 23 },
  },
]

export function getMealType(id: string): MealType | undefined {
  return MEAL_TYPES.find((type) => type.id === id)
}

export function suggestMealType(): string {
  const hour = new Date().getHours()

  for (const type of MEAL_TYPES) {
    if (type.id === 'snack') continue // 跳过加餐
    if (hour >= type.timeRange.start && hour <= type.timeRange.end) {
      return type.id
    }
  }

  return 'snack' // 默认返回加餐
}

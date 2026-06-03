// 饮食记录相关类型

export interface FoodItem {
  name: string;
  portion: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
}

export type MealType = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export interface DietRecord {
  id: number;
  timestamp: string;        // ISO 8601 格式
  photoUri?: string;        // 照片本地路径
  foodsJson?: string;       // FoodItem[] 的 JSON 字符串
  totalCalories?: number;
  totalProtein?: number;
  totalCarbs?: number;
  totalFat?: number;
  mealType?: MealType;
  note?: string;
  isEdited: boolean;
  createdAt: string;
  updatedAt: string;
}

// 解析后的饮食记录（包含解析后的 foods 数组）
export interface ParsedDietRecord extends Omit<DietRecord, 'foodsJson'> {
  foods: FoodItem[];
}

// AI 分析结果
export interface DietAnalysisResult {
  foods: FoodItem[];
  total: {
    calories: number;
    protein: number;
    carbs: number;
    fat: number;
  };
  mealType: MealType;
  confidence: 'high' | 'medium' | 'low';
}

// 创建记录的输入类型
export interface CreateDietRecordInput {
  timestamp: string;
  photoUri?: string;
  foods: FoodItem[];
  mealType: MealType;
  note?: string;
  isEdited?: boolean;
}

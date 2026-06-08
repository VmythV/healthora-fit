// constants/aiPrompts.ts
// AI 服务 prompt 集中管理
//
// P2-17 抽离：原本两个 service 各硬编码 20 行 prompt 字符串，
// 现统一在此文件维护，便于调优与未来 i18n 化。
//
// 注意：改 prompt 会改变 LLM 输出 JSON 形状，回归测试需关注。

export const AI_PROMPTS = {
  foodAnalysis: `请分析这张食物图片，识别出所有食物并估算营养成分。

请以 JSON 格式返回，格式如下：
{
  "foods": [
    {
      "name": "食物名称",
      "portion": "份量描述（如：1碗、100g）",
      "calories": 卡路里数值,
      "protein": 蛋白质克数,
      "carbs": 碳水化合物克数,
      "fat": 脂肪克数
    }
  ]
}

注意：
1. 请尽可能准确估算
2. 如果无法确定具体数值，给出合理估计
3. 只返回 JSON，不要有其他文字`,

  exerciseAnalysis: `请分析这张运动截图，提取运动数据。这可能是运动 App 的截图、智能手表的运动记录、或者运动设备的显示屏。

请以 JSON 格式返回，格式如下：
{
  "exerciseType": "运动类型（如：running, walking, cycling, swimming, strength, yoga, hiit, other）",
  "durationMinutes": 运动时长（分钟）,
  "caloriesBurned": 消耗卡路里,
  "distanceKm": 距离（公里，如果没有则为 null）,
  "heartRateAvg": 平均心率（如果没有则为 null）,
  "timestamp": "截图中显示的运动时间（ISO 8601 格式，如截图中有时钟或时间信息则提取，否则为 null）",
  "confidence": "识别置信度（high/medium/low）"
}

注意：
1. 运动类型必须是以下之一：running, walking, cycling, swimming, strength, yoga, hiit, other
2. 如果无法识别具体运动类型，请使用 "other"
3. 时长必须是数字（分钟）
4. 卡路里必须是数字
5. timestamp 是截图中显示的运动开始时间，不是截图时间。如果截图中没有时间信息，则设为 null
6. 只返回 JSON，不要有其他文字`,
} as const;

export type AiPromptKey = keyof typeof AI_PROMPTS;

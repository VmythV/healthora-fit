# 日历页面禁用未来日期

## 需求描述

用户希望日历页面不能选择今天之后的时间，只能选择今天及之前的日期。

## 合理性评估

- ✅ **合理**
- 健康管理应用通常记录已经发生的事情（饮食、运动、体重）
- 选择未来日期没有实际意义，可能导致用户困惑
- 禁用未来日期可以提升用户体验

## 架构影响

### 数据模型
- 无变更

### 组件变更
- ✅ 需要修改 `components/calendar/CalendarGrid.tsx`
  - 添加 `maxDate` 属性
  - 禁用超过最大日期的日期
  - 禁用下个月导航（当月已是最大月份时）

### 服务变更
- 无变更

## 设计方案

### 功能设计

1. **日期禁用**
   - 超过今天的日期显示为灰色，不可点击
   - 今天的日期正常显示，可点击
   - 过去的日期正常显示，可点击

2. **月份导航限制**
   - 当前月份时，下个月按钮禁用
   - 可以往前导航到过去的月份

3. **视觉反馈**
   - 禁用日期：灰色文字，不可点击
   - 今天：特殊样式（已有）
   - 选中日期：特殊样式（已有）

### 技术设计

1. **CalendarGrid 组件修改**
   ```typescript
   interface CalendarGridProps {
     // ... 现有属性
     maxDate?: string; // YYYY-MM-DD，最大可选日期
   }
   ```

2. **日期判断逻辑**
   ```typescript
   const isFutureDate = (y: number, m: number, d: number) => {
     if (!maxDate) return false;
     const dateStr = formatDate(y, m, d);
     return dateStr > maxDate;
   };
   ```

3. **月份导航限制**
   ```typescript
   const canGoNextMonth = () => {
     if (!maxDate) return true;
     const maxDateObj = new Date(maxDate);
     const nextMonth = new Date(year, month + 1, 1);
     return nextMonth <= maxDateObj;
   };
   ```

### 实现步骤

1. ✅ 修改 `CalendarGrid.tsx` 组件
   - 添加 `maxDate` 属性
   - 添加 `isFutureDate` 判断函数
   - 修改日期渲染逻辑，禁用未来日期
   - 修改月份导航逻辑，限制下个月

2. ✅ 修改 `calendar.tsx` 页面
   - 传递 `maxDate` 为今天日期

3. ✅ 测试验证
   - 测试未来日期是否禁用
   - 测试月份导航是否限制
   - 测试今天和过去日期是否正常

## 工作量估算

- **预计时间**：0.5 天
- **复杂度**：低

## TODOLIST 安排

添加到现有任务中，作为日历功能的优化。

---

**创建时间**：2026-06-04
**状态**：待开发

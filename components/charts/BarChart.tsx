// components/charts/BarChart.tsx
// 柱状图组件

import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Dimensions } from 'react-native';
import Svg, { Rect, Line, Text as SvgText } from 'react-native-svg';
import { theme } from '@/constants/theme';

interface DataPoint {
  label: string;
  value: number;
  color?: string;
}

interface BarChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showValues?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  targetLine?: number;
  targetLabel?: string;
  unit?: string;
  animated?: boolean;
  duration?: number;
  barRadius?: number;
  barWidth?: number;
}

/**
 * 柱状图组件
 *
 * @example
 * ```tsx
 * const data = [
 *   { label: '周一', value: 1800 },
 *   { label: '周二', value: 2200 },
 *   { label: '周三', value: 1600 },
 *   { label: '周四', value: 2000 },
 *   { label: '周五', value: 1900 },
 *   { label: '周六', value: 2400 },
 *   { label: '周日', value: 1700 },
 * ];
 *
 * <BarChart data={data} />
 *
 * // 带目标线
 * <BarChart
 *   data={data}
 *   targetLine={2000}
 *   targetLabel="目标"
 *   unit="kcal"
 * />
 *
 * // 自定义颜色
 * <BarChart
 *   data={data.map((d, i) => ({
 *     ...d,
 *     color: i % 2 === 0 ? '#10B981' : '#3B82F6',
 *   }))}
 * />
 * ```
 */
export function BarChart({
  data,
  width = Dimensions.get('window').width - 48,
  height = 200,
  color = theme.colors.primary.main,
  showValues = true,
  showGrid = true,
  showLabels = true,
  targetLine,
  targetLabel,
  unit = '',
  animated = true,
  duration = 800,
  barRadius = 4,
  barWidth,
}: BarChartProps) {
  const animatedValue = useRef(new Animated.Value(0)).current;

  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>暂无数据</Text>
      </View>
    );
  }

  // 计算数据范围
  const values = data.map((d) => d.value);
  const maxValue = Math.max(...values, targetLine || 0);
  const valueRange = maxValue || 1;

  // 图表边距
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  // 计算绘图区域
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // 计算柱子宽度
  const gap = chartWidth * 0.2 / (data.length + 1);
  const calculatedBarWidth = barWidth || (chartWidth - gap * (data.length + 1)) / data.length;

  // 动画效果
  useEffect(() => {
    if (animated) {
      Animated.timing(animatedValue, {
        toValue: 1,
        useNativeDriver: false,
        duration,
      }).start();
    } else {
      animatedValue.setValue(1);
    }
  }, [animated, duration]);

  // 计算目标线位置
  const targetY = targetLine
    ? paddingTop + ((maxValue - targetLine) / valueRange) * chartHeight
    : null;

  return (
    <View style={[styles.container, { width, height }]}>
      <Svg width={width} height={height}>
        {/* 网格线 */}
        {showGrid && (
          <>
            {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
              const y = paddingTop + ratio * chartHeight;
              const value = maxValue - ratio * valueRange;
              return (
                <React.Fragment key={ratio}>
                  <Line
                    x1={paddingLeft}
                    y1={y}
                    x2={width - paddingRight}
                    y2={y}
                    stroke={theme.colors.border.light}
                    strokeWidth={1}
                    strokeDasharray="4,4"
                  />
                  {showLabels && (
                    <SvgText
                      x={paddingLeft - 8}
                      y={y + 4}
                      textAnchor="end"
                      fontSize={10}
                      fill={theme.colors.text.tertiary}
                    >
                      {Math.round(value)}
                    </SvgText>
                  )}
                </React.Fragment>
              );
            })}
          </>
        )}

        {/* 目标线 */}
        {targetLine && targetY && (
          <>
            <Line
              x1={paddingLeft}
              y1={targetY}
              x2={width - paddingRight}
              y2={targetY}
              stroke={theme.colors.error}
              strokeWidth={1}
              strokeDasharray="6,4"
            />
            {targetLabel && (
              <SvgText
                x={width - paddingRight}
                y={targetY - 6}
                textAnchor="end"
                fontSize={10}
                fill={theme.colors.error}
              >
                {targetLabel}
              </SvgText>
            )}
          </>
        )}

        {/* 柱子 */}
        {data.map((d, i) => {
          const barHeight = (d.value / valueRange) * chartHeight;
          const x = paddingLeft + gap + i * (calculatedBarWidth + gap);
          const y = paddingTop + chartHeight - barHeight;
          const barColor = d.color || color;

          return (
            <React.Fragment key={i}>
              <Rect
                x={x}
                y={y}
                width={calculatedBarWidth}
                height={barHeight}
                fill={barColor}
                rx={barRadius}
                ry={barRadius}
              />

              {/* 数值标签 */}
              {showValues && (
                <SvgText
                  x={x + calculatedBarWidth / 2}
                  y={y - 6}
                  textAnchor="middle"
                  fontSize={10}
                  fill={theme.colors.text.secondary}
                >
                  {d.value}{unit}
                </SvgText>
              )}

              {/* X 轴标签 */}
              {showLabels && (
                <SvgText
                  x={x + calculatedBarWidth / 2}
                  y={height - 8}
                  textAnchor="middle"
                  fontSize={10}
                  fill={theme.colors.text.tertiary}
                >
                  {d.label}
                </SvgText>
              )}
            </React.Fragment>
          );
        })}
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  noDataText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
  },
});

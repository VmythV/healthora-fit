// components/charts/LineChart.tsx
// 折线图组件
//
// P2-29：默认 width 用 useWindowDimensions 响应屏幕旋转/分屏

import React from 'react';
import { View, Text, StyleSheet, useWindowDimensions } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { theme } from '@/constants/theme';

interface DataPoint {
  date: string;
  value: number;
}

interface LineChartProps {
  data: DataPoint[];
  width?: number;
  height?: number;
  color?: string;
  showDots?: boolean;
  showGrid?: boolean;
  showLabels?: boolean;
  targetLine?: number;
  targetLabel?: string;
  unit?: string;
}

/**
 * 折线图组件
 *
 * @example
 * ```tsx
 * const data = [
 *   { date: '1月', value: 70 },
 *   { date: '2月', value: 69 },
 *   { date: '3月', value: 68 },
 *   { date: '4月', value: 67.5 },
 * ];
 *
 * <LineChart data={data} />
 *
 * // 带目标线
 * <LineChart
 *   data={data}
 *   targetLine={65}
 *   targetLabel="目标"
 *   unit="kg"
 * />
 * ```
 */
export function LineChart({
  data,
  width: widthProp,
  height = 200,
  color = theme.colors.primary.main,
  showDots = true,
  showGrid = true,
  showLabels = true,
  targetLine,
  targetLabel,
  unit = '',
}: LineChartProps) {
  const { width: screenWidth } = useWindowDimensions();
  const width = widthProp ?? screenWidth - 48;
  if (!data || data.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>暂无数据</Text>
      </View>
    );
  }

  // 过滤掉无效值，防止 NaN 进入 SVG path
  const validData = data.filter((d) => Number.isFinite(d.value));
  if (validData.length === 0) {
    return (
      <View style={[styles.container, { width, height }]}>
        <Text style={styles.noDataText}>暂无数据</Text>
      </View>
    );
  }

  // 计算数据范围
  const values = validData.map((d) => d.value);
  const minValue = Math.min(...values, targetLine || Infinity);
  const maxValue = Math.max(...values);
  const valueRange = maxValue - minValue || 1;

  // 图表边距
  const paddingLeft = 40;
  const paddingRight = 20;
  const paddingTop = 20;
  const paddingBottom = 30;

  // 计算绘图区域
  const chartWidth = width - paddingLeft - paddingRight;
  const chartHeight = height - paddingTop - paddingBottom;

  // 计算点的位置
  const points = validData.map((d, i) => ({
    x: paddingLeft + (validData.length > 1 ? i / (validData.length - 1) : 0.5) * chartWidth,
    y: paddingTop + ((maxValue - d.value) / valueRange) * chartHeight,
  }));

  // 生成路径
  const linePath = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');

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

        {/* 折线 */}
        <Path
          d={linePath}
          stroke={color}
          strokeWidth={2}
          fill="transparent"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* 数据点 */}
        {showDots &&
          points.map((p, i) => (
            <React.Fragment key={i}>
              <Circle cx={p.x} cy={p.y} r={4} fill={color} />
              <Circle cx={p.x} cy={p.y} r={2} fill="#FFFFFF" />
            </React.Fragment>
          ))}

        {/* X 轴标签 */}
        {showLabels &&
          validData.map((d, i) => {
            // 只显示部分标签，避免重叠
            if (validData.length > 7 && i % Math.ceil(validData.length / 7) !== 0) {
              return null;
            }
            return (
              <SvgText
                key={i}
                x={points[i].x}
                y={height - 8}
                textAnchor="middle"
                fontSize={10}
                fill={theme.colors.text.tertiary}
              >
                {d.date}
              </SvgText>
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

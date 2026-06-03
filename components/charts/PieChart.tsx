// components/charts/PieChart.tsx
// 饼图组件

import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Path, Circle, Text as SvgText } from 'react-native-svg';
import { theme } from '@/constants/theme';

interface DataSegment {
  label: string;
  value: number;
  color: string;
}

interface PieChartProps {
  data: DataSegment[];
  size?: number;
  innerRadius?: number;
  showLabels?: boolean;
  showLegend?: boolean;
  showPercentages?: boolean;
  unit?: string;
  colors?: string[];
}

// 默认颜色方案
const DEFAULT_COLORS = [
  '#10B981', // 翡翠绿（蛋白质）
  '#3B82F6', // 天蓝色（碳水）
  '#F59E0B', // 琥珀色（脂肪）
  '#8B5CF6', // 紫色
  '#EC4899', // 粉色
  '#14B8A6', // 青色
  '#F97316', // 橙色
  '#6366F1', // 靛蓝
];

/**
 * 饼图组件
 *
 * @example
 * ```tsx
 * const data = [
 *   { label: '蛋白质', value: 30, color: '#10B981' },
 *   { label: '碳水化合物', value: 50, color: '#3B82F6' },
 *   { label: '脂肪', value: 20, color: '#F59E0B' },
 * ];
 *
 * <PieChart data={data} />
 *
 * // 带图例
 * <PieChart
 *   data={data}
 *   showLegend
 *   showPercentages
 * />
 *
 * // 环形图
 * <PieChart
 *   data={data}
 *   innerRadius={40}
 * />
 * ```
 */
export function PieChart({
  data,
  size = 160,
  innerRadius = 0,
  showLabels = true,
  showLegend = true,
  showPercentages = true,
  unit = '',
  colors = DEFAULT_COLORS,
}: PieChartProps) {
  if (!data || data.length === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>暂无数据</Text>
      </View>
    );
  }

  // 计算总量
  const total = data.reduce((sum, d) => sum + d.value, 0);

  if (total === 0) {
    return (
      <View style={styles.container}>
        <Text style={styles.noDataText}>暂无数据</Text>
      </View>
    );
  }

  // 计算中心点和半径
  const center = size / 2;
  const outerRadius = size / 2 - 4; // 留出边距

  // 计算每个扇形的路径
  let currentAngle = -90; // 从顶部开始

  const segments = data.map((d, i) => {
    const percentage = (d.value / total) * 100;
    const angle = (d.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;

    // 计算扇形路径
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;

    const x1 = center + outerRadius * Math.cos(startRad);
    const y1 = center + outerRadius * Math.sin(startRad);
    const x2 = center + outerRadius * Math.cos(endRad);
    const y2 = center + outerRadius * Math.sin(endRad);

    const largeArcFlag = angle > 180 ? 1 : 0;

    let path: string;

    if (innerRadius > 0) {
      // 环形图
      const innerX1 = center + innerRadius * Math.cos(startRad);
      const innerY1 = center + innerRadius * Math.sin(startRad);
      const innerX2 = center + innerRadius * Math.cos(endRad);
      const innerY2 = center + innerRadius * Math.sin(endRad);

      path = [
        `M ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        `L ${innerX2} ${innerY2}`,
        `A ${innerRadius} ${innerRadius} 0 ${largeArcFlag} 0 ${innerX1} ${innerY1}`,
        'Z',
      ].join(' ');
    } else {
      // 实心饼图
      path = [
        `M ${center} ${center}`,
        `L ${x1} ${y1}`,
        `A ${outerRadius} ${outerRadius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
        'Z',
      ].join(' ');
    }

    // 计算标签位置（扇形中心）
    const labelAngle = ((startAngle + endAngle) / 2 * Math.PI) / 180;
    const labelRadius = innerRadius > 0
      ? (outerRadius + innerRadius) / 2
      : outerRadius * 0.65;
    const labelX = center + labelRadius * Math.cos(labelAngle);
    const labelY = center + labelRadius * Math.sin(labelAngle);

    currentAngle = endAngle;

    return {
      ...d,
      path,
      percentage,
      labelX,
      labelY,
      color: d.color || colors[i % colors.length],
    };
  });

  return (
    <View style={styles.container}>
      <View style={styles.chartContainer}>
        <Svg width={size} height={size}>
          {/* 扇形 */}
          {segments.map((segment, i) => (
            <Path
              key={i}
              d={segment.path}
              fill={segment.color}
              stroke={theme.colors.background.primary}
              strokeWidth={2}
            />
          ))}

          {/* 百分比标签 */}
          {showPercentages &&
            segments.map((segment, i) => {
              // 只显示大于 5% 的标签
              if (segment.percentage < 5) return null;
              return (
                <SvgText
                  key={i}
                  x={segment.labelX}
                  y={segment.labelY}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  fontSize={11}
                  fontWeight="600"
                  fill="#FFFFFF"
                >
                  {Math.round(segment.percentage)}%
                </SvgText>
              );
            })}
        </Svg>

        {/* 中心文字（环形图） */}
        {innerRadius > 0 && showLabels && (
          <View style={[styles.centerLabel, { width: innerRadius * 2, height: innerRadius * 2 }]}>
            <Text style={styles.centerValue}>{total}</Text>
            <Text style={styles.centerUnit}>{unit}</Text>
          </View>
        )}
      </View>

      {/* 图例 */}
      {showLegend && (
        <View style={styles.legendContainer}>
          {segments.map((segment, i) => (
            <View key={i} style={styles.legendItem}>
              <View style={[styles.legendDot, { backgroundColor: segment.color }]} />
              <Text style={styles.legendLabel}>{segment.label}</Text>
              <Text style={styles.legendValue}>
                {segment.value}{unit}
                {showPercentages && ` (${Math.round(segment.percentage)}%)`}
              </Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerLabel: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerValue: {
    fontSize: theme.fontSize.h4,
    fontWeight: theme.fontWeight.bold,
    color: theme.colors.text.primary,
  },
  centerUnit: {
    fontSize: theme.fontSize.caption,
    color: theme.colors.text.tertiary,
    marginTop: 2,
  },
  legendContainer: {
    marginTop: theme.spacing.lg,
    width: '100%',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  legendDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: theme.spacing.sm,
  },
  legendLabel: {
    flex: 1,
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.secondary,
  },
  legendValue: {
    fontSize: theme.fontSize.bodySm,
    color: theme.colors.text.primary,
    fontWeight: theme.fontWeight.medium,
  },
  noDataText: {
    fontSize: theme.fontSize.body,
    color: theme.colors.text.tertiary,
  },
});

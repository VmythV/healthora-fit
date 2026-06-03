// components/icons/Icon.tsx
// 统一图标组件

import React from 'react';
import { HomeIcon } from './HomeIcon';
import { CalendarIcon } from './CalendarIcon';
import { AddIcon } from './AddIcon';
import { ChartIcon } from './ChartIcon';
import { SettingsIcon } from './SettingsIcon';
import { FoodIcon } from './FoodIcon';
import { ExerciseIcon } from './ExerciseIcon';
import { WeightIcon } from './WeightIcon';
import { CameraIcon } from './CameraIcon';
import { EditIcon } from './EditIcon';
import { DeleteIcon } from './DeleteIcon';
import { BackIcon } from './BackIcon';

export type IconName =
  | 'home'
  | 'calendar'
  | 'add'
  | 'chart'
  | 'settings'
  | 'food'
  | 'exercise'
  | 'weight'
  | 'camera'
  | 'edit'
  | 'delete'
  | 'back';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

/**
 * 统一图标组件
 *
 * @example
 * ```tsx
 * <Icon name="home" size={24} color="#10B981" />
 * <Icon name="calendar" size={20} color="#6B7280" />
 * <Icon name="add" size={32} color="#FFFFFF" />
 * ```
 */
export function Icon({ name, size = 24, color = '#000000' }: IconProps) {
  const iconProps = { size, color };

  switch (name) {
    case 'home':
      return <HomeIcon {...iconProps} />;
    case 'calendar':
      return <CalendarIcon {...iconProps} />;
    case 'add':
      return <AddIcon {...iconProps} />;
    case 'chart':
      return <ChartIcon {...iconProps} />;
    case 'settings':
      return <SettingsIcon {...iconProps} />;
    case 'food':
      return <FoodIcon {...iconProps} />;
    case 'exercise':
      return <ExerciseIcon {...iconProps} />;
    case 'weight':
      return <WeightIcon {...iconProps} />;
    case 'camera':
      return <CameraIcon {...iconProps} />;
    case 'edit':
      return <EditIcon {...iconProps} />;
    case 'delete':
      return <DeleteIcon {...iconProps} />;
    case 'back':
      return <BackIcon {...iconProps} />;
    default:
      return null;
  }
}

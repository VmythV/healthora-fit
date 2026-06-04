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
import { SunriseIcon } from './SunriseIcon';
import { MoonIcon } from './MoonIcon';
import { CookieIcon } from './CookieIcon';
import { BowlIcon } from './BowlIcon';
import { PlateIcon } from './PlateIcon';
import { RunningIcon } from './RunningIcon';
import { WalkingIcon } from './WalkingIcon';
import { CyclingIcon } from './CyclingIcon';
import { SwimmingIcon } from './SwimmingIcon';
import { StrengthIcon } from './StrengthIcon';
import { YogaIcon } from './YogaIcon';
import { HiitIcon } from './HiitIcon';
import { OtherExerciseIcon } from './OtherExerciseIcon';
import { NoteIcon } from './NoteIcon';
import { SearchIcon } from './SearchIcon';
import { TipsIcon } from './TipsIcon';
import { HelpIcon } from './HelpIcon';
import { AiIcon } from './AiIcon';
import { ChartBarIcon } from './ChartBarIcon';
import { FireIcon } from './FireIcon';
import { ConnectedIcon } from './ConnectedIcon';
import { DisconnectedIcon } from './DisconnectedIcon';
import { TrendUpIcon } from './TrendUpIcon';
import { TrendDownIcon } from './TrendDownIcon';
import { TrendFlatIcon } from './TrendFlatIcon';
import { EyeIcon } from './EyeIcon';
import { EyeOffIcon } from './EyeOffIcon';
import { ArrowRightIcon } from './ArrowRightIcon';
import { StarIcon } from './StarIcon';
import { StarOutlineIcon } from './StarOutlineIcon';
import { CheckIcon } from './CheckIcon';
import { CloseIcon } from './CloseIcon';
import { WarningIcon } from './WarningIcon';
import { InfoIcon } from './InfoIcon';

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
  | 'back'
  | 'sunrise'
  | 'moon'
  | 'cookie'
  | 'bowl'
  | 'plate'
  | 'running'
  | 'walking'
  | 'cycling'
  | 'swimming'
  | 'strength'
  | 'yoga'
  | 'hiit'
  | 'other-exercise'
  | 'note'
  | 'search'
  | 'tips'
  | 'help'
  | 'ai'
  | 'chart-bar'
  | 'fire'
  | 'connected'
  | 'disconnected'
  | 'trend-up'
  | 'trend-down'
  | 'trend-flat'
  | 'eye'
  | 'eye-off'
  | 'arrow-right'
  | 'star'
  | 'star-outline'
  | 'check'
  | 'close'
  | 'warning'
  | 'info';

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
    case 'sunrise':
      return <SunriseIcon {...iconProps} />;
    case 'moon':
      return <MoonIcon {...iconProps} />;
    case 'cookie':
      return <CookieIcon {...iconProps} />;
    case 'bowl':
      return <BowlIcon {...iconProps} />;
    case 'plate':
      return <PlateIcon {...iconProps} />;
    case 'running':
      return <RunningIcon {...iconProps} />;
    case 'walking':
      return <WalkingIcon {...iconProps} />;
    case 'cycling':
      return <CyclingIcon {...iconProps} />;
    case 'swimming':
      return <SwimmingIcon {...iconProps} />;
    case 'strength':
      return <StrengthIcon {...iconProps} />;
    case 'yoga':
      return <YogaIcon {...iconProps} />;
    case 'hiit':
      return <HiitIcon {...iconProps} />;
    case 'other-exercise':
      return <OtherExerciseIcon {...iconProps} />;
    case 'note':
      return <NoteIcon {...iconProps} />;
    case 'search':
      return <SearchIcon {...iconProps} />;
    case 'tips':
      return <TipsIcon {...iconProps} />;
    case 'help':
      return <HelpIcon {...iconProps} />;
    case 'ai':
      return <AiIcon {...iconProps} />;
    case 'chart-bar':
      return <ChartBarIcon {...iconProps} />;
    case 'fire':
      return <FireIcon {...iconProps} />;
    case 'connected':
      return <ConnectedIcon {...iconProps} />;
    case 'disconnected':
      return <DisconnectedIcon {...iconProps} />;
    case 'trend-up':
      return <TrendUpIcon {...iconProps} />;
    case 'trend-down':
      return <TrendDownIcon {...iconProps} />;
    case 'trend-flat':
      return <TrendFlatIcon {...iconProps} />;
    case 'eye':
      return <EyeIcon {...iconProps} />;
    case 'eye-off':
      return <EyeOffIcon {...iconProps} />;
    case 'arrow-right':
      return <ArrowRightIcon {...iconProps} />;
    case 'star':
      return <StarIcon {...iconProps} />;
    case 'star-outline':
      return <StarOutlineIcon {...iconProps} />;
    case 'check':
      return <CheckIcon {...iconProps} />;
    case 'close':
      return <CloseIcon {...iconProps} />;
    case 'warning':
      return <WarningIcon {...iconProps} />;
    case 'info':
      return <InfoIcon {...iconProps} />;
    default:
      return null;
  }
}

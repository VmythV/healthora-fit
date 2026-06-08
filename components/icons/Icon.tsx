// components/icons/Icon.tsx
// 统一图标组件
//
// P1-7 重构：
// - 49 个 case switch 改为查表（ICONS map），O(1) 查询
// - 用 React.memo 包裹，props 相等时跳过重渲染
// - 公开 API 完全不变：IconName 类型、Icon 组件 props、default size/color

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
import { ChevronRightIcon } from './ChevronRightIcon';
import { ChevronDownIcon } from './ChevronDownIcon';
import { ChevronUpIcon } from './ChevronUpIcon';

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
  | 'info'
  | 'chevron-right'
  | 'chevron-down'
  | 'chevron-up';

interface IconProps {
  name: IconName;
  size?: number;
  color?: string;
}

type IconComponent = React.FC<{ size?: number; color?: string }>;

/**
 * Icon 查表 —— O(1) 替代 49 个 case switch
 *
 * 类型与运行时都安全：name 是 IconName 字面量联合，查表返回 IconComponent。
 */
const ICONS: Record<IconName, IconComponent> = {
  home: HomeIcon,
  calendar: CalendarIcon,
  add: AddIcon,
  chart: ChartIcon,
  settings: SettingsIcon,
  food: FoodIcon,
  exercise: ExerciseIcon,
  weight: WeightIcon,
  camera: CameraIcon,
  edit: EditIcon,
  delete: DeleteIcon,
  back: BackIcon,
  sunrise: SunriseIcon,
  moon: MoonIcon,
  cookie: CookieIcon,
  bowl: BowlIcon,
  plate: PlateIcon,
  running: RunningIcon,
  walking: WalkingIcon,
  cycling: CyclingIcon,
  swimming: SwimmingIcon,
  strength: StrengthIcon,
  yoga: YogaIcon,
  hiit: HiitIcon,
  'other-exercise': OtherExerciseIcon,
  note: NoteIcon,
  search: SearchIcon,
  tips: TipsIcon,
  help: HelpIcon,
  ai: AiIcon,
  'chart-bar': ChartBarIcon,
  fire: FireIcon,
  connected: ConnectedIcon,
  disconnected: DisconnectedIcon,
  'trend-up': TrendUpIcon,
  'trend-down': TrendDownIcon,
  'trend-flat': TrendFlatIcon,
  eye: EyeIcon,
  'eye-off': EyeOffIcon,
  'arrow-right': ArrowRightIcon,
  star: StarIcon,
  'star-outline': StarOutlineIcon,
  check: CheckIcon,
  close: CloseIcon,
  warning: WarningIcon,
  info: InfoIcon,
  'chevron-right': ChevronRightIcon,
  'chevron-down': ChevronDownIcon,
  'chevron-up': ChevronUpIcon,
};

function IconImpl({ name, size = 24, color = '#000000' }: IconProps) {
  const Cmp = ICONS[name];
  if (!Cmp) return null;
  return <Cmp size={size} color={color} />;
}

/**
 * 统一图标组件（React.memo 包裹，props 浅相等时跳过重渲染）
 */
export const Icon = React.memo(IconImpl);

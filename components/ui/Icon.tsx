/**
 * Icon Component
 * Wrapper for @expo/vector-icons with consistent styling
 * Uses Feather icons which are similar to Lucide icons
 */

import React from 'react';
import { View } from 'react-native';
import { Feather, MaterialCommunityIcons, Ionicons } from '@expo/vector-icons';

// Feather icon names type
type FeatherIconName = React.ComponentProps<typeof Feather>['name'];
type MaterialIconName = React.ComponentProps<typeof MaterialCommunityIcons>['name'];
type IoniconName = React.ComponentProps<typeof Ionicons>['name'];

interface IconProps {
  name: FeatherIconName;
  size?: number;
  color?: string;
  className?: string;
}

interface IconWithBackgroundProps extends IconProps {
  backgroundColor?: string;
  backgroundSize?: number;
  backgroundClassName?: string;
}

// Default icon component using Feather icons
export function Icon({
  name,
  size = 24,
  color = '#f1f5f9',
  className = '',
}: IconProps) {
  return (
    <View className={className}>
      <Feather name={name} size={size} color={color} />
    </View>
  );
}

// Icon with circular background
export function IconButton({
  name,
  size = 24,
  color = '#f1f5f9',
  backgroundColor = 'rgba(59, 130, 246, 0.2)',
  backgroundSize = 48,
  backgroundClassName = '',
  className = '',
}: IconWithBackgroundProps) {
  return (
    <View
      className={`items-center justify-center rounded-full ${backgroundClassName}`}
      style={{
        width: backgroundSize,
        height: backgroundSize,
        backgroundColor,
      }}
    >
      <Icon name={name} size={size} color={color} className={className} />
    </View>
  );
}

// Material Community Icons wrapper (for additional icons)
export function MaterialIcon({
  name,
  size = 24,
  color = '#f1f5f9',
}: {
  name: MaterialIconName;
  size?: number;
  color?: string;
}) {
  return <MaterialCommunityIcons name={name} size={size} color={color} />;
}

// Ionicons wrapper (for additional icons)
export function IonIcon({
  name,
  size = 24,
  color = '#f1f5f9',
}: {
  name: IoniconName;
  size?: number;
  color?: string;
}) {
  return <Ionicons name={name} size={size} color={color} />;
}

// Tab bar icon mapping
export const TAB_ICONS: Record<string, FeatherIconName> = {
  home: 'home',
  steps: 'book-open',
  journal: 'edit-3',
  insights: 'bar-chart-2',
  emergency: 'alert-circle',
  more: 'more-horizontal',
};

// Common icon mapping for consistency
export const ICONS = {
  // Navigation
  home: 'home',
  back: 'arrow-left',
  forward: 'arrow-right',
  close: 'x',
  menu: 'menu',
  more: 'more-horizontal',
  
  // Actions
  add: 'plus',
  edit: 'edit-2',
  delete: 'trash-2',
  search: 'search',
  filter: 'filter',
  sort: 'sliders',
  share: 'share-2',
  
  // Recovery specific
  journal: 'edit-3',
  steps: 'book-open',
  progress: 'trending-up',
  milestone: 'award',
  emergency: 'alert-circle',
  phone: 'phone',
  heart: 'heart',
  star: 'star',
  
  // Status
  check: 'check',
  checkCircle: 'check-circle',
  alert: 'alert-triangle',
  info: 'info',
  lock: 'lock',
  unlock: 'unlock',
  
  // Time
  clock: 'clock',
  calendar: 'calendar',
  
  // People
  user: 'user',
  users: 'users',
  
  // Settings
  settings: 'settings',
  
  // Misc
  flame: 'zap',
  chart: 'bar-chart-2',
  activity: 'activity',
  target: 'target',
  layers: 'layers',
  grid: 'grid',
  list: 'list',
  file: 'file-text',
  folder: 'folder',
  download: 'download',
  upload: 'upload',
  refresh: 'refresh-cw',
  sun: 'sun',
  moon: 'moon',
  chevronDown: 'chevron-down',
  chevronUp: 'chevron-up',
  chevronRight: 'chevron-right',
  chevronLeft: 'chevron-left',
} as const;

export default Icon;


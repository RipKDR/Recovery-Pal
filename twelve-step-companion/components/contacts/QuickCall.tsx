/**
 * QuickCall Component
 * One-tap button for calling or texting a contact
 */

import React from 'react';
import { TouchableOpacity, Text, ViewStyle } from 'react-native';

interface QuickCallProps {
  icon: string;
  onPress: () => void;
  accessibilityLabel: string;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
}

export function QuickCall({
  icon,
  onPress,
  accessibilityLabel,
  variant = 'primary',
  size = 'md',
  disabled = false,
}: QuickCallProps) {
  const sizeStyles = {
    sm: 'w-8 h-8',
    md: 'w-10 h-10',
    lg: 'w-12 h-12',
  };

  const iconSizes = {
    sm: 'text-sm',
    md: 'text-lg',
    lg: 'text-xl',
  };

  const variantStyles = {
    primary: 'bg-primary-600 dark:bg-primary-700',
    secondary: 'bg-surface-200 dark:bg-surface-700',
    danger: 'bg-red-600 dark:bg-red-700',
  };

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      className={`
        ${sizeStyles[size]}
        ${variantStyles[variant]}
        rounded-full items-center justify-center
        ${disabled ? 'opacity-50' : ''}
      `}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
    >
      <Text className={iconSizes[size]}>{icon}</Text>
    </TouchableOpacity>
  );
}


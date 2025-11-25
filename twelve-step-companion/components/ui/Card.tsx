/**
 * Card Component
 * Container with elevation and padding, with accessibility support
 */

import React from 'react';
import { View, Pressable, AccessibilityRole } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined';
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityElementsHidden?: boolean;
}

export function Card({
  children,
  onPress,
  variant = 'default',
  className = '',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityElementsHidden,
}: CardProps) {
  const baseStyles = 'rounded-2xl p-4';
  
  const variantStyles = {
    default: 'bg-white dark:bg-surface-800',
    elevated: 'bg-white dark:bg-surface-800 shadow-lg shadow-black/10',
    outlined: 'bg-transparent border border-surface-200 dark:border-surface-700',
  };

  const content = (
    <View 
      className={`${baseStyles} ${variantStyles[variant]} ${className}`}
      accessible={!onPress}
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={accessibilityElementsHidden}
    >
      {children}
    </View>
  );

  if (onPress) {
    return (
      <Pressable
        onPress={onPress}
        className="active:opacity-90"
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {content}
      </Pressable>
    );
  }

  return content;
}

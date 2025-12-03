/**
 * Card Component
 * Dark navy themed card with subtle borders
 * Matches reference site design
 */

import React from 'react';
import { View, Pressable, AccessibilityRole } from 'react-native';

interface CardProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
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
  
  // Dark navy theme variants
  const variantStyles = {
    // Default semi-transparent dark card
    default: 'bg-navy-800/40 border border-surface-700/30',
    // Slightly more opaque for elevated content
    elevated: 'bg-navy-800/60 border border-surface-700/40',
    // Subtle border only
    outlined: 'bg-transparent border border-surface-700/50',
    // Glass effect with more transparency
    glass: 'bg-navy-900/30 border border-surface-600/20',
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
        className="active:opacity-80"
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

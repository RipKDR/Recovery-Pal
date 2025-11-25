/**
 * Button Component
 * Reusable button with variants and accessibility support
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, AccessibilityRole } from 'react-native';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
}

export function Button({
  title,
  onPress,
  variant = 'primary',
  size = 'md',
  disabled = false,
  loading = false,
  icon,
  className = '',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
}: ButtonProps) {
  const baseStyles = 'flex-row items-center justify-center rounded-xl';
  
  const variantStyles = {
    primary: 'bg-primary-600 active:bg-primary-700',
    secondary: 'bg-secondary-600 active:bg-secondary-700',
    outline: 'border-2 border-primary-600 bg-transparent',
    ghost: 'bg-transparent',
    danger: 'bg-red-600 active:bg-red-700',
  };

  const textVariantStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary-600',
    ghost: 'text-primary-600',
    danger: 'text-white',
  };

  const sizeStyles = {
    sm: 'py-2 px-4',
    md: 'py-3 px-6',
    lg: 'py-4 px-8',
  };

  const textSizeStyles = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-lg',
  };

  const disabledStyles = disabled ? 'opacity-50' : '';

  // Generate accessibility label if not provided
  const computedAccessibilityLabel = accessibilityLabel || title;
  const computedAccessibilityHint = accessibilityHint || (loading ? 'Loading, please wait' : undefined);

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      activeOpacity={0.8}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={computedAccessibilityLabel}
      accessibilityHint={computedAccessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'primary' || variant === 'secondary' || variant === 'danger' ? '#fff' : '#2563eb'}
          size="small"
          accessibilityLabel="Loading"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon}
          <Text
            className={`font-semibold ${textVariantStyles[variant]} ${textSizeStyles[size]}`}
            accessibilityElementsHidden
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
}

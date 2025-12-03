/**
 * Button Component
 * Dark navy themed buttons with blue accent
 * Matches reference site design
 */

import React from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, AccessibilityRole } from 'react-native';
import { Feather } from '@expo/vector-icons';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  icon?: FeatherIconName;
  iconPosition?: 'left' | 'right';
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
  iconPosition = 'left',
  className = '',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole = 'button',
}: ButtonProps) {
  const baseStyles = 'flex-row items-center justify-center rounded-xl';
  
  // Dark navy theme button variants
  const variantStyles = {
    primary: 'bg-primary-500 active:bg-primary-600',
    secondary: 'bg-secondary-500 active:bg-secondary-600',
    outline: 'border-2 border-primary-500 bg-transparent active:bg-primary-500/10',
    ghost: 'bg-transparent active:bg-surface-700/30',
    danger: 'bg-danger-500 active:bg-danger-600',
    success: 'bg-success-500 active:bg-success-600',
  };

  const textVariantStyles = {
    primary: 'text-white',
    secondary: 'text-white',
    outline: 'text-primary-400',
    ghost: 'text-primary-400',
    danger: 'text-white',
    success: 'text-white',
  };

  const iconColors = {
    primary: '#ffffff',
    secondary: '#ffffff',
    outline: '#60a5fa',
    ghost: '#60a5fa',
    danger: '#ffffff',
    success: '#ffffff',
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

  const iconSizes = {
    sm: 16,
    md: 18,
    lg: 20,
  };

  const disabledStyles = disabled ? 'opacity-50' : '';

  const computedAccessibilityLabel = accessibilityLabel || title;
  const computedAccessibilityHint = accessibilityHint || (loading ? 'Loading, please wait' : undefined);

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <Feather 
        name={icon} 
        size={iconSizes[size]} 
        color={iconColors[variant]} 
      />
    );
  };

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
          color={iconColors[variant]}
          size="small"
          accessibilityLabel="Loading"
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {icon && iconPosition === 'left' && renderIcon()}
          <Text
            className={`font-semibold ${textVariantStyles[variant]} ${textSizeStyles[size]}`}
            accessibilityElementsHidden
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && renderIcon()}
        </View>
      )}
    </TouchableOpacity>
  );
}

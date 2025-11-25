/**
 * Input Component
 * Reusable text input with accessibility support
 */

import React from 'react';
import { TextInput, View, Text, TextInputProps } from 'react-native';

interface InputProps extends Omit<TextInputProps, 'accessibilityLabel'> {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  containerClassName?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Input({
  label,
  error,
  hint,
  className = '',
  containerClassName = '',
  accessibilityLabel,
  accessibilityHint,
  ...props
}: InputProps) {
  const baseInputStyles = 'bg-surface-100 dark:bg-surface-700 rounded-xl px-4 py-3 text-base text-surface-900 dark:text-surface-100';
  const errorStyles = error ? 'border-2 border-red-500' : '';

  // Generate accessibility label from label prop if not provided
  const computedAccessibilityLabel = accessibilityLabel || label || props.placeholder;

  return (
    <View className={`${containerClassName}`}>
      {label && (
        <Text 
          className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-1"
          accessibilityRole="text"
        >
          {label}
        </Text>
      )}
      <TextInput
        className={`${baseInputStyles} ${errorStyles} ${className}`}
        placeholderTextColor="#9ca3af"
        accessibilityLabel={computedAccessibilityLabel}
        accessibilityHint={accessibilityHint || hint}
        accessibilityState={{
          disabled: props.editable === false,
        }}
        {...props}
      />
      {error && (
        <Text 
          className="text-sm text-red-500 mt-1"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </Text>
      )}
      {hint && !error && (
        <Text 
          className="text-sm text-surface-500 mt-1"
          accessibilityRole="text"
        >
          {hint}
        </Text>
      )}
    </View>
  );
}

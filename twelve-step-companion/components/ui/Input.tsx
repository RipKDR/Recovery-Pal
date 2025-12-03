/**
 * Input Component
 * Dark navy themed text input with accessibility support
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
  // Dark navy theme styles
  const baseInputStyles = 'bg-navy-800/40 rounded-xl px-4 py-3 text-base text-white border border-surface-700/30';
  const errorStyles = error ? 'border-2 border-danger-500' : '';

  // Generate accessibility label from label prop if not provided
  const computedAccessibilityLabel = accessibilityLabel || label || props.placeholder;

  return (
    <View className={`${containerClassName}`}>
      {label && (
        <Text 
          className="text-sm font-medium text-surface-300 mb-2"
          accessibilityRole="text"
        >
          {label}
        </Text>
      )}
      <TextInput
        className={`${baseInputStyles} ${errorStyles} ${className}`}
        placeholderTextColor="#64748b"
        accessibilityLabel={computedAccessibilityLabel}
        accessibilityHint={accessibilityHint || hint}
        accessibilityState={{
          disabled: props.editable === false,
        }}
        {...props}
      />
      {error && (
        <Text 
          className="text-sm text-danger-400 mt-1"
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

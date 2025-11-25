/**
 * Slider Component
 * Custom slider for mood/craving inputs with accessibility support
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface SliderProps {
  value: number;
  onValueChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  label?: string;
  showValue?: boolean;
  minLabel?: string;
  maxLabel?: string;
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

export function Slider({
  value,
  onValueChange,
  min = 0,
  max = 10,
  step = 1,
  label,
  showValue = true,
  minLabel,
  maxLabel,
  className = '',
  accessibilityLabel,
  accessibilityHint,
}: SliderProps) {
  const steps = [];
  for (let i = min; i <= max; i += step) {
    steps.push(i);
  }

  const percentage = ((value - min) / (max - min)) * 100;

  // Compute accessibility label
  const computedAccessibilityLabel = accessibilityLabel || label || 'Slider';
  const accessibilityValue = `${value} out of ${max}`;

  return (
    <View 
      className={`${className}`}
      accessible
      accessibilityRole="adjustable"
      accessibilityLabel={`${computedAccessibilityLabel}, ${accessibilityValue}`}
      accessibilityHint={accessibilityHint || 'Swipe up or down to adjust value'}
      accessibilityValue={{
        min,
        max,
        now: value,
        text: accessibilityValue,
      }}
      accessibilityActions={[
        { name: 'increment', label: 'Increase value' },
        { name: 'decrement', label: 'Decrease value' },
      ]}
      onAccessibilityAction={(event) => {
        switch (event.nativeEvent.actionName) {
          case 'increment':
            if (value < max) {
              onValueChange(Math.min(value + step, max));
            }
            break;
          case 'decrement':
            if (value > min) {
              onValueChange(Math.max(value - step, min));
            }
            break;
        }
      }}
    >
      {/* Label and Value */}
      {(label || showValue) && (
        <View className="flex-row justify-between items-center mb-2">
          {label && (
            <Text className="text-base font-medium text-surface-700 dark:text-surface-300">
              {label}
            </Text>
          )}
          {showValue && (
            <Text 
              className="text-lg font-bold text-primary-600"
              accessibilityElementsHidden
            >
              {value}
            </Text>
          )}
        </View>
      )}

      {/* Slider Track */}
      <View className="relative h-8 mb-2">
        {/* Background Track */}
        <View className="absolute top-3 left-0 right-0 h-2 bg-surface-200 dark:bg-surface-600 rounded-full" />
        
        {/* Filled Track */}
        <View 
          className="absolute top-3 left-0 h-2 bg-primary-500 rounded-full"
          style={{ width: `${percentage}%` }}
        />

        {/* Step Buttons */}
        <View className="flex-row justify-between absolute top-0 left-0 right-0">
          {steps.map((stepValue) => (
            <TouchableOpacity
              key={stepValue}
              onPress={() => onValueChange(stepValue)}
              className={`w-8 h-8 rounded-full items-center justify-center ${
                stepValue === value
                  ? 'bg-primary-600'
                  : stepValue <= value
                  ? 'bg-primary-300'
                  : 'bg-surface-200 dark:bg-surface-600'
              }`}
              accessibilityRole="button"
              accessibilityLabel={`Select ${stepValue}`}
              accessibilityState={{ selected: stepValue === value }}
              importantForAccessibility="no"
            >
              <Text
                className={`text-xs font-semibold ${
                  stepValue === value || stepValue <= value
                    ? 'text-white'
                    : 'text-surface-500'
                }`}
              >
                {stepValue}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Min/Max Labels */}
      {(minLabel || maxLabel) && (
        <View className="flex-row justify-between">
          <Text className="text-xs text-surface-400">{minLabel || ''}</Text>
          <Text className="text-xs text-surface-400">{maxLabel || ''}</Text>
        </View>
      )}
    </View>
  );
}

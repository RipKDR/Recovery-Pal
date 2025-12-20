/**
 * Input Component
 * Dark navy themed text input with accessibility support
 * BMAD Upgrade: Uses BlurView, focus animations, error shake, label float, clear button
 */

import React, { useState } from 'react';
import { TextInput, View, Text, TextInputProps, TouchableOpacity, NativeSyntheticEvent, TextInputFocusEventData } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  withSequence,
  interpolate,
  FadeIn,
  FadeOut,
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

interface InputProps extends Omit<TextInputProps, 'accessibilityLabel'> {
  label?: string;
  error?: string;
  hint?: string;
  className?: string;
  containerClassName?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
}

const AnimatedView = Animated.createAnimatedComponent(View);
const AnimatedText = Animated.createAnimatedComponent(Text);
const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);

export function Input({
  label,
  error,
  hint,
  className = '',
  containerClassName = '',
  accessibilityLabel,
  accessibilityHint,
  value,
  onChangeText,
  ...props
}: InputProps) {
  const [isFocused, setIsFocused] = useState(false);
  const [showClear, setShowClear] = useState(false);

  // Animation values
  const labelTranslateY = useSharedValue(value ? -20 : 0);
  const labelScale = useSharedValue(value ? 0.85 : 1);
  const borderGlow = useSharedValue(0);
  const shakeOffset = useSharedValue(0);
  const clearOpacity = useSharedValue(0);

  // Update label position when value changes
  React.useEffect(() => {
    if (value && value.length > 0) {
      labelTranslateY.value = withSpring(-20, { damping: 15, stiffness: 300 });
      labelScale.value = withSpring(0.85, { damping: 15, stiffness: 300 });
      setShowClear(true);
      clearOpacity.value = withTiming(1, { duration: 200 });
    } else if (!isFocused) {
      labelTranslateY.value = withSpring(0, { damping: 15, stiffness: 300 });
      labelScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      setShowClear(false);
      clearOpacity.value = withTiming(0, { duration: 200 });
    }
  }, [value, isFocused]);

  // Error shake animation
  React.useEffect(() => {
    if (error) {
      shakeOffset.value = withSequence(
        withTiming(-10, { duration: 50 }),
        withTiming(10, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  }, [error]);

  // Dark navy theme styles
  const baseInputStyles = 'flex-1 px-4 py-3 text-base text-white';

  // Generate accessibility label from label prop if not provided
  const computedAccessibilityLabel = accessibilityLabel || label || props.placeholder;

  const labelAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: labelTranslateY.value },
        { scale: labelScale.value },
      ],
    };
  });

  const borderAnimatedStyle = useAnimatedStyle(() => {
    const glowOpacity = interpolate(
      borderGlow.value,
      [0, 1],
      [0, 0.5],
      'clamp'
    );

    return {
      borderWidth: error ? 2 : isFocused ? 1.5 : 1,
      borderColor: error
        ? '#ef4444' // danger-500
        : isFocused
          ? `rgba(96, 165, 250, ${0.4 + glowOpacity})` // primary-400 with glow
          : 'rgba(255, 255, 255, 0.1)',
    };
  });

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shakeOffset.value }],
    };
  });

  const clearButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: clearOpacity.value,
    };
  });

  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    labelTranslateY.value = withSpring(-20, { damping: 15, stiffness: 300 });
    labelScale.value = withSpring(0.85, { damping: 15, stiffness: 300 });
    borderGlow.value = withSpring(1, { damping: 15 });
    if (value && value.length > 0) {
      setShowClear(true);
      clearOpacity.value = withTiming(1, { duration: 200 });
    }
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    props.onFocus?.(e);
  };

  function handleBlur(e: NativeSyntheticEvent<TextInputFocusEventData>): void {
    setIsFocused(false);
    borderGlow.value = withSpring(0, { damping: 15 });
    if (!value || value.length === 0) {
      labelTranslateY.value = withSpring(0, { damping: 15, stiffness: 300 });
      labelScale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
    setShowClear(false);
    clearOpacity.value = withTiming(0, { duration: 200 });
    props.onBlur?.(e);
  }

  const handleClear = () => {
    onChangeText?.('');
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  return (
    <AnimatedView className={`${containerClassName}`} style={containerAnimatedStyle}>
      <AnimatedView className="relative">
        {/* Floating label */}
        {label && (
          <AnimatedText
            style={[
              labelAnimatedStyle,
              {
                position: 'absolute',
                left: 16,
                top: 12,
                zIndex: 1,
                pointerEvents: 'none',
              },
            ]}
            className={`text-sm font-medium ${isFocused || value
              ? error
                ? 'text-danger-400'
                : 'text-primary-400'
              : 'text-surface-400'
              }`}
            accessibilityElementsHidden
          >
            {label}
          </AnimatedText>
        )}

        <AnimatedView style={borderAnimatedStyle}>
          <BlurView intensity={10} tint="dark" className="rounded-xl overflow-hidden">
            <View className="flex-row items-center">
              <AnimatedTextInput
                className={`${baseInputStyles} ${className} ${label ? 'pt-6' : ''}`}
                placeholderTextColor="#64748b"
                accessibilityLabel={computedAccessibilityLabel}
                accessibilityHint={accessibilityHint || hint}
                accessibilityState={{
                  disabled: props.editable === false,
                }}
                value={value}
                onChangeText={onChangeText}
                onFocus={handleFocus as any}
                onBlur={handleBlur as any}
                {...props}
              />
              {showClear && (
                <Animated.View style={clearButtonStyle} className="pr-3">
                  <TouchableOpacity
                    onPress={handleClear}
                    className="w-6 h-6 items-center justify-center rounded-full bg-surface-700/50"
                    accessibilityRole="button"
                    accessibilityLabel="Clear input"
                  >
                    <Feather name="x" size={14} color="#94a3b8" />
                  </TouchableOpacity>
                </Animated.View>
              )}
            </View>
          </BlurView>
        </AnimatedView>
      </AnimatedView>

      {error && (
        <AnimatedText
          entering={FadeIn}
          exiting={FadeOut}
          className="text-sm text-danger-400 mt-1"
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
        >
          {error}
        </AnimatedText>
      )}
      {hint && !error && (
        <Text
          className="text-sm text-surface-500 mt-1"
          accessibilityRole="text"
        >
          {hint}
        </Text>
      )}
    </AnimatedView>
  );
}

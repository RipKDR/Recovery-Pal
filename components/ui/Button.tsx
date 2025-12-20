/**
 * Button Component
 * Dark navy themed buttons with blue accent
 * Matches reference site design
 * BMAD Upgrade: Added Haptics, Reanimated scaling, gradients, ripple, icon animations
 */

import React, { memo } from 'react';
import { TouchableOpacity, Text, ActivityIndicator, View, AccessibilityRole } from 'react-native';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring, 
  withTiming,
  withSequence,
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

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

const AnimatedTouchableOpacity = Animated.createAnimatedComponent(TouchableOpacity);

export const Button = memo(function Button({
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
  const scale = useSharedValue(1);
  const iconScale = useSharedValue(1);
  const iconRotation = useSharedValue(0);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const loadingOpacity = useSharedValue(loading ? 1 : 0);
  const contentOpacity = useSharedValue(loading ? 0 : 1);

  // Update loading opacity when loading state changes
  React.useEffect(() => {
    if (loading) {
      loadingOpacity.value = withTiming(1, { duration: 200 });
      contentOpacity.value = withTiming(0, { duration: 200 });
    } else {
      loadingOpacity.value = withTiming(0, { duration: 200 });
      contentOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [loading]);

  const baseStyles = 'flex-row items-center justify-center rounded-xl overflow-hidden';

  // Gradient colors for primary and secondary variants
  const gradientColors = {
    primary: ['#3b82f6', '#2563eb', '#1d4ed8'], // blue-500 to blue-700
    secondary: ['#14b8a6', '#0d9488', '#0f766e'], // teal-500 to teal-700
  };

  // Dark navy theme button variants (for non-gradient variants)
  const variantStyles = {
    primary: '', // Will use gradient instead
    secondary: '', // Will use gradient instead
    outline: 'border-2 border-primary-500 bg-transparent',
    ghost: 'bg-transparent',
    danger: 'bg-danger-500',
    success: 'bg-success-500',
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

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: iconScale.value },
        { rotate: `${iconRotation.value}deg` },
      ],
    };
  });

  const rippleStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: rippleScale.value }],
      opacity: rippleOpacity.value,
    };
  });

  const loadingStyle = useAnimatedStyle(() => {
    return {
      opacity: loadingOpacity.value,
    };
  });

  const contentStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value,
    };
  });

  const handlePressIn = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(0.95, { damping: 15, stiffness: 300 });
      iconScale.value = withSpring(0.9, { damping: 15, stiffness: 300 });
      iconRotation.value = withSpring(iconPosition === 'right' ? -10 : 10, { damping: 15 });
      
      // Ripple effect
      rippleScale.value = 0;
      rippleOpacity.value = 0.3;
      rippleScale.value = withSpring(4, { damping: 10 });
      rippleOpacity.value = withTiming(0, { duration: 400 });
    }
  };

  const handlePressOut = () => {
    if (!disabled && !loading) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      iconScale.value = withSpring(1, { damping: 15, stiffness: 300 });
      iconRotation.value = withSpring(0, { damping: 15 });
    }
  };

  const handlePress = () => {
    if (!disabled && !loading) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };

  const computedAccessibilityLabel = accessibilityLabel || title;
  const computedAccessibilityHint = accessibilityHint || (loading ? 'Loading, please wait' : undefined);

  const renderIcon = () => {
    if (!icon) return null;
    return (
      <Animated.View style={iconAnimatedStyle}>
        <Feather
          name={icon}
          size={iconSizes[size]}
          color={iconColors[variant]}
        />
      </Animated.View>
    );
  };

  const useGradient = variant === 'primary' || variant === 'secondary';
  const gradientColorsArray: [string, string, string] = variant === 'primary' 
    ? (gradientColors.primary as [string, string, string])
    : (gradientColors.secondary as [string, string, string]);

  const ButtonContent = () => (
    <>
      {/* Ripple effect overlay */}
      <Animated.View
        style={[
          rippleStyle,
          {
            position: 'absolute',
            width: '100%',
            height: '100%',
            borderRadius: 12,
            backgroundColor: 'rgba(255, 255, 255, 0.2)',
          },
        ]}
        pointerEvents="none"
      />

      {/* Loading indicator */}
      <Animated.View style={[loadingStyle, { position: 'absolute' }]}>
        <ActivityIndicator
          color={iconColors[variant]}
          size="small"
          accessibilityLabel="Loading"
        />
      </Animated.View>

      {/* Content */}
      <Animated.View style={[contentStyle, { flexDirection: 'row', alignItems: 'center', gap: 8 }]}>
        {icon && iconPosition === 'left' && renderIcon()}
        <Text
          className={`font-semibold ${textVariantStyles[variant]} ${textSizeStyles[size]}`}
          accessibilityElementsHidden
        >
          {title}
        </Text>
        {icon && iconPosition === 'right' && renderIcon()}
      </Animated.View>
    </>
  );

  return (
    <AnimatedTouchableOpacity
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      className={`${baseStyles} ${!useGradient ? variantStyles[variant] : ''} ${sizeStyles[size]} ${disabledStyles} ${className}`}
      activeOpacity={1}
      style={[animatedStyle]}
      accessibilityRole={accessibilityRole}
      accessibilityLabel={computedAccessibilityLabel}
      accessibilityHint={computedAccessibilityHint}
      accessibilityState={{
        disabled: disabled || loading,
        busy: loading,
      }}
    >
      {useGradient ? (
        <LinearGradient
          colors={gradientColorsArray}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="flex-1 flex-row items-center justify-center rounded-xl"
          style={{ paddingVertical: size === 'sm' ? 8 : size === 'md' ? 12 : 16 }}
        >
          <ButtonContent />
        </LinearGradient>
      ) : (
        <ButtonContent />
      )}
    </AnimatedTouchableOpacity>
  );
});

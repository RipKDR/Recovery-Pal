/**
 * Card Component
 * Dark navy themed card with subtle borders
 * Matches reference site design
 * BMAD Upgrade: Uses expo-blur for glassmorphism, press animations, haptics, shadows, border glow
 */

import { memo } from 'react';
import type { ReactNode } from 'react';
import { View, Pressable, AccessibilityRole, StyleSheet } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  interpolate,
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

interface CardProps {
  children: ReactNode;
  onPress?: () => void;
  variant?: 'default' | 'elevated' | 'outlined' | 'glass' | 'glass-heavy';
  className?: string;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  accessibilityRole?: AccessibilityRole;
  accessibilityElementsHidden?: boolean;
}

const AnimatedPressable = Animated.createAnimatedComponent(Pressable);
const AnimatedView = Animated.createAnimatedComponent(View);

const VARIANT_STYLES = {
  default: 'bg-navy-800/40 border border-white/10',
  elevated: 'bg-navy-800/60 border border-white/10',
  outlined: 'bg-transparent border border-white/20',
  glass: 'bg-navy-900/30 border border-white/10', // Fallback or tint
  'glass-heavy': 'bg-navy-900/50 border border-white/10',
};

// Shadow styles based on variant
const SHADOW_STYLES = {
  default: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  elevated: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
  },
  outlined: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },
  glass: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 3,
  },
  'glass-heavy': {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 8,
  },
};

export const Card = memo(function Card({
  children,
  onPress,
  variant = 'default',
  className = '',
  accessibilityLabel,
  accessibilityHint,
  accessibilityRole,
  accessibilityElementsHidden,
}: CardProps) {
  const scale = useSharedValue(1);
  const borderGlow = useSharedValue(0);

  const baseStyles = 'rounded-2xl overflow-hidden';

  // Variants
  const isGlass = variant === 'glass' || variant === 'glass-heavy';
  const isElevated = variant === 'elevated';

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const borderGlowStyle = useAnimatedStyle(() => {
    if (!isElevated) return {};

    const glowOpacity = interpolate(
      borderGlow.value,
      [0, 1],
      [0, 0.3],
      'clamp'
    );

    return {
      borderWidth: 1,
      borderColor: `rgba(96, 165, 250, ${glowOpacity})`, // primary-400
    };
  });

  const handlePressIn = () => {
    if (onPress) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
      if (isElevated) {
        borderGlow.value = withSpring(1, { damping: 15 });
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }
    }
  };

  const handlePressOut = () => {
    if (onPress) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
      if (isElevated) {
        borderGlow.value = withSpring(0, { damping: 15 });
      }
    }
  };

  const handlePress = () => {
    if (onPress) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };

  const content = (
    <View className={`p-4 ${className}`}>
      {children}
    </View>
  );

  // Glass Implementation
  if (isGlass) {
    const intensity = variant === 'glass-heavy' ? 40 : 20;

    if (onPress) {
      return (
        <AnimatedPressable
          onPress={handlePress}
          onPressIn={handlePressIn}
          onPressOut={handlePressOut}
          className={`${baseStyles} border border-white/10 ${className}`}
          style={[animatedStyle, SHADOW_STYLES[variant]]}
          accessibilityRole={accessibilityRole || 'button'}
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
        >
          <BlurView intensity={intensity} tint="dark" className="flex-1">
            <View className="p-4">
              {children}
            </View>
          </BlurView>
        </AnimatedPressable>
      );
    }

    return (
      <AnimatedView
        className={`${baseStyles} border border-white/10 ${className}`}
        style={[SHADOW_STYLES[variant]]}
        accessible
        accessibilityLabel={accessibilityLabel}
        accessibilityElementsHidden={accessibilityElementsHidden}
      >
        <BlurView intensity={intensity} tint="dark" className="flex-1">
          <View className="p-4">
            {children}
          </View>
        </BlurView>
      </AnimatedView>
    );
  }

  // Non-glass variants
  if (onPress) {
    return (
      <AnimatedPressable
        onPress={handlePress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        className={`${baseStyles} ${VARIANT_STYLES[variant]} ${className}`}
        style={[animatedStyle, borderGlowStyle, SHADOW_STYLES[variant]]}
        accessibilityRole={accessibilityRole || 'button'}
        accessibilityLabel={accessibilityLabel}
        accessibilityHint={accessibilityHint}
      >
        {content}
      </AnimatedPressable>
    );
  }

  return (
    <AnimatedView
      className={`${baseStyles} ${VARIANT_STYLES[variant]} ${className}`}
      style={[SHADOW_STYLES[variant]]}
      accessible
      accessibilityLabel={accessibilityLabel}
      accessibilityElementsHidden={accessibilityElementsHidden}
    >
      {content}
    </AnimatedView>
  );
});

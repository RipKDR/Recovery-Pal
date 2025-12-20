/**
 * Achievement Card Component
 * Displays an achievement with its status and progress
 */

import React, { memo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Card } from '../ui';
import type { Achievement } from '../../lib/types';

interface AchievementCardProps {
  achievement: Achievement;
  onPress?: () => void;
  showProgress?: boolean;
  className?: string;
}

export const AchievementCard = memo(function AchievementCard({
  achievement,
  onPress,
  showProgress = true,
  className = '',
}: AchievementCardProps) {
  const { title, description, icon, status, current, target, unlockedAt } = achievement;
  
  const isUnlocked = status === 'unlocked';
  const isInProgress = status === 'in_progress';
  const progress = target && current ? Math.min((current / target) * 100, 100) : 0;

  const CardWrapper = onPress ? TouchableOpacity : View;

  return (
    <CardWrapper onPress={onPress} activeOpacity={0.7}>
      <Card
        variant={isUnlocked ? 'elevated' : 'outlined'}
        className={`${className} ${isUnlocked ? 'border-l-4 border-l-secondary-500' : ''} ${
          status === 'locked' ? 'opacity-60' : ''
        }`}
      >
        <View className="flex-row items-center gap-3">
          {/* Icon */}
          <View
            className={`w-12 h-12 rounded-full items-center justify-center ${
              isUnlocked
                ? 'bg-secondary-100 dark:bg-secondary-900'
                : 'bg-surface-100 dark:bg-surface-700'
            }`}
          >
            <Text className="text-2xl">{icon}</Text>
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text
              className={`text-base font-semibold ${
                isUnlocked
                  ? 'text-surface-900 dark:text-surface-100'
                  : 'text-surface-600 dark:text-surface-400'
              }`}
            >
              {title}
            </Text>
            <Text className="text-sm text-surface-500 dark:text-surface-400">
              {description}
            </Text>
          </View>

          {/* Status indicator */}
          {isUnlocked && (
            <View className="items-center">
              <Text className="text-secondary-500 text-lg">✓</Text>
              {unlockedAt && (
                <Text className="text-xs text-surface-400">
                  {formatDate(unlockedAt)}
                </Text>
              )}
            </View>
          )}
        </View>

        {/* Progress bar for in-progress achievements */}
        {showProgress && isInProgress && target && (
          <View className="mt-3">
            <View className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full overflow-hidden">
              <View
                className="h-full bg-primary-500 rounded-full"
                style={{ width: `${progress}%` }}
              />
            </View>
            <View className="flex-row justify-between mt-1">
              <Text className="text-xs text-surface-500">
                {current || 0} / {target}
              </Text>
              <Text className="text-xs text-surface-500">
                {Math.round(progress)}%
              </Text>
            </View>
          </View>
        )}
      </Card>
    </CardWrapper>
  );
});

/**
 * Compact achievement display for lists
 */
export const AchievementBadge = memo(function AchievementBadge({
  achievement,
  onPress,
}: {
  achievement: Achievement;
  onPress?: () => void;
}) {
  const { icon, status, title } = achievement;
  const isUnlocked = status === 'unlocked';

  const Wrapper = onPress ? TouchableOpacity : View;

  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      className={`items-center p-2 ${!isUnlocked ? 'opacity-40' : ''}`}
    >
      <View
        className={`w-14 h-14 rounded-xl items-center justify-center ${
          isUnlocked
            ? 'bg-secondary-100 dark:bg-secondary-900'
            : 'bg-surface-200 dark:bg-surface-700'
        }`}
      >
        <Text className="text-2xl">{icon}</Text>
        {isUnlocked && (
          <View className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-secondary-500 items-center justify-center">
            <Text className="text-white text-xs">✓</Text>
          </View>
        )}
      </View>
      <Text
        className="text-xs text-center mt-1 text-surface-600 dark:text-surface-400"
        numberOfLines={2}
      >
        {title}
      </Text>
    </Wrapper>
  );
});

function formatDate(date: Date): string {
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  });
}


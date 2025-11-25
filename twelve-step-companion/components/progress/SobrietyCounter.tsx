/**
 * Sobriety Counter Component
 * Large, prominent display of recovery duration with accessibility support
 * Phase 4: Optimized with React.memo
 */

import React, { memo, useMemo } from 'react';
import { View, Text } from 'react-native';
import { Card } from '../ui';

interface SobrietyCounterProps {
  days: number;
  hours?: number;
  minutes?: number;
  showDetailed?: boolean;
  className?: string;
}

export const SobrietyCounter = memo(function SobrietyCounter({
  days,
  hours = 0,
  minutes = 0,
  showDetailed = false,
  className = '',
}: SobrietyCounterProps) {
  // Calculate time units with memoization
  const { years, months, daysInMonth } = useMemo(() => {
    const y = Math.floor(days / 365);
    const remainingDays = days % 365;
    const m = Math.floor(remainingDays / 30);
    const d = remainingDays % 30;
    return { years: y, months: m, daysInMonth: d };
  }, [days]);

  // Build accessibility label with memoization
  const accessibilityLabel = useMemo(() => {
    let label = `${days} ${days === 1 ? 'day' : 'days'} sober`;
    
    if (showDetailed && days > 0) {
      const parts: string[] = [];
      if (years > 0) parts.push(`${years} ${years === 1 ? 'year' : 'years'}`);
      if (months > 0) parts.push(`${months} ${months === 1 ? 'month' : 'months'}`);
      parts.push(`${daysInMonth} ${daysInMonth === 1 ? 'day' : 'days'}`);
      label = parts.join(', ') + ' sober';
    }
    
    // Add encouraging message
    if (days === 0) label += '. Your journey begins now!';
    else if (days === 1) label += '. One day at a time!';
    else if (days < 7) label += '. Every day is a victory!';
    else if (days < 30) label += '. Building momentum!';
    else if (days < 90) label += '. Amazing progress!';
    else label += '. You are an inspiration!';
    
    return label;
  }, [days, showDetailed, years, months, daysInMonth]);

  return (
    <Card 
      variant="elevated" 
      className={`items-center ${className}`}
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="text"
    >
      {/* Main counter */}
      <View className="items-center" accessibilityElementsHidden>
        <Text className="text-6xl font-bold text-primary-600 dark:text-primary-400">
          {days}
        </Text>
        <Text className="text-xl text-surface-600 dark:text-surface-400 -mt-1">
          {days === 1 ? 'day' : 'days'}
        </Text>
      </View>

      {/* Detailed breakdown */}
      {showDetailed && days > 0 && (
        <View className="flex-row mt-4 gap-4" accessibilityElementsHidden>
          {years > 0 && (
            <View className="items-center">
              <Text className="text-2xl font-semibold text-secondary-600">
                {years}
              </Text>
              <Text className="text-sm text-surface-500">
                {years === 1 ? 'year' : 'years'}
              </Text>
            </View>
          )}
          {(months > 0 || years > 0) && (
            <View className="items-center">
              <Text className="text-2xl font-semibold text-secondary-600">
                {months}
              </Text>
              <Text className="text-sm text-surface-500">
                {months === 1 ? 'month' : 'months'}
              </Text>
            </View>
          )}
          <View className="items-center">
            <Text className="text-2xl font-semibold text-secondary-600">
              {daysInMonth}
            </Text>
            <Text className="text-sm text-surface-500">
              {daysInMonth === 1 ? 'day' : 'days'}
            </Text>
          </View>
        </View>
      )}

      {/* Hours and minutes (optional) */}
      {showDetailed && (
        <View className="flex-row mt-2 gap-2" accessibilityElementsHidden>
          <Text className="text-sm text-surface-400">
            {hours} hours, {minutes % 60} minutes
          </Text>
        </View>
      )}

      {/* Encouraging message */}
      <View className="mt-4 bg-primary-50 dark:bg-primary-900/30 rounded-lg px-4 py-2" accessibilityElementsHidden>
        <Text className="text-center text-primary-700 dark:text-primary-300 text-sm">
          {days === 0
            ? 'Your journey begins now 💪'
            : days === 1
            ? 'One day at a time 🌅'
            : days < 7
            ? 'Every day is a victory! ⭐'
            : days < 30
            ? 'Building momentum! 🚀'
            : days < 90
            ? 'Amazing progress! 🌟'
            : 'You are an inspiration! 🎉'}
        </Text>
      </View>
    </Card>
  );
});

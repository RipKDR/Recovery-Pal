/**
 * Loading State Component
 * Consistent loading indicators across the app
 * Phase 4: Production polish
 */

import React, { memo } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';

interface LoadingStateProps {
  message?: string;
  variant?: 'default' | 'fullscreen' | 'inline';
  size?: 'small' | 'large';
  className?: string;
}

export const LoadingState = memo(function LoadingState({
  message,
  variant = 'default',
  size = 'large',
  className = '',
}: LoadingStateProps) {
  if (variant === 'inline') {
    return (
      <View className={`flex-row items-center justify-center py-4 ${className}`}>
        <ActivityIndicator size={size} color="#3B82F6" />
        {message && (
          <Text className="text-surface-500 ml-3 text-sm">{message}</Text>
        )}
      </View>
    );
  }

  if (variant === 'fullscreen') {
    return (
      <View className={`flex-1 items-center justify-center bg-surface-50 dark:bg-surface-900 ${className}`}>
        <View className="w-16 h-16 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mb-4">
          <ActivityIndicator size={size} color="#3B82F6" />
        </View>
        {message && (
          <Text className="text-surface-600 dark:text-surface-400 text-base">
            {message}
          </Text>
        )}
      </View>
    );
  }

  // Default variant
  return (
    <View className={`items-center justify-center py-12 ${className}`}>
      <ActivityIndicator size={size} color="#3B82F6" />
      {message && (
        <Text className="text-surface-500 mt-4 text-center px-6">
          {message}
        </Text>
      )}
    </View>
  );
});

// Skeleton loading component for list items
export const SkeletonCard = memo(function SkeletonCard({
  lines = 3,
  className = '',
}: {
  lines?: number;
  className?: string;
}) {
  return (
    <View 
      className={`bg-white dark:bg-surface-800 rounded-xl p-4 mb-3 ${className}`}
      accessibilityLabel="Loading"
    >
      {/* Header skeleton */}
      <View className="flex-row items-center mb-3">
        <View className="w-10 h-10 rounded-full bg-surface-200 dark:bg-surface-700 animate-pulse" />
        <View className="flex-1 ml-3">
          <View className="h-4 w-24 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mb-1" />
          <View className="h-3 w-16 bg-surface-200 dark:bg-surface-700 rounded animate-pulse" />
        </View>
      </View>
      
      {/* Content skeleton lines */}
      {Array.from({ length: lines }).map((_, i) => (
        <View 
          key={i}
          className={`h-3 bg-surface-200 dark:bg-surface-700 rounded animate-pulse mb-2 ${
            i === lines - 1 ? 'w-3/4' : 'w-full'
          }`}
        />
      ))}
    </View>
  );
});

// Multiple skeleton cards
export const SkeletonList = memo(function SkeletonList({
  count = 3,
  lines = 3,
}: {
  count?: number;
  lines?: number;
}) {
  return (
    <View>
      {Array.from({ length: count }).map((_, i) => (
        <SkeletonCard key={i} lines={lines} />
      ))}
    </View>
  );
});

export default LoadingState;


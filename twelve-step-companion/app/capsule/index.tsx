/**
 * Time Capsule List Screen
 * View all time capsules - locked and unlocked
 */

import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../components/ui';
import { useCapsuleStore } from '../../lib/store';
import type { TimeCapsule } from '../../lib/types';

function CapsuleCard({
  capsule,
  onPress,
}: {
  capsule: TimeCapsule;
  onPress: () => void;
}) {
  const now = new Date();
  const isReady = capsule.unlockDate <= now;
  const daysUntilUnlock = Math.ceil(
    (capsule.unlockDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card
        variant={capsule.isUnlocked ? 'default' : 'outlined'}
        className={`mb-3 ${
          isReady && !capsule.isUnlocked
            ? 'border-amber-400 bg-amber-50 dark:bg-amber-900/20'
            : ''
        }`}
      >
        <View className="flex-row items-start gap-3">
          {/* Icon */}
          <View
            className={`w-12 h-12 rounded-full items-center justify-center ${
              capsule.isUnlocked
                ? 'bg-green-100 dark:bg-green-900/30'
                : isReady
                ? 'bg-amber-100 dark:bg-amber-900/30'
                : 'bg-surface-100 dark:bg-surface-800'
            }`}
          >
            <Text className="text-2xl">
              {capsule.isUnlocked ? '📖' : isReady ? '✨' : '🔐'}
            </Text>
          </View>

          {/* Content */}
          <View className="flex-1">
            <Text className="text-base font-semibold text-surface-900 dark:text-surface-100">
              {capsule.title}
            </Text>

            {capsule.isUnlocked ? (
              <Text className="text-sm text-green-600 dark:text-green-400">
                Opened{' '}
                {capsule.unlockedAt?.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </Text>
            ) : isReady ? (
              <Text className="text-sm text-amber-600 dark:text-amber-400 font-medium">
                Ready to open! ✨
              </Text>
            ) : (
              <Text className="text-sm text-surface-500">
                Unlocks in {daysUntilUnlock} day{daysUntilUnlock !== 1 ? 's' : ''}
              </Text>
            )}

            <Text className="text-xs text-surface-400 mt-1">
              Created{' '}
              {capsule.createdAt.toLocaleDateString('en-US', {
                month: 'short',
                day: 'numeric',
                year: 'numeric',
              })}
            </Text>
          </View>

          {/* Status indicator */}
          <View className="items-end">
            {!capsule.isUnlocked && !isReady && (
              <Text className="text-xs text-surface-400">
                {capsule.unlockDate.toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                })}
              </Text>
            )}
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function CapsuleListScreen() {
  const router = useRouter();
  const { capsules, isLoading, loadCapsules, checkForUnlockableCapsules } =
    useCapsuleStore();

  const [refreshing, setRefreshing] = useState(false);
  const [unlockableCapsules, setUnlockableCapsules] = useState<TimeCapsule[]>([]);

  useEffect(() => {
    loadCapsules();
  }, []);

  useEffect(() => {
    checkUnlockable();
  }, [capsules]);

  const checkUnlockable = async () => {
    const ready = await checkForUnlockableCapsules();
    setUnlockableCapsules(ready);
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadCapsules();
    setRefreshing(false);
  };

  const lockedCapsules = capsules.filter((c) => !c.isUnlocked);
  const openedCapsules = capsules.filter((c) => c.isUnlocked);

  // Empty state
  if (!isLoading && capsules.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
        <View className="flex-1 px-4 py-6">
          <View className="flex-row items-center mb-6">
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary-600">← Back</Text>
            </TouchableOpacity>
          </View>

          <View className="flex-1 items-center justify-center">
            <Text className="text-6xl mb-4">💌</Text>
            <Text className="text-2xl font-bold text-surface-900 dark:text-surface-100 text-center">
              Time Capsules
            </Text>
            <Text className="text-surface-500 text-center mt-2 mb-6 px-8">
              Write a letter to your future self. It will be locked until your
              chosen date.
            </Text>
            <Button
              title="Create First Capsule"
              onPress={() => router.push('/capsule/new')}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
      <ScrollView
        className="flex-1 px-4 py-6"
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View className="flex-row items-center">
            <TouchableOpacity onPress={() => router.back()} className="mr-3">
              <Text className="text-primary-600">← Back</Text>
            </TouchableOpacity>
            <Text className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              Time Capsules
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/capsule/new')}
            className="bg-primary-600 rounded-full w-10 h-10 items-center justify-center"
          >
            <Text className="text-white text-2xl">+</Text>
          </TouchableOpacity>
        </View>

        {/* Unlockable capsules alert */}
        {unlockableCapsules.length > 0 && (
          <Card
            variant="elevated"
            className="mb-6 bg-amber-50 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800"
          >
            <View className="flex-row items-center gap-3">
              <Text className="text-3xl">✨</Text>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-amber-800 dark:text-amber-200">
                  {unlockableCapsules.length} Capsule
                  {unlockableCapsules.length > 1 ? 's' : ''} Ready!
                </Text>
                <Text className="text-sm text-amber-600 dark:text-amber-400">
                  Tap to open and read your message
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Locked capsules */}
        {lockedCapsules.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
              Waiting to Open ({lockedCapsules.length})
            </Text>
            {lockedCapsules.map((capsule) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                onPress={() => router.push(`/capsule/${capsule.id}`)}
              />
            ))}
          </View>
        )}

        {/* Opened capsules */}
        {openedCapsules.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
              Opened ({openedCapsules.length})
            </Text>
            {openedCapsules.map((capsule) => (
              <CapsuleCard
                key={capsule.id}
                capsule={capsule}
                onPress={() => router.push(`/capsule/${capsule.id}`)}
              />
            ))}
          </View>
        )}

        {/* Encouragement */}
        <Card variant="outlined" className="mb-6">
          <Text className="text-surface-600 dark:text-surface-400 text-center italic">
            "The best time to plant a tree was 20 years ago. The second best time
            is now."
          </Text>
        </Card>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}


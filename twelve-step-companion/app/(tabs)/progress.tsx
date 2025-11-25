/**
 * Progress Screen
 * Milestones, achievements, and recovery statistics
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SobrietyCounter, MilestoneCard, SimpleTrendChart } from '../../components/progress';
import { Card } from '../../components/ui';
import { useSobriety } from '../../lib/hooks/useSobriety';
import { useCheckin } from '../../lib/hooks/useCheckin';

export default function ProgressScreen() {
  const router = useRouter();
  const {
    profile,
    soberDays,
    soberHours,
    soberMinutes,
    achievedMilestones,
    nextMilestone,
    daysUntilNextMilestone,
    progressToNextMilestone,
    formattedDuration,
  } = useSobriety();

  const {
    checkinStreak,
    averageMood,
    averageCraving,
    checkinRate,
    moodTrend,
    cravingTrend,
    history,
  } = useCheckin();

  // Calculate "progress not perfection" metrics
  const totalCheckins = history.filter((c) => c.isCheckedIn).length;
  const soberPercentage = history.length > 0
    ? Math.round((totalCheckins / history.length) * 100)
    : 0;

  // Get trend emoji
  const getTrendEmoji = (trend: string, isPositive: boolean = true) => {
    if (trend === 'positive') return isPositive ? '📈' : '📉';
    if (trend === 'negative') return isPositive ? '📉' : '📈';
    return '➡️';
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <Text className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-6">
          Your Progress
        </Text>

        {/* Sobriety Counter */}
        <SobrietyCounter
          days={soberDays}
          hours={soberHours}
          minutes={soberMinutes}
          showDetailed
          className="mb-6"
        />

        {/* Progress Stats */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
            Progress Not Perfection
          </Text>
          <View className="flex-row gap-3">
            <Card variant="default" className="flex-1">
              <Text className="text-2xl font-bold text-primary-600">
                {totalCheckins}
              </Text>
              <Text className="text-sm text-surface-500">Total Check-ins</Text>
            </Card>
            <Card variant="default" className="flex-1">
              <Text className="text-2xl font-bold text-secondary-600">
                {checkinRate}%
              </Text>
              <Text className="text-sm text-surface-500">Check-in Rate</Text>
            </Card>
          </View>
        </View>

        {/* Mood & Craving Stats */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
            Wellness Trends
          </Text>
          <Card variant="default">
            <View className="flex-row justify-between items-center mb-4">
              <View>
                <Text className="text-sm text-surface-500">Average Mood</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl font-bold text-surface-900 dark:text-surface-100">
                    {averageMood.toFixed(1)}/10
                  </Text>
                  <Text>{getTrendEmoji(moodTrend, true)}</Text>
                </View>
              </View>
              <View>
                <Text className="text-sm text-surface-500">Average Craving</Text>
                <View className="flex-row items-center gap-2">
                  <Text className="text-xl font-bold text-surface-900 dark:text-surface-100">
                    {averageCraving.toFixed(1)}/10
                  </Text>
                  <Text>{getTrendEmoji(cravingTrend, false)}</Text>
                </View>
              </View>
            </View>
            
            <View className="border-t border-surface-200 dark:border-surface-700 pt-3">
              <View className="flex-row items-center gap-2">
                <Text className="text-lg">🔥</Text>
                <Text className="text-surface-700 dark:text-surface-300">
                  <Text className="font-bold">{checkinStreak}</Text> day check-in streak
                </Text>
              </View>
            </View>
          </Card>
        </View>

        {/* Mood Trend Chart */}
        <View className="mb-6">
          <SimpleTrendChart
            data={history}
            dataKey="mood"
            title="Mood Over Time"
            color="#7C3AED"
          />
        </View>

        {/* Craving Trend Chart */}
        <View className="mb-6">
          <SimpleTrendChart
            data={history}
            dataKey="cravingLevel"
            title="Cravings Over Time"
            color="#DC2626"
          />
        </View>

        {/* Next Milestone */}
        {nextMilestone && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
              Next Milestone
            </Text>
            <MilestoneCard
              milestone={nextMilestone}
              isAchieved={false}
              daysUntil={daysUntilNextMilestone || 0}
              progress={progressToNextMilestone}
            />
          </View>
        )}

        {/* Achieved Milestones */}
        {achievedMilestones.length > 0 && (
          <View className="mb-6">
            <Text className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
              Achieved Milestones
            </Text>
            {achievedMilestones
              .slice()
              .reverse()
              .map((milestone) => (
                <MilestoneCard
                  key={milestone.days}
                  milestone={milestone}
                  isAchieved
                  className="mb-3"
                />
              ))}
          </View>
        )}

        {/* Sobriety Date */}
        {profile && (
          <Card variant="outlined" className="mb-6">
            <View className="flex-row items-center gap-3">
              <Text className="text-2xl">📅</Text>
              <View>
                <Text className="text-sm text-surface-500">Recovery Started</Text>
                <Text className="text-surface-900 dark:text-surface-100 font-medium">
                  {new Date(profile.sobrietyDate).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </Text>
              </View>
            </View>
          </Card>
        )}

        {/* Relapse Support - Compassionate option */}
        <Card variant="default" className="mb-6 border border-surface-200 dark:border-surface-700">
          <TouchableOpacity
            onPress={() => router.push('/relapse')}
            className="flex-row items-center gap-3"
          >
            <View className="w-12 h-12 rounded-full bg-surface-100 dark:bg-surface-800 items-center justify-center">
              <Text className="text-xl">💚</Text>
            </View>
            <View className="flex-1">
              <Text className="text-base font-medium text-surface-900 dark:text-surface-100">
                Need to Reset?
              </Text>
              <Text className="text-sm text-surface-500">
                Log a relapse with compassion — your progress still matters
              </Text>
            </View>
            <Text className="text-surface-400">→</Text>
          </TouchableOpacity>
        </Card>

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}


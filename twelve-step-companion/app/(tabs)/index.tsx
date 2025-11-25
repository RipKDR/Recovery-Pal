/**
 * Dashboard/Home Screen
 * Main recovery overview with sobriety counter and quick actions
 */

import React from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SobrietyCounter, MilestoneCard } from '../../components/progress';
import { Card, Button } from '../../components/ui';
import { ReflectionCard } from '../../components/journal';
import { useSobriety } from '../../lib/hooks/useSobriety';
import { useCheckin } from '../../lib/hooks/useCheckin';

export default function DashboardScreen() {
  const router = useRouter();
  const {
    profile,
    soberDays,
    soberHours,
    soberMinutes,
    nextMilestone,
    daysUntilNextMilestone,
    progressToNextMilestone,
    isLoading: sobrietyLoading,
  } = useSobriety();

  const {
    hasCheckedInToday,
    todayCheckin,
    checkinStreak,
    averageMood,
  } = useCheckin();

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // If no profile, show onboarding prompt
  if (!sobrietyLoading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-4xl mb-4" accessibilityElementsHidden>🌱</Text>
          <Text 
            className="text-2xl font-bold text-surface-900 dark:text-surface-100 text-center"
            accessibilityRole="header"
          >
            Welcome to Recovery Companion
          </Text>
          <Text className="text-surface-600 dark:text-surface-400 text-center mt-2 mb-8">
            Your private, secure companion for your recovery journey.
          </Text>
          <Button
            title="Get Started"
            onPress={() => router.push('/onboarding/welcome')}
            size="lg"
            accessibilityLabel="Get started with Recovery Companion"
            accessibilityHint="Tap to begin setting up your recovery profile"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="flex-row justify-between items-start mb-6">
          <View accessible accessibilityRole="header">
            <Text className="text-2xl font-bold text-surface-900 dark:text-surface-100">
              {getGreeting()}, {profile?.displayName || 'Friend'} 👋
            </Text>
            <Text className="text-surface-500 mt-1">
              {new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                month: 'long',
                day: 'numeric',
              })}
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push('/settings')}
            className="w-10 h-10 bg-surface-100 dark:bg-surface-800 rounded-full items-center justify-center"
            accessibilityRole="button"
            accessibilityLabel="Open settings"
            accessibilityHint="Navigate to app settings"
          >
            <Text className="text-lg" accessibilityElementsHidden>⚙️</Text>
          </TouchableOpacity>
        </View>

        {/* Sobriety Counter */}
        <SobrietyCounter
          days={soberDays}
          hours={soberHours}
          minutes={soberMinutes}
          showDetailed={soberDays >= 30}
          className="mb-6"
        />

        {/* Quick Check-in Card */}
        {!hasCheckedInToday ? (
          <Card 
            variant="outlined" 
            className="mb-6 border-primary-200 dark:border-primary-800"
            accessibilityLabel={`Daily check-in available. How are you feeling today?`}
          >
            <View className="flex-row items-center gap-3 mb-3">
              <Text className="text-2xl" accessibilityElementsHidden>✨</Text>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                  Daily Check-in
                </Text>
                <Text className="text-sm text-surface-500">
                  How are you feeling today?
                </Text>
              </View>
            </View>
            <Button
              title="Check In Now"
              onPress={() => router.push('/checkin')}
              variant="primary"
              accessibilityLabel="Start daily check-in"
              accessibilityHint="Record your mood and cravings for today"
            />
          </Card>
        ) : (
          <>
            <Card 
              variant="default" 
              className="mb-3 bg-secondary-50 dark:bg-secondary-900/30"
              accessibilityLabel={`Already checked in today. Mood: ${todayCheckin?.mood} out of 10. Craving level: ${todayCheckin?.cravingLevel} out of 10.`}
            >
              <View className="flex-row items-center gap-3">
                <Text className="text-2xl" accessibilityElementsHidden>✅</Text>
                <View className="flex-1">
                  <Text className="text-surface-900 dark:text-surface-100 font-medium">
                    Checked in today!
                  </Text>
                  <Text className="text-sm text-surface-500">
                    Mood: {todayCheckin?.mood}/10 • Craving: {todayCheckin?.cravingLevel}/10
                  </Text>
                </View>
              </View>
            </Card>
            {/* High craving support */}
            {todayCheckin?.cravingLevel && todayCheckin.cravingLevel > 5 && (
              <TouchableOpacity
                onPress={() => router.push('/vault')}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Open Motivation Vault"
                accessibilityHint="Access your personal motivation content when cravings are strong"
              >
                <Card variant="outlined" className="mb-6 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
                  <View className="flex-row items-center gap-3">
                    <Text className="text-2xl" accessibilityElementsHidden>🔐</Text>
                    <View className="flex-1">
                      <Text className="text-amber-800 dark:text-amber-200 font-medium">
                        Cravings feeling strong?
                      </Text>
                      <Text className="text-sm text-amber-600 dark:text-amber-400">
                        Tap to open your Motivation Vault →
                      </Text>
                    </View>
                  </View>
                </Card>
              </TouchableOpacity>
            )}
          </>
        )}

        {/* Next Milestone */}
        {nextMilestone && (
          <View className="mb-6" accessible accessibilityRole="text">
            <Text 
              className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3"
              accessibilityRole="header"
            >
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

        {/* Quick Stats */}
        <View 
          className="flex-row gap-3 mb-6"
          accessible
          accessibilityLabel={`Quick stats. ${checkinStreak} day check-in streak. Average mood ${averageMood.toFixed(1)} out of 10.`}
        >
          <Card variant="default" className="flex-1" accessibilityElementsHidden>
            <Text className="text-2xl font-bold text-primary-600">
              {checkinStreak}
            </Text>
            <Text className="text-sm text-surface-500">Day Streak</Text>
          </Card>
          <Card variant="default" className="flex-1" accessibilityElementsHidden>
            <Text className="text-2xl font-bold text-secondary-600">
              {averageMood.toFixed(1)}
            </Text>
            <Text className="text-sm text-surface-500">Avg Mood</Text>
          </Card>
        </View>

        {/* Reflection Card - Look Back */}
        <ReflectionCard daysAgo={30} className="mb-6" />

        {/* Quick Actions */}
        <View className="mb-6">
          <Text 
            className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3"
            accessibilityRole="header"
          >
            Quick Actions
          </Text>
          <View className="flex-row flex-wrap gap-3">
            <TouchableOpacity
              onPress={() => router.push('/journal/new')}
              className="bg-primary-100 dark:bg-primary-900/30 rounded-xl px-4 py-3 flex-row items-center gap-2"
              accessibilityRole="button"
              accessibilityLabel="New Journal Entry"
              accessibilityHint="Create a new journal entry"
            >
              <Text className="text-lg" accessibilityElementsHidden>📝</Text>
              <Text className="text-primary-700 dark:text-primary-300 font-medium">
                New Journal
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/(tabs)/tools')}
              className="bg-secondary-100 dark:bg-secondary-900/30 rounded-xl px-4 py-3 flex-row items-center gap-2"
              accessibilityRole="button"
              accessibilityLabel="Recovery Tools"
              accessibilityHint="Access breathing exercises, step work, and more"
            >
              <Text className="text-lg" accessibilityElementsHidden>🧘</Text>
              <Text className="text-secondary-700 dark:text-secondary-300 font-medium">
                Recovery Tools
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/report')}
              className="bg-amber-100 dark:bg-amber-900/30 rounded-xl px-4 py-3 flex-row items-center gap-2"
              accessibilityRole="button"
              accessibilityLabel="Weekly Report"
              accessibilityHint="View your progress summary for this week"
            >
              <Text className="text-lg" accessibilityElementsHidden>📊</Text>
              <Text className="text-amber-700 dark:text-amber-300 font-medium">
                Weekly Report
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/scenarios')}
              className="bg-rose-100 dark:bg-rose-900/30 rounded-xl px-4 py-3 flex-row items-center gap-2"
              accessibilityRole="button"
              accessibilityLabel="Practice Scenarios"
              accessibilityHint="Practice coping with common trigger situations"
            >
              <Text className="text-lg" accessibilityElementsHidden>🎯</Text>
              <Text className="text-rose-700 dark:text-rose-300 font-medium">
                Practice Scenarios
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

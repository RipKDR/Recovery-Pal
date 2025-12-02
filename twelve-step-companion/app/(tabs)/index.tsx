/**
 * Dashboard/Home Screen
 * Main recovery overview with daily reading, sobriety counter, and quick actions
 */

import React, { useCallback } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { SobrietyCounter, MilestoneCard } from '../../components/progress';
import { Card, Button } from '../../components/ui';
import { ReflectionCard } from '../../components/journal';
import { DailyReadingCard, PhoneWidget, StatsRow, UpcomingMeetingWidget } from '../../components/home';
import { SponsorWidget } from '../../components/common';
import { useSobriety } from '../../lib/hooks/useSobriety';
import { useCheckin } from '../../lib/hooks/useCheckin';
import { useMeetings } from '../../lib/hooks/useMeetings';

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

  const { insights } = useMeetings();

  // Calculate greeting based on current time of day (recalculated on each render)
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  // Format current date (recalculated on each render)
  const formattedDate = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  });

  // Memoized navigation handlers
  const handleNavigateToSettings = useCallback(() => {
    router.push('/settings');
  }, [router]);

  const handleNavigateToOnboarding = useCallback(() => {
    router.push('/onboarding/welcome');
  }, [router]);

  const handleNavigateToCheckin = useCallback(() => {
    router.push('/checkin');
  }, [router]);

  const handleNavigateToVault = useCallback(() => {
    router.push('/vault');
  }, [router]);

  const handleNavigateToJournalNew = useCallback(() => {
    router.push('/journal/new');
  }, [router]);

  const handleNavigateToMyMeetings = useCallback(() => {
    router.push('/my-meetings');
  }, [router]);

  const handleNavigateToContacts = useCallback(() => {
    router.push('/contacts');
  }, [router]);

  const handleNavigateToTools = useCallback(() => {
    router.push('/(tabs)/tools');
  }, [router]);

  const handleNavigateToReport = useCallback(() => {
    router.push('/report');
  }, [router]);

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
            onPress={handleNavigateToOnboarding}
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
        {/* Header with greeting and day count */}
        <View className="flex-row justify-between items-start mb-6">
          <View accessible accessibilityRole="header" className="flex-1">
            <View className="flex-row items-baseline">
              <Text className="text-2xl font-bold text-surface-900 dark:text-surface-100">
                {greeting}{profile?.displayName ? `, ${profile.displayName}` : ''}
              </Text>
            </View>
            <Text className="text-surface-500 mt-1">
              {formattedDate}
            </Text>
          </View>
          <View className="flex-row items-center gap-2">
            {/* Day counter badge */}
            <View className="bg-primary-100 dark:bg-primary-900/40 px-3 py-1.5 rounded-full">
              <Text className="text-primary-700 dark:text-primary-300 font-bold">
                Day {soberDays}
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleNavigateToSettings}
              className="w-10 h-10 bg-surface-100 dark:bg-surface-800 rounded-full items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Open settings"
              accessibilityHint="Navigate to app settings"
            >
              <Text className="text-lg" accessibilityElementsHidden>⚙️</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Daily Reading Card */}
        <DailyReadingCard className="mb-4" />

        {/* Sobriety Counter - Simplified */}
        <SobrietyCounter
          days={soberDays}
          hours={soberHours}
          minutes={soberMinutes}
          showDetailed={soberDays >= 30}
          className="mb-4"
        />

        {/* Quick Check-in Card */}
        {!hasCheckedInToday ? (
          <Card 
            variant="outlined" 
            className="mb-4 border-primary-200 dark:border-primary-800"
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
              onPress={handleNavigateToCheckin}
              variant="primary"
              accessibilityLabel="Start daily check-in"
              accessibilityHint="Record your mood and cravings for today"
            />
          </Card>
        ) : (
          <>
            <Card 
              variant="default" 
              className="mb-4 bg-secondary-50 dark:bg-secondary-900/30"
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
                onPress={handleNavigateToVault}
                activeOpacity={0.7}
                accessibilityRole="button"
                accessibilityLabel="Open Motivation Vault"
                accessibilityHint="Access your personal motivation content when cravings are strong"
              >
                <Card variant="outlined" className="mb-4 border-amber-300 dark:border-amber-700 bg-amber-50 dark:bg-amber-900/20">
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

        {/* Sponsor Widget */}
        <SponsorWidget className="mb-4" />

        {/* Upcoming Meeting Widget */}
        <UpcomingMeetingWidget className="mb-4" />

        {/* Stats Row */}
        <StatsRow
          meetingCount={insights.totalMeetings}
          checkinStreak={checkinStreak}
          averageMood={averageMood}
          className="mb-4"
        />

        {/* Phone Calls Widget */}
        <PhoneWidget className="mb-4" />

        {/* Next Milestone */}
        {nextMilestone && (
          <View className="mb-4" accessible accessibilityRole="text">
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

        {/* Reflection Card - Look Back */}
        <ReflectionCard daysAgo={30} className="mb-4" />

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
              onPress={handleNavigateToJournalNew}
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
              onPress={handleNavigateToMyMeetings}
              className="bg-blue-100 dark:bg-blue-900/30 rounded-xl px-4 py-3 flex-row items-center gap-2"
              accessibilityRole="button"
              accessibilityLabel="My Meetings"
              accessibilityHint="View and manage your regular meetings"
            >
              <Text className="text-lg" accessibilityElementsHidden>📅</Text>
              <Text className="text-blue-700 dark:text-blue-300 font-medium">
                My Meetings
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNavigateToContacts}
              className="bg-green-100 dark:bg-green-900/30 rounded-xl px-4 py-3 flex-row items-center gap-2"
              accessibilityRole="button"
              accessibilityLabel="Recovery Contacts"
              accessibilityHint="View and manage your recovery contacts"
            >
              <Text className="text-lg" accessibilityElementsHidden>📱</Text>
              <Text className="text-green-700 dark:text-green-300 font-medium">
                Contacts
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleNavigateToTools}
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
              onPress={handleNavigateToReport}
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
          </View>
        </View>

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

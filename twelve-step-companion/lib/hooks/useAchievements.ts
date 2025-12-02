/**
 * Achievements Hook
 * Provides achievement tracking and keytag status
 */

import { useEffect, useCallback, useMemo } from 'react';
import { useAchievementStore, type AchievementContext } from '../store/achievementStore';
import { useProfileStore } from '../store/profileStore';
import { useCheckinStore } from '../store/checkinStore';
import { useMeetingStore } from '../store/meetingStore';
import { useContactStore } from '../store/contactStore';
import { useReadingStore } from '../store/readingStore';
import { useRegularMeetingStore } from '../store/regularMeetingStore';
import type { Achievement, AchievementCategory } from '../types';

export function useAchievements() {
  const {
    achievements,
    keytags,
    isLoading,
    isInitialized,
    totalUnlocked,
    totalAchievements,
    totalKeytags,
    earnedKeytags,
    recentUnlock,
    categoryProgress,
    initialize,
    loadAchievements,
    updateKeytagsForDays,
    checkAutoAchievements,
    selfCheckAchievement,
    saveReflection,
    getReflection,
    dismissRecentUnlock,
    getAchievementsByCategory,
  } = useAchievementStore();

  const { soberDays } = useProfileStore();
  const { checkinStreak } = useCheckinStore();
  const { meetings, insights } = useMeetingStore();
  const { contacts, sponsor } = useContactStore();
  const { readingStreak } = useReadingStore();
  const { homeGroup } = useRegularMeetingStore();

  // Initialize achievements on mount
  useEffect(() => {
    if (!isInitialized) {
      initialize();
    }
  }, [isInitialized, initialize]);

  // Update keytags when sobriety days change
  useEffect(() => {
    if (isInitialized && soberDays !== undefined) {
      updateKeytagsForDays(soberDays);
    }
  }, [isInitialized, soberDays, updateKeytagsForDays]);

  // Build achievement context for checking
  const achievementContext = useMemo<AchievementContext>(() => ({
    soberDays: soberDays || 0,
    contactsCount: contacts.length,
    hasSponsor: !!sponsor,
    hasHomeGroup: !!homeGroup,
    meetingsCount: insights.totalMeetings,
    meetingsInFirst90Days: calculateMeetingsInFirst90Days(meetings, soberDays || 0),
    checkinStreak: checkinStreak || 0,
    readingStreak: readingStreak || 0,
    tenthStepStreak: 0, // TODO: Add from tenthStepStore when needed
    gratitudeStreak: 0, // TODO: Add from gratitudeStore when needed
    phoneTherapyDays: 0, // TODO: Calculate from phone logs
    stepProgress: {}, // TODO: Add from stepWorkStore when needed
    meetingsWithShares: meetings.filter((m) => m.didShare).length,
  }), [
    soberDays,
    contacts.length,
    sponsor,
    homeGroup,
    insights.totalMeetings,
    meetings,
    checkinStreak,
    readingStreak,
  ]);

  // Check achievements when context changes
  const checkAchievements = useCallback(async () => {
    if (!isInitialized) return [];
    return checkAutoAchievements(achievementContext);
  }, [isInitialized, checkAutoAchievements, achievementContext]);

  // Get achievements filtered by category
  const getByCategory = useCallback((category: AchievementCategory): Achievement[] => {
    return getAchievementsByCategory(category);
  }, [getAchievementsByCategory]);

  // Get unlocked achievements
  const unlockedAchievements = useMemo(() => {
    return achievements.filter((a) => a.status === 'unlocked');
  }, [achievements]);

  // Get in-progress achievements
  const inProgressAchievements = useMemo(() => {
    return achievements.filter((a) => a.status === 'in_progress');
  }, [achievements]);

  // Get locked achievements
  const lockedAchievements = useMemo(() => {
    return achievements.filter((a) => a.status === 'locked');
  }, [achievements]);

  // Calculate overall progress percentage
  const overallProgress = useMemo(() => {
    const totalPossible = totalAchievements + totalKeytags;
    const totalEarned = totalUnlocked + earnedKeytags;
    return totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100) : 0;
  }, [totalAchievements, totalKeytags, totalUnlocked, earnedKeytags]);

  // Earned keytags only
  const earnedKeytagsList = useMemo(() => {
    return keytags.filter((k) => k.isEarned);
  }, [keytags]);

  // Next keytag to earn
  const nextKeytag = useMemo(() => {
    return keytags.find((k) => !k.isEarned);
  }, [keytags]);

  return {
    // State
    achievements,
    keytags,
    isLoading,
    isInitialized,
    totalUnlocked,
    totalAchievements,
    totalKeytags,
    earnedKeytags,
    recentUnlock,
    categoryProgress,

    // Computed
    unlockedAchievements,
    inProgressAchievements,
    lockedAchievements,
    overallProgress,
    earnedKeytagsList,
    nextKeytag,

    // Actions
    checkAchievements,
    selfCheckAchievement,
    saveReflection,
    getReflection,
    dismissRecentUnlock,
    getByCategory,
    loadAchievements,
  };
}

/**
 * Calculate meetings attended in first 90 days of sobriety
 */
function calculateMeetingsInFirst90Days(
  meetings: { attendedAt: Date }[],
  currentDays: number
): number {
  if (currentDays < 90) {
    // Still in first 90 days, count all meetings
    return meetings.length;
  }

  // Calculate 90 days ago from sobriety start
  const sobrietyStart = new Date();
  sobrietyStart.setDate(sobrietyStart.getDate() - currentDays);
  
  const ninetyDaysFromStart = new Date(sobrietyStart);
  ninetyDaysFromStart.setDate(ninetyDaysFromStart.getDate() + 90);

  return meetings.filter((m) => {
    const attendedDate = new Date(m.attendedAt);
    return attendedDate >= sobrietyStart && attendedDate <= ninetyDaysFromStart;
  }).length;
}


/**
 * Sobriety Hook
 * Provides sobriety calculations and milestone tracking
 */

import { useEffect, useMemo, useRef } from 'react';
import { useProfileStore, useSettingsStore } from '../store';
import { getNextMilestone, getLatestMilestone, getAchievedMilestones } from '../constants/milestones';
import { scheduleMilestoneNotification } from '../notifications';

export function useSobriety() {
  const {
    profile,
    soberDays,
    soberHours,
    soberMinutes,
    isLoading,
    loadProfile,
    createProfile,
    updateProfile,
    calculateSobriety,
  } = useProfileStore();

  const { settings } = useSettingsStore();
  const previousMilestoneCountRef = useRef<number | null>(null);

  // Load profile on mount
  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  // Recalculate sobriety every minute
  useEffect(() => {
    const interval = setInterval(() => {
      calculateSobriety();
    }, 60000); // Every minute

    return () => clearInterval(interval);
  }, [calculateSobriety]);

  // Check for new milestones and celebrate
  useEffect(() => {
    if (!profile || !settings?.notificationsEnabled) return;

    const achievedCount = getAchievedMilestones(soberDays).length;
    
    // Only trigger if we have a previous count and the count has increased
    if (
      previousMilestoneCountRef.current !== null &&
      achievedCount > previousMilestoneCountRef.current
    ) {
      const latestAchieved = getLatestMilestone(soberDays);
      if (latestAchieved) {
        // Trigger milestone celebration notification
        scheduleMilestoneNotification(latestAchieved.title, latestAchieved.days);
      }
    }

    previousMilestoneCountRef.current = achievedCount;
  }, [soberDays, profile, settings?.notificationsEnabled]);

  // Computed milestone info
  const nextMilestone = useMemo(() => getNextMilestone(soberDays), [soberDays]);
  const latestMilestone = useMemo(() => getLatestMilestone(soberDays), [soberDays]);
  const achievedMilestones = useMemo(() => getAchievedMilestones(soberDays), [soberDays]);

  // Days until next milestone
  const daysUntilNextMilestone = useMemo(() => {
    if (!nextMilestone) return null;
    return nextMilestone.days - soberDays;
  }, [nextMilestone, soberDays]);

  // Progress percentage to next milestone
  const progressToNextMilestone = useMemo(() => {
    if (!nextMilestone || !latestMilestone) return 0;
    const totalDays = nextMilestone.days - latestMilestone.days;
    const currentDays = soberDays - latestMilestone.days;
    return Math.round((currentDays / totalDays) * 100);
  }, [nextMilestone, latestMilestone, soberDays]);

  // Format sobriety duration
  const formattedDuration = useMemo(() => {
    if (soberDays >= 365) {
      const years = Math.floor(soberDays / 365);
      const remainingDays = soberDays % 365;
      if (remainingDays === 0) {
        return `${years} year${years > 1 ? 's' : ''}`;
      }
      return `${years} year${years > 1 ? 's' : ''}, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
    if (soberDays >= 30) {
      const months = Math.floor(soberDays / 30);
      const remainingDays = soberDays % 30;
      if (remainingDays === 0) {
        return `${months} month${months > 1 ? 's' : ''}`;
      }
      return `${months} month${months > 1 ? 's' : ''}, ${remainingDays} day${remainingDays > 1 ? 's' : ''}`;
    }
    return `${soberDays} day${soberDays !== 1 ? 's' : ''}`;
  }, [soberDays]);

  return {
    profile,
    soberDays,
    soberHours,
    soberMinutes,
    isLoading,
    createProfile,
    updateProfile,
    nextMilestone,
    latestMilestone,
    achievedMilestones,
    daysUntilNextMilestone,
    progressToNextMilestone,
    formattedDuration,
  };
}


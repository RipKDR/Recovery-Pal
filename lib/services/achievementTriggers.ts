/**
 * Achievement Trigger Service
 * Automatically triggers achievement checks when relevant actions occur
 */

import { useAchievementStore, type AchievementContext } from '../store/achievementStore';
import { getSponsor, getRecoveryContacts } from '../db/models';
import { scheduleAchievementNotification } from '../notifications';
import type { Achievement } from '../types';

/**
 * Trigger achievement check after adding a contact
 */
export async function onContactAdded(): Promise<Achievement[]> {
  const store = useAchievementStore.getState();
  
  // Get current contacts count
  const contacts = await getRecoveryContacts();
  const sponsor = await getSponsor();
  
  const context = {
    soberDays: 0, // Will be filled by checkAutoAchievements
    contactsCount: contacts.length,
    hasSponsor: !!sponsor,
    hasHomeGroup: false,
    meetingsCount: 0,
    checkinStreak: 0,
    readingStreak: 0,
    tenthStepStreak: 0,
    gratitudeStreak: 0,
    phoneTherapyDays: 0,
    stepProgress: {},
    meetingsWithShares: 0,
  };
  
  const newlyUnlocked = await store.checkAutoAchievements(context);
  
  // Schedule notifications for newly unlocked achievements
  for (const achievement of newlyUnlocked) {
    await scheduleAchievementNotification(achievement);
  }
  
  return newlyUnlocked;
}

/**
 * Trigger achievement check after logging a meeting
 */
export async function onMeetingLogged(meetingsCount: number, didShare: boolean): Promise<Achievement[]> {
  const store = useAchievementStore.getState();
  
  const context = {
    soberDays: 0,
    contactsCount: 0,
    hasSponsor: false,
    hasHomeGroup: false,
    meetingsCount,
    checkinStreak: 0,
    readingStreak: 0,
    tenthStepStreak: 0,
    gratitudeStreak: 0,
    phoneTherapyDays: 0,
    stepProgress: {},
    meetingsWithShares: didShare ? 1 : 0,
  };
  
  const newlyUnlocked = await store.checkAutoAchievements(context);
  
  for (const achievement of newlyUnlocked) {
    await scheduleAchievementNotification(achievement);
  }
  
  return newlyUnlocked;
}

/**
 * Trigger achievement check after completing step work
 */
export async function onStepWorkUpdated(
  stepNumber: number,
  answeredQuestions: number,
  totalQuestions: number
): Promise<Achievement[]> {
  const store = useAchievementStore.getState();
  
  const stepProgress: Record<number, { answered: number; total: number }> = {
    [stepNumber]: { answered: answeredQuestions, total: totalQuestions },
  };
  
  const context = {
    soberDays: 0,
    contactsCount: 0,
    hasSponsor: false,
    hasHomeGroup: false,
    meetingsCount: 0,
    checkinStreak: 0,
    readingStreak: 0,
    tenthStepStreak: 0,
    gratitudeStreak: 0,
    phoneTherapyDays: 0,
    stepProgress,
    meetingsWithShares: 0,
  };
  
  const newlyUnlocked = await store.checkAutoAchievements(context);
  
  for (const achievement of newlyUnlocked) {
    await scheduleAchievementNotification(achievement);
  }
  
  return newlyUnlocked;
}

/**
 * Trigger achievement check after daily check-in
 */
export async function onCheckinCompleted(checkinStreak: number): Promise<Achievement[]> {
  const store = useAchievementStore.getState();
  
  const context = {
    soberDays: 0,
    contactsCount: 0,
    hasSponsor: false,
    hasHomeGroup: false,
    meetingsCount: 0,
    checkinStreak,
    readingStreak: 0,
    tenthStepStreak: 0,
    gratitudeStreak: 0,
    phoneTherapyDays: 0,
    stepProgress: {},
    meetingsWithShares: 0,
  };
  
  const newlyUnlocked = await store.checkAutoAchievements(context);
  
  for (const achievement of newlyUnlocked) {
    await scheduleAchievementNotification(achievement);
  }
  
  return newlyUnlocked;
}

/**
 * Trigger achievement check after reading reflection
 */
export async function onReadingCompleted(readingStreak: number): Promise<Achievement[]> {
  const store = useAchievementStore.getState();
  
  const context = {
    soberDays: 0,
    contactsCount: 0,
    hasSponsor: false,
    hasHomeGroup: false,
    meetingsCount: 0,
    checkinStreak: 0,
    readingStreak,
    tenthStepStreak: 0,
    gratitudeStreak: 0,
    phoneTherapyDays: 0,
    stepProgress: {},
    meetingsWithShares: 0,
  };
  
  const newlyUnlocked = await store.checkAutoAchievements(context);
  
  for (const achievement of newlyUnlocked) {
    await scheduleAchievementNotification(achievement);
  }
  
  return newlyUnlocked;
}

/**
 * Trigger keytag check when sobriety days update
 */
export function onSobrietyDaysUpdated(soberDays: number): void {
  const store = useAchievementStore.getState();
  store.updateKeytagsForDays(soberDays);
}

/**
 * Trigger full achievement check (call on app startup or after significant events)
 */
export async function triggerFullAchievementCheck(
  context: AchievementContext
): Promise<Achievement[]> {
  const store = useAchievementStore.getState();
  
  const newlyUnlocked = await store.checkAutoAchievements(context);
  
  for (const achievement of newlyUnlocked) {
    await scheduleAchievementNotification(achievement);
  }
  
  return newlyUnlocked;
}


/**
 * Achievement Definitions
 * All achievements available in the Recovery Companion
 */

import type { AchievementCategory, AchievementUnlockType } from '../types';

export interface AchievementDefinition {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string;
  unlockType: AchievementUnlockType;
  target?: number;
  requiresDaysClean?: number;
  requiresAchievements?: string[];
}

/**
 * Fellowship Achievements
 * Earned through connection with others in recovery
 */
export const FELLOWSHIP_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'fellowship-newcomer',
    category: 'fellowship',
    title: 'Newcomer',
    description: 'Started your recovery journey',
    icon: '🌱',
    unlockType: 'automatic',
    requiresDaysClean: 0,
  },
  {
    id: 'fellowship-first-contact',
    category: 'fellowship',
    title: 'First Contact',
    description: 'Added your first recovery contact',
    icon: '📱',
    unlockType: 'count',
    target: 1,
  },
  {
    id: 'fellowship-building-network',
    category: 'fellowship',
    title: 'Building Network',
    description: 'Added 3 recovery contacts',
    icon: '🤝',
    unlockType: 'count',
    target: 3,
  },
  {
    id: 'fellowship-connected',
    category: 'fellowship',
    title: 'Connected',
    description: 'Added 10 recovery contacts',
    icon: '🌐',
    unlockType: 'count',
    target: 10,
  },
  {
    id: 'fellowship-home-group',
    category: 'fellowship',
    title: 'Found My Home',
    description: 'Set your home group meeting',
    icon: '🏠',
    unlockType: 'automatic',
  },
  {
    id: 'fellowship-sponsor',
    category: 'fellowship',
    title: 'Got a Sponsor',
    description: 'Added a sponsor to your contacts',
    icon: '🧭',
    unlockType: 'automatic',
  },
  {
    id: 'fellowship-voice',
    category: 'fellowship',
    title: 'Found My Voice',
    description: 'Shared at a meeting',
    icon: '🎤',
    unlockType: 'self_check',
  },
  {
    id: 'fellowship-service',
    category: 'fellowship',
    title: 'First Service',
    description: 'Gave back through service work',
    icon: '🙏',
    unlockType: 'self_check',
  },
  {
    id: 'fellowship-90-in-90',
    category: 'fellowship',
    title: '90 in 90',
    description: 'Attended 90 meetings in your first 90 days',
    icon: '🏆',
    unlockType: 'automatic',
    requiresDaysClean: 90,
  },
];

/**
 * Step Work Achievements
 * Earned through working the 12 steps
 */
export const STEP_WORK_ACHIEVEMENTS: AchievementDefinition[] = [
  // Step 1
  {
    id: 'step-1-started',
    category: 'step_work',
    title: 'Step 1 Started',
    description: 'Began working Step 1',
    icon: '1️⃣',
    unlockType: 'progressive',
    target: 50,
  },
  {
    id: 'step-1-completed',
    category: 'step_work',
    title: 'Step 1 Completed',
    description: 'Completed all Step 1 questions',
    icon: '✅',
    unlockType: 'progressive',
    target: 100,
  },
  // Step 2
  {
    id: 'step-2-started',
    category: 'step_work',
    title: 'Step 2 Started',
    description: 'Began working Step 2',
    icon: '2️⃣',
    unlockType: 'progressive',
    target: 50,
  },
  {
    id: 'step-2-completed',
    category: 'step_work',
    title: 'Step 2 Completed',
    description: 'Completed all Step 2 questions',
    icon: '✅',
    unlockType: 'progressive',
    target: 100,
  },
  // Step 3
  {
    id: 'step-3-started',
    category: 'step_work',
    title: 'Step 3 Started',
    description: 'Began working Step 3',
    icon: '3️⃣',
    unlockType: 'progressive',
    target: 50,
  },
  {
    id: 'step-3-completed',
    category: 'step_work',
    title: 'Step 3 Completed',
    description: 'Completed all Step 3 questions',
    icon: '✅',
    unlockType: 'progressive',
    target: 100,
  },
  // Step 4
  {
    id: 'step-4-started',
    category: 'step_work',
    title: 'Step 4 Started',
    description: 'Began working Step 4',
    icon: '4️⃣',
    unlockType: 'progressive',
    target: 50,
  },
  {
    id: 'step-4-completed',
    category: 'step_work',
    title: 'Step 4 Completed',
    description: 'Completed all Step 4 questions',
    icon: '✅',
    unlockType: 'progressive',
    target: 100,
  },
  // Step 5
  {
    id: 'step-5-started',
    category: 'step_work',
    title: 'Step 5 Started',
    description: 'Began working Step 5',
    icon: '5️⃣',
    unlockType: 'progressive',
    target: 50,
  },
  {
    id: 'step-5-completed',
    category: 'step_work',
    title: 'Step 5 Completed',
    description: 'Completed all Step 5 questions',
    icon: '✅',
    unlockType: 'progressive',
    target: 100,
  },
  // Step 6
  {
    id: 'step-6-started',
    category: 'step_work',
    title: 'Step 6 Started',
    description: 'Began working Step 6',
    icon: '6️⃣',
    unlockType: 'progressive',
    target: 50,
  },
  {
    id: 'step-6-completed',
    category: 'step_work',
    title: 'Step 6 Completed',
    description: 'Completed all Step 6 questions',
    icon: '✅',
    unlockType: 'progressive',
    target: 100,
  },
  // Step 7
  {
    id: 'step-7-started',
    category: 'step_work',
    title: 'Step 7 Started',
    description: 'Began working Step 7',
    icon: '7️⃣',
    unlockType: 'progressive',
    target: 50,
  },
  {
    id: 'step-7-completed',
    category: 'step_work',
    title: 'Step 7 Completed',
    description: 'Completed all Step 7 questions',
    icon: '✅',
    unlockType: 'progressive',
    target: 100,
  },
  // Step 8
  {
    id: 'step-8-started',
    category: 'step_work',
    title: 'Step 8 Started',
    description: 'Began working Step 8',
    icon: '8️⃣',
    unlockType: 'progressive',
    target: 50,
  },
  {
    id: 'step-8-completed',
    category: 'step_work',
    title: 'Step 8 Completed',
    description: 'Completed all Step 8 questions',
    icon: '✅',
    unlockType: 'progressive',
    target: 100,
  },
  // Step 9
  {
    id: 'step-9-started',
    category: 'step_work',
    title: 'Step 9 Started',
    description: 'Began working Step 9',
    icon: '9️⃣',
    unlockType: 'progressive',
    target: 50,
  },
  {
    id: 'step-9-completed',
    category: 'step_work',
    title: 'Step 9 Completed',
    description: 'Completed all Step 9 questions',
    icon: '✅',
    unlockType: 'progressive',
    target: 100,
  },
  // Step 10
  {
    id: 'step-10-started',
    category: 'step_work',
    title: 'Step 10 Started',
    description: 'Began working Step 10',
    icon: '🔟',
    unlockType: 'progressive',
    target: 50,
  },
  {
    id: 'step-10-completed',
    category: 'step_work',
    title: 'Step 10 Completed',
    description: 'Completed all Step 10 questions',
    icon: '✅',
    unlockType: 'progressive',
    target: 100,
  },
  // Step 11
  {
    id: 'step-11-started',
    category: 'step_work',
    title: 'Step 11 Started',
    description: 'Began working Step 11',
    icon: '1️⃣1️⃣',
    unlockType: 'progressive',
    target: 50,
  },
  {
    id: 'step-11-completed',
    category: 'step_work',
    title: 'Step 11 Completed',
    description: 'Completed all Step 11 questions',
    icon: '✅',
    unlockType: 'progressive',
    target: 100,
  },
  // Step 12
  {
    id: 'step-12-started',
    category: 'step_work',
    title: 'Step 12 Started',
    description: 'Began working Step 12',
    icon: '1️⃣2️⃣',
    unlockType: 'progressive',
    target: 50,
  },
  {
    id: 'step-12-completed',
    category: 'step_work',
    title: 'Step 12 Completed',
    description: 'Completed all Step 12 questions',
    icon: '✅',
    unlockType: 'progressive',
    target: 100,
  },
  // All steps
  {
    id: 'step-all-completed',
    category: 'step_work',
    title: 'All Steps Complete',
    description: 'Completed all 12 steps',
    icon: '🎓',
    unlockType: 'automatic',
    requiresAchievements: [
      'step-1-completed',
      'step-2-completed',
      'step-3-completed',
      'step-4-completed',
      'step-5-completed',
      'step-6-completed',
      'step-7-completed',
      'step-8-completed',
      'step-9-completed',
      'step-10-completed',
      'step-11-completed',
      'step-12-completed',
    ],
  },
];

/**
 * Daily Practice Achievements
 * Earned through consistent daily recovery practices
 */
export const DAILY_PRACTICE_ACHIEVEMENTS: AchievementDefinition[] = [
  // Daily Reader (JFT)
  {
    id: 'practice-reader-7',
    category: 'daily_practice',
    title: 'Daily Reader (7)',
    description: '7 consecutive days of JFT reading',
    icon: '📖',
    unlockType: 'streak',
    target: 7,
  },
  {
    id: 'practice-reader-30',
    category: 'daily_practice',
    title: 'Daily Reader (30)',
    description: '30 consecutive days of JFT reading',
    icon: '📚',
    unlockType: 'streak',
    target: 30,
  },
  {
    id: 'practice-reader-90',
    category: 'daily_practice',
    title: 'Daily Reader (90)',
    description: '90 consecutive days of JFT reading',
    icon: '🏛️',
    unlockType: 'streak',
    target: 90,
  },
  // Check-in Streaks
  {
    id: 'practice-checkin-7',
    category: 'daily_practice',
    title: 'Check-in Streak (7)',
    description: '7 consecutive daily check-ins',
    icon: '✨',
    unlockType: 'streak',
    target: 7,
  },
  {
    id: 'practice-checkin-30',
    category: 'daily_practice',
    title: 'Check-in Streak (30)',
    description: '30 consecutive daily check-ins',
    icon: '🔥',
    unlockType: 'streak',
    target: 30,
  },
  {
    id: 'practice-checkin-90',
    category: 'daily_practice',
    title: 'Check-in Streak (90)',
    description: '90 consecutive daily check-ins',
    icon: '💎',
    unlockType: 'streak',
    target: 90,
  },
  // Phone Therapy
  {
    id: 'practice-phone-therapy',
    category: 'daily_practice',
    title: 'Phone Therapy',
    description: 'Made 3 calls in one day for 7 days',
    icon: '📞',
    unlockType: 'count',
    target: 7,
  },
  // Nightly Review
  {
    id: 'practice-nightly-review-7',
    category: 'daily_practice',
    title: 'Nightly Review (7)',
    description: '7 consecutive 10th step reviews',
    icon: '🌙',
    unlockType: 'streak',
    target: 7,
  },
  {
    id: 'practice-nightly-review-30',
    category: 'daily_practice',
    title: 'Nightly Review (30)',
    description: '30 consecutive 10th step reviews',
    icon: '⭐',
    unlockType: 'streak',
    target: 30,
  },
  // Gratitude
  {
    id: 'practice-gratitude-7',
    category: 'daily_practice',
    title: 'Grateful Heart (7)',
    description: '7 consecutive days of gratitude lists',
    icon: '💚',
    unlockType: 'streak',
    target: 7,
  },
  {
    id: 'practice-gratitude-30',
    category: 'daily_practice',
    title: 'Grateful Heart (30)',
    description: '30 consecutive days of gratitude lists',
    icon: '💛',
    unlockType: 'streak',
    target: 30,
  },
];

/**
 * Service Achievements
 * Earned through giving back
 */
export const SERVICE_ACHIEVEMENTS: AchievementDefinition[] = [
  {
    id: 'service-first-meeting',
    category: 'service',
    title: 'First Meeting',
    description: 'Attended your first meeting',
    icon: '🚪',
    unlockType: 'count',
    target: 1,
  },
  {
    id: 'service-10-meetings',
    category: 'service',
    title: 'Regular',
    description: 'Attended 10 meetings',
    icon: '📅',
    unlockType: 'count',
    target: 10,
  },
  {
    id: 'service-50-meetings',
    category: 'service',
    title: 'Dedicated',
    description: 'Attended 50 meetings',
    icon: '🎯',
    unlockType: 'count',
    target: 50,
  },
  {
    id: 'service-100-meetings',
    category: 'service',
    title: 'Committed',
    description: 'Attended 100 meetings',
    icon: '💪',
    unlockType: 'count',
    target: 100,
  },
];

/**
 * All achievement definitions combined
 */
export const ALL_ACHIEVEMENTS: AchievementDefinition[] = [
  ...FELLOWSHIP_ACHIEVEMENTS,
  ...STEP_WORK_ACHIEVEMENTS,
  ...DAILY_PRACTICE_ACHIEVEMENTS,
  ...SERVICE_ACHIEVEMENTS,
];

/**
 * Get achievement definition by ID
 */
export function getAchievementDefinition(id: string): AchievementDefinition | undefined {
  return ALL_ACHIEVEMENTS.find((a) => a.id === id);
}

/**
 * Get achievements by category
 */
export function getAchievementsByCategory(category: AchievementCategory): AchievementDefinition[] {
  return ALL_ACHIEVEMENTS.filter((a) => a.category === category);
}

/**
 * Get total achievements count
 */
export function getTotalAchievementsCount(): number {
  return ALL_ACHIEVEMENTS.length;
}


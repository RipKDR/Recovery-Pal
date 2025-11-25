/**
 * Time-Based Milestones
 * Recovery milestones based on sobriety duration
 */

export interface TimeMilestone {
  days: number;
  title: string;
  message: string;
  emoji: string;
}

export const TIME_MILESTONES: TimeMilestone[] = [
  {
    days: 1,
    title: '24 Hours',
    message: 'One day at a time. You made it through your first day!',
    emoji: '🌅',
  },
  {
    days: 3,
    title: '3 Days',
    message: 'Three days strong! The hardest part is behind you.',
    emoji: '💪',
  },
  {
    days: 7,
    title: '1 Week',
    message: 'A full week! Your body and mind are already healing.',
    emoji: '⭐',
  },
  {
    days: 14,
    title: '2 Weeks',
    message: 'Two weeks of courage and commitment. Keep going!',
    emoji: '🌟',
  },
  {
    days: 30,
    title: '1 Month',
    message: 'One month! This is a major achievement. Be proud!',
    emoji: '🏆',
  },
  {
    days: 60,
    title: '2 Months',
    message: 'Two months of freedom. You\'re building a new life!',
    emoji: '🎯',
  },
  {
    days: 90,
    title: '90 Days',
    message: 'The big 90! A cornerstone of recovery. Incredible!',
    emoji: '🎉',
  },
  {
    days: 180,
    title: '6 Months',
    message: 'Half a year! Your dedication is inspiring.',
    emoji: '🌈',
  },
  {
    days: 270,
    title: '9 Months',
    message: 'Nine months of growth and transformation!',
    emoji: '🦋',
  },
  {
    days: 365,
    title: '1 Year',
    message: 'ONE YEAR! A whole year of choosing yourself. Amazing!',
    emoji: '🎊',
  },
  {
    days: 548,
    title: '18 Months',
    message: 'A year and a half! Your resilience is remarkable.',
    emoji: '💎',
  },
  {
    days: 730,
    title: '2 Years',
    message: 'Two years! You\'ve proven anything is possible.',
    emoji: '👑',
  },
  {
    days: 1095,
    title: '3 Years',
    message: 'Three years of freedom! You\'re an inspiration.',
    emoji: '🏅',
  },
  {
    days: 1825,
    title: '5 Years',
    message: 'FIVE YEARS! A true testament to your strength.',
    emoji: '🌠',
  },
  {
    days: 3650,
    title: '10 Years',
    message: 'A decade! Your journey is a beacon of hope for others.',
    emoji: '🏛️',
  },
];

/**
 * Get the next upcoming milestone
 */
export function getNextMilestone(soberDays: number): TimeMilestone | null {
  return TIME_MILESTONES.find((m) => m.days > soberDays) || null;
}

/**
 * Get all achieved milestones
 */
export function getAchievedMilestones(soberDays: number): TimeMilestone[] {
  return TIME_MILESTONES.filter((m) => m.days <= soberDays);
}

/**
 * Get the most recent achieved milestone
 */
export function getLatestMilestone(soberDays: number): TimeMilestone | null {
  const achieved = getAchievedMilestones(soberDays);
  return achieved.length > 0 ? achieved[achieved.length - 1] : null;
}


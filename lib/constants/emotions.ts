/**
 * Default Emotion Tags
 * Predefined emotions for quick tagging
 */

export const DEFAULT_EMOTIONS = [
  { name: 'Grateful', color: '#10B981' },
  { name: 'Happy', color: '#FBBF24' },
  { name: 'Peaceful', color: '#60A5FA' },
  { name: 'Hopeful', color: '#A78BFA' },
  { name: 'Proud', color: '#F472B6' },
  { name: 'Anxious', color: '#F87171' },
  { name: 'Sad', color: '#6B7280' },
  { name: 'Angry', color: '#EF4444' },
  { name: 'Frustrated', color: '#FB923C' },
  { name: 'Lonely', color: '#8B5CF6' },
  { name: 'Tired', color: '#9CA3AF' },
  { name: 'Overwhelmed', color: '#EC4899' },
  { name: 'Motivated', color: '#34D399' },
  { name: 'Confused', color: '#FBBF24' },
  { name: 'Scared', color: '#F59E0B' },
] as const;

export type DefaultEmotionName = (typeof DEFAULT_EMOTIONS)[number]['name'];


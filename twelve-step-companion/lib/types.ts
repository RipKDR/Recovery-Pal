/**
 * Core TypeScript Types for 12-Step Recovery Companion
 * All sensitive content fields are encrypted at rest
 */

// Encrypted string type (Base64 encoded encrypted content)
export type EncryptedString = string;

// Program types supported
export type ProgramType = '12-step-aa' | '12-step-na' | 'smart' | 'custom';

// Journal entry types
export type JournalType = 'freeform' | 'step-work' | 'meeting-reflection' | 'daily-checkin' | 'voice';

// Milestone types
export type MilestoneType = 'time-based' | 'step-completion' | 'personal' | 'meeting';

// Meeting types
export type MeetingType = 'in-person' | 'online';

// Theme modes
export type ThemeMode = 'light' | 'dark' | 'system';

/**
 * Core user profile for recovery tracking
 */
export interface SobrietyProfile {
  id: string;
  sobrietyDate: Date;
  programType: ProgramType;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Journal entry with encrypted content
 */
export interface JournalEntry {
  id: string;
  type: JournalType;
  content: EncryptedString; // Always encrypted at rest
  moodBefore?: number; // 1-10
  moodAfter?: number; // 1-10
  cravingLevel?: number; // 0-10
  emotionTags: string[];
  stepNumber?: number; // 1-12 if step-work type
  meetingId?: string; // if meeting-reflection type
  audioUri?: string; // if voice type - path to audio file
  audioDuration?: number; // duration in seconds
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Time-based and custom milestones
 */
export interface Milestone {
  id: string;
  type: MilestoneType;
  title: string;
  description?: string;
  reflection?: EncryptedString;
  achievedAt: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

/**
 * Meeting attendance log
 */
export interface MeetingLog {
  id: string;
  name?: string;
  location?: string;
  type: MeetingType;
  moodBefore: number;
  moodAfter: number;
  keyTakeaways: EncryptedString;
  topicTags: string[];
  attendedAt: Date;
  createdAt: Date;
}

/**
 * Daily check-in record (one per day)
 */
export interface DailyCheckin {
  id: string;
  date: Date; // Date only, one per day
  mood: number; // 1-10
  cravingLevel: number; // 0-10
  gratitude?: EncryptedString;
  isCheckedIn: boolean;
  createdAt: Date;
}

/**
 * Emotion tag for categorizing feelings
 */
export interface EmotionTag {
  id: string;
  name: string;
  color: string;
  isCustom: boolean;
  createdAt: Date;
}

/**
 * App settings and preferences
 */
export interface AppSettings {
  id: string;
  checkInTime: string; // HH:mm format
  autoLockMinutes: number;
  biometricEnabled: boolean;
  themeMode: ThemeMode;
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Relapse record for "progress not perfection" tracking
 */
export interface RelapseRecord {
  id: string;
  date: Date;
  whatHappened?: EncryptedString;
  whatLearned?: EncryptedString;
  previousSoberDays: number;
  createdAt: Date;
}

/**
 * Time Capsule - letters to future self
 */
export interface TimeCapsule {
  id: string;
  title: string;
  content: EncryptedString;
  unlockDate: Date;
  isUnlocked: boolean;
  unlockedAt?: Date;
  createdAt: Date;
}

export interface DbTimeCapsule {
  id: string;
  title: string;
  content: string;
  unlock_date: string;
  is_unlocked: number;
  unlocked_at: string | null;
  created_at: string;
}

/**
 * Authentication state
 */
export interface AuthState {
  isAuthenticated: boolean;
  isLocked: boolean;
  lastActiveAt: Date | null;
}

/**
 * Database row types (for SQLite)
 */
export interface DbSobrietyProfile {
  id: string;
  sobriety_date: string;
  program_type: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbJournalEntry {
  id: string;
  type: string;
  content: string;
  mood_before: number | null;
  mood_after: number | null;
  craving_level: number | null;
  emotion_tags: string;
  step_number: number | null;
  meeting_id: string | null;
  audio_uri: string | null;
  audio_duration: number | null;
  created_at: string;
  updated_at: string;
}

export interface DbDailyCheckin {
  id: string;
  date: string;
  mood: number;
  craving_level: number;
  gratitude: string | null;
  is_checked_in: number;
  created_at: string;
}

export interface DbMilestone {
  id: string;
  type: string;
  title: string;
  description: string | null;
  reflection: string | null;
  achieved_at: string;
  metadata: string;
  created_at: string;
}

export interface DbMeetingLog {
  id: string;
  name: string | null;
  location: string | null;
  type: string;
  mood_before: number;
  mood_after: number;
  key_takeaways: string;
  topic_tags: string;
  attended_at: string;
  created_at: string;
}

export interface DbEmotionTag {
  id: string;
  name: string;
  color: string;
  is_custom: number;
  created_at: string;
}

export interface DbAppSettings {
  id: string;
  check_in_time: string;
  auto_lock_minutes: number;
  biometric_enabled: number;
  theme_mode: string;
  notifications_enabled: number;
  created_at: string;
  updated_at: string;
}

// Vault item types
export type VaultItemType = 'letter' | 'photo' | 'audio' | 'reason' | 'quote';

/**
 * Personal Motivation Vault item
 * Extra protected content for motivation during difficult times
 */
export interface VaultItem {
  id: string;
  type: VaultItemType;
  title: string;
  content: EncryptedString; // Text content or file path
  mediaUri?: string; // For photos/audio
  isFavorite: boolean;
  viewCount: number;
  lastViewedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface DbVaultItem {
  id: string;
  type: string;
  title: string;
  content: string;
  media_uri: string | null;
  is_favorite: number;
  view_count: number;
  last_viewed_at: string | null;
  created_at: string;
  updated_at: string;
}

// Trigger Scenario types
export type ScenarioCategory = 'social' | 'emotional' | 'environmental' | 'physical';

/**
 * Trigger scenario with coping options
 */
export interface TriggerScenario {
  id: string;
  category: ScenarioCategory;
  title: string;
  description: string;
  options: ScenarioOption[];
  bestOptionIndex: number; // Index of the recommended option
}

export interface ScenarioOption {
  text: string;
  isHealthy: boolean;
  outcome: string;
  copingTip?: string;
}

/**
 * User's completed scenario practice
 */
export interface ScenarioPractice {
  id: string;
  scenarioId: string;
  selectedOptionIndex: number;
  reflection?: EncryptedString;
  completedAt: Date;
}

export interface DbScenarioPractice {
  id: string;
  scenario_id: string;
  selected_option_index: number;
  reflection: string | null;
  completed_at: string;
}


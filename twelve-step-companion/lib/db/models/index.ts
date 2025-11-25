/**
 * Database Model Operations
 * CRUD operations for all data models
 */

import { v4 as uuidv4 } from 'uuid';
import { getDatabase } from '../client';
import { encryptContent, decryptContent } from '../../encryption';
import type {
  SobrietyProfile,
  JournalEntry,
  DailyCheckin,
  Milestone,
  MeetingLog,
  EmotionTag,
  AppSettings,
  DbSobrietyProfile,
  DbJournalEntry,
  DbDailyCheckin,
  DbMilestone,
  DbEmotionTag,
  DbAppSettings,
  JournalType,
  MilestoneType,
  ProgramType,
  ThemeMode,
} from '../../types';

// ============================================
// SOBRIETY PROFILE
// ============================================

export async function createSobrietyProfile(
  sobrietyDate: Date,
  programType: ProgramType,
  displayName?: string
): Promise<SobrietyProfile> {
  const db = await getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO sobriety_profile (id, sobriety_date, program_type, display_name, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [id, sobrietyDate.toISOString(), programType, displayName || null, now, now]
  );

  return {
    id,
    sobrietyDate,
    programType,
    displayName,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

export async function getSobrietyProfile(): Promise<SobrietyProfile | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<DbSobrietyProfile>(
    'SELECT * FROM sobriety_profile LIMIT 1'
  );

  if (!row) return null;

  return {
    id: row.id,
    sobrietyDate: new Date(row.sobriety_date),
    programType: row.program_type as ProgramType,
    displayName: row.display_name || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function updateSobrietyProfile(
  updates: Partial<Pick<SobrietyProfile, 'sobrietyDate' | 'programType' | 'displayName'>>
): Promise<void> {
  const db = await getDatabase();
  const now = new Date().toISOString();
  const profile = await getSobrietyProfile();
  
  if (!profile) return;

  await db.runAsync(
    `UPDATE sobriety_profile SET
      sobriety_date = ?,
      program_type = ?,
      display_name = ?,
      updated_at = ?
     WHERE id = ?`,
    [
      updates.sobrietyDate?.toISOString() || profile.sobrietyDate.toISOString(),
      updates.programType || profile.programType,
      updates.displayName || profile.displayName || null,
      now,
      profile.id,
    ]
  );
}

// ============================================
// JOURNAL ENTRIES
// ============================================

export async function createJournalEntry(
  type: JournalType,
  content: string,
  options?: {
    moodBefore?: number;
    moodAfter?: number;
    cravingLevel?: number;
    emotionTags?: string[];
    stepNumber?: number;
    meetingId?: string;
    audioUri?: string;
    audioDuration?: number;
  }
): Promise<JournalEntry> {
  const db = await getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  // Encrypt the content
  const encryptedContent = await encryptContent(content);

  await db.runAsync(
    `INSERT INTO journal_entries (id, type, content, mood_before, mood_after, craving_level, emotion_tags, step_number, meeting_id, audio_uri, audio_duration, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      type,
      encryptedContent,
      options?.moodBefore || null,
      options?.moodAfter || null,
      options?.cravingLevel || null,
      JSON.stringify(options?.emotionTags || []),
      options?.stepNumber || null,
      options?.meetingId || null,
      options?.audioUri || null,
      options?.audioDuration || null,
      now,
      now,
    ]
  );

  return {
    id,
    type,
    content: encryptedContent,
    moodBefore: options?.moodBefore,
    moodAfter: options?.moodAfter,
    cravingLevel: options?.cravingLevel,
    emotionTags: options?.emotionTags || [],
    stepNumber: options?.stepNumber,
    meetingId: options?.meetingId,
    audioUri: options?.audioUri,
    audioDuration: options?.audioDuration,
    createdAt: new Date(now),
    updatedAt: new Date(now),
  };
}

export async function getJournalEntries(
  limit = 50,
  offset = 0,
  type?: JournalType
): Promise<JournalEntry[]> {
  const db = await getDatabase();
  
  let query = 'SELECT * FROM journal_entries';
  const params: (string | number)[] = [];
  
  if (type) {
    query += ' WHERE type = ?';
    params.push(type);
  }
  
  query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
  params.push(limit, offset);

  const rows = await db.getAllAsync<DbJournalEntry>(query, params);

  return rows.map((row) => ({
    id: row.id,
    type: row.type as JournalType,
    content: row.content, // Still encrypted, decrypt when displaying
    moodBefore: row.mood_before || undefined,
    moodAfter: row.mood_after || undefined,
    cravingLevel: row.craving_level || undefined,
    emotionTags: JSON.parse(row.emotion_tags || '[]'),
    stepNumber: row.step_number || undefined,
    meetingId: row.meeting_id || undefined,
    audioUri: row.audio_uri || undefined,
    audioDuration: row.audio_duration || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  }));
}

export async function getJournalEntryById(id: string): Promise<JournalEntry | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<DbJournalEntry>(
    'SELECT * FROM journal_entries WHERE id = ?',
    [id]
  );

  if (!row) return null;

  return {
    id: row.id,
    type: row.type as JournalType,
    content: row.content,
    moodBefore: row.mood_before || undefined,
    moodAfter: row.mood_after || undefined,
    cravingLevel: row.craving_level || undefined,
    emotionTags: JSON.parse(row.emotion_tags || '[]'),
    stepNumber: row.step_number || undefined,
    meetingId: row.meeting_id || undefined,
    audioUri: row.audio_uri || undefined,
    audioDuration: row.audio_duration || undefined,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function decryptJournalContent(entry: JournalEntry): Promise<string> {
  return await decryptContent(entry.content);
}

export async function deleteJournalEntry(id: string): Promise<void> {
  const db = await getDatabase();
  await db.runAsync('DELETE FROM journal_entries WHERE id = ?', [id]);
}

// ============================================
// DAILY CHECK-INS
// ============================================

export async function createDailyCheckin(
  mood: number,
  cravingLevel: number,
  gratitude?: string
): Promise<DailyCheckin> {
  const db = await getDatabase();
  const id = uuidv4();
  const now = new Date();
  const dateStr = now.toISOString().split('T')[0]; // YYYY-MM-DD

  // Encrypt gratitude if provided
  const encryptedGratitude = gratitude ? await encryptContent(gratitude) : null;

  await db.runAsync(
    `INSERT OR REPLACE INTO daily_checkins (id, date, mood, craving_level, gratitude, is_checked_in, created_at)
     VALUES (?, ?, ?, ?, ?, 1, ?)`,
    [id, dateStr, mood, cravingLevel, encryptedGratitude, now.toISOString()]
  );

  return {
    id,
    date: now,
    mood,
    cravingLevel,
    gratitude: encryptedGratitude || undefined,
    isCheckedIn: true,
    createdAt: now,
  };
}

export async function getTodayCheckin(): Promise<DailyCheckin | null> {
  const db = await getDatabase();
  const today = new Date().toISOString().split('T')[0];
  
  const row = await db.getFirstAsync<DbDailyCheckin>(
    'SELECT * FROM daily_checkins WHERE date = ?',
    [today]
  );

  if (!row) return null;

  return {
    id: row.id,
    date: new Date(row.date),
    mood: row.mood,
    cravingLevel: row.craving_level,
    gratitude: row.gratitude || undefined,
    isCheckedIn: row.is_checked_in === 1,
    createdAt: new Date(row.created_at),
  };
}

export async function getCheckinHistory(days = 30): Promise<DailyCheckin[]> {
  const db = await getDatabase();
  const startDate = new Date();
  startDate.setDate(startDate.getDate() - days);

  const rows = await db.getAllAsync<DbDailyCheckin>(
    'SELECT * FROM daily_checkins WHERE date >= ? ORDER BY date DESC',
    [startDate.toISOString().split('T')[0]]
  );

  return rows.map((row) => ({
    id: row.id,
    date: new Date(row.date),
    mood: row.mood,
    cravingLevel: row.craving_level,
    gratitude: row.gratitude || undefined,
    isCheckedIn: row.is_checked_in === 1,
    createdAt: new Date(row.created_at),
  }));
}

// ============================================
// MILESTONES
// ============================================

export async function createMilestone(
  type: MilestoneType,
  title: string,
  achievedAt: Date,
  options?: {
    description?: string;
    reflection?: string;
    metadata?: Record<string, unknown>;
  }
): Promise<Milestone> {
  const db = await getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  // Encrypt reflection if provided
  const encryptedReflection = options?.reflection
    ? await encryptContent(options.reflection)
    : null;

  await db.runAsync(
    `INSERT INTO milestones (id, type, title, description, reflection, achieved_at, metadata, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      id,
      type,
      title,
      options?.description || null,
      encryptedReflection,
      achievedAt.toISOString(),
      JSON.stringify(options?.metadata || {}),
      now,
    ]
  );

  return {
    id,
    type,
    title,
    description: options?.description,
    reflection: encryptedReflection || undefined,
    achievedAt,
    metadata: options?.metadata || {},
    createdAt: new Date(now),
  };
}

export async function getMilestones(): Promise<Milestone[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DbMilestone>(
    'SELECT * FROM milestones ORDER BY achieved_at DESC'
  );

  return rows.map((row) => ({
    id: row.id,
    type: row.type as MilestoneType,
    title: row.title,
    description: row.description || undefined,
    reflection: row.reflection || undefined,
    achievedAt: new Date(row.achieved_at),
    metadata: JSON.parse(row.metadata || '{}'),
    createdAt: new Date(row.created_at),
  }));
}

// ============================================
// EMOTION TAGS
// ============================================

export async function getEmotionTags(): Promise<EmotionTag[]> {
  const db = await getDatabase();
  const rows = await db.getAllAsync<DbEmotionTag>(
    'SELECT * FROM emotion_tags ORDER BY name'
  );

  return rows.map((row) => ({
    id: row.id,
    name: row.name,
    color: row.color,
    isCustom: row.is_custom === 1,
    createdAt: new Date(row.created_at),
  }));
}

export async function createEmotionTag(
  name: string,
  color: string
): Promise<EmotionTag> {
  const db = await getDatabase();
  const id = uuidv4();
  const now = new Date().toISOString();

  await db.runAsync(
    `INSERT INTO emotion_tags (id, name, color, is_custom, created_at)
     VALUES (?, ?, ?, 1, ?)`,
    [id, name, color, now]
  );

  return {
    id,
    name,
    color,
    isCustom: true,
    createdAt: new Date(now),
  };
}

// ============================================
// APP SETTINGS
// ============================================

export async function getAppSettings(): Promise<AppSettings | null> {
  const db = await getDatabase();
  const row = await db.getFirstAsync<DbAppSettings>(
    'SELECT * FROM app_settings LIMIT 1'
  );

  if (!row) return null;

  return {
    id: row.id,
    checkInTime: row.check_in_time,
    autoLockMinutes: row.auto_lock_minutes,
    biometricEnabled: row.biometric_enabled === 1,
    themeMode: row.theme_mode as ThemeMode,
    notificationsEnabled: row.notifications_enabled === 1,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}

export async function createOrUpdateAppSettings(
  settings: Partial<Omit<AppSettings, 'id' | 'createdAt' | 'updatedAt'>>
): Promise<AppSettings> {
  const db = await getDatabase();
  const existing = await getAppSettings();
  const now = new Date().toISOString();

  if (existing) {
    await db.runAsync(
      `UPDATE app_settings SET
        check_in_time = ?,
        auto_lock_minutes = ?,
        biometric_enabled = ?,
        theme_mode = ?,
        notifications_enabled = ?,
        updated_at = ?
       WHERE id = ?`,
      [
        settings.checkInTime ?? existing.checkInTime,
        settings.autoLockMinutes ?? existing.autoLockMinutes,
        (settings.biometricEnabled ?? existing.biometricEnabled) ? 1 : 0,
        settings.themeMode ?? existing.themeMode,
        (settings.notificationsEnabled ?? existing.notificationsEnabled) ? 1 : 0,
        now,
        existing.id,
      ]
    );

    return {
      ...existing,
      ...settings,
      updatedAt: new Date(now),
    };
  } else {
    const id = uuidv4();
    await db.runAsync(
      `INSERT INTO app_settings (id, check_in_time, auto_lock_minutes, biometric_enabled, theme_mode, notifications_enabled, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        settings.checkInTime || '09:00',
        settings.autoLockMinutes ?? 5,
        settings.biometricEnabled !== false ? 1 : 0,
        settings.themeMode || 'system',
        settings.notificationsEnabled !== false ? 1 : 0,
        now,
        now,
      ]
    );

    return {
      id,
      checkInTime: settings.checkInTime || '09:00',
      autoLockMinutes: settings.autoLockMinutes ?? 5,
      biometricEnabled: settings.biometricEnabled !== false,
      themeMode: settings.themeMode || 'system',
      notificationsEnabled: settings.notificationsEnabled !== false,
      createdAt: new Date(now),
      updatedAt: new Date(now),
    };
  }
}


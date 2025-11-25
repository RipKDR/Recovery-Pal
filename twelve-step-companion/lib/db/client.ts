/**
 * SQLite Database Client
 * Handles database initialization and migrations
 */

import * as SQLite from 'expo-sqlite';

const DATABASE_NAME = 'recovery_companion.db';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Get the database instance
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (!db) {
    db = await SQLite.openDatabaseAsync(DATABASE_NAME);
  }
  return db;
}

/**
 * Initialize database with schema
 */
export async function initializeDatabase(): Promise<void> {
  const database = await getDatabase();

  // Create all tables
  await database.execAsync(`
    -- Sobriety Profile
    CREATE TABLE IF NOT EXISTS sobriety_profile (
      id TEXT PRIMARY KEY,
      sobriety_date TEXT NOT NULL,
      program_type TEXT NOT NULL,
      display_name TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Journal Entries
    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      content TEXT NOT NULL,
      mood_before INTEGER,
      mood_after INTEGER,
      craving_level INTEGER,
      emotion_tags TEXT,
      step_number INTEGER,
      meeting_id TEXT,
      audio_uri TEXT,
      audio_duration INTEGER,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (meeting_id) REFERENCES meeting_logs(id)
    );

    -- Daily Check-ins
    CREATE TABLE IF NOT EXISTS daily_checkins (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL UNIQUE,
      mood INTEGER NOT NULL,
      craving_level INTEGER NOT NULL,
      gratitude TEXT,
      is_checked_in INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- Milestones
    CREATE TABLE IF NOT EXISTS milestones (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      reflection TEXT,
      achieved_at TEXT NOT NULL,
      metadata TEXT,
      created_at TEXT NOT NULL
    );

    -- Meeting Logs
    CREATE TABLE IF NOT EXISTS meeting_logs (
      id TEXT PRIMARY KEY,
      name TEXT,
      location TEXT,
      type TEXT NOT NULL,
      mood_before INTEGER NOT NULL,
      mood_after INTEGER NOT NULL,
      key_takeaways TEXT NOT NULL,
      topic_tags TEXT,
      attended_at TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    -- Emotion Tags
    CREATE TABLE IF NOT EXISTS emotion_tags (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      color TEXT NOT NULL,
      is_custom INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL
    );

    -- App Settings
    CREATE TABLE IF NOT EXISTS app_settings (
      id TEXT PRIMARY KEY,
      check_in_time TEXT NOT NULL,
      auto_lock_minutes INTEGER NOT NULL DEFAULT 5,
      biometric_enabled INTEGER NOT NULL DEFAULT 1,
      theme_mode TEXT NOT NULL DEFAULT 'system',
      notifications_enabled INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Relapse Records
    CREATE TABLE IF NOT EXISTS relapse_records (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      what_happened TEXT,
      what_learned TEXT,
      previous_sober_days INTEGER NOT NULL,
      created_at TEXT NOT NULL
    );

    -- Time Capsules
    CREATE TABLE IF NOT EXISTS time_capsules (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      unlock_date TEXT NOT NULL,
      is_unlocked INTEGER NOT NULL DEFAULT 0,
      unlocked_at TEXT,
      created_at TEXT NOT NULL
    );

    -- Motivation Vault
    CREATE TABLE IF NOT EXISTS motivation_vault (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      title TEXT NOT NULL,
      content TEXT NOT NULL,
      media_uri TEXT,
      is_favorite INTEGER NOT NULL DEFAULT 0,
      view_count INTEGER NOT NULL DEFAULT 0,
      last_viewed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Scenario Practice Records
    CREATE TABLE IF NOT EXISTS scenario_practices (
      id TEXT PRIMARY KEY,
      scenario_id TEXT NOT NULL,
      selected_option_index INTEGER NOT NULL,
      reflection TEXT,
      completed_at TEXT NOT NULL
    );

    -- Indexes for performance
    CREATE INDEX IF NOT EXISTS idx_journal_created ON journal_entries(created_at);
    CREATE INDEX IF NOT EXISTS idx_journal_type ON journal_entries(type);
    CREATE INDEX IF NOT EXISTS idx_checkin_date ON daily_checkins(date);
    CREATE INDEX IF NOT EXISTS idx_milestone_achieved ON milestones(achieved_at);
    CREATE INDEX IF NOT EXISTS idx_capsule_unlock ON time_capsules(unlock_date);
    CREATE INDEX IF NOT EXISTS idx_vault_favorite ON motivation_vault(is_favorite);
    CREATE INDEX IF NOT EXISTS idx_vault_type ON motivation_vault(type);
    CREATE INDEX IF NOT EXISTS idx_scenario_completed ON scenario_practices(completed_at);
  `);

  // Run migrations for existing databases
  await runMigrations(database);
}

/**
 * Run database migrations for schema updates
 */
async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  // Check if audio columns exist, add if not
  try {
    await database.execAsync(`
      ALTER TABLE journal_entries ADD COLUMN audio_uri TEXT;
    `);
  } catch {
    // Column already exists
  }

  try {
    await database.execAsync(`
      ALTER TABLE journal_entries ADD COLUMN audio_duration INTEGER;
    `);
  } catch {
    // Column already exists
  }

  // Create time_capsules table if it doesn't exist (already in main schema)
  // This is just a safety check for existing databases
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS time_capsules (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        unlock_date TEXT NOT NULL,
        is_unlocked INTEGER NOT NULL DEFAULT 0,
        unlocked_at TEXT,
        created_at TEXT NOT NULL
      );
    `);
  } catch {
    // Table already exists
  }

  // Create motivation_vault table for existing databases
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS motivation_vault (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        content TEXT NOT NULL,
        media_uri TEXT,
        is_favorite INTEGER NOT NULL DEFAULT 0,
        view_count INTEGER NOT NULL DEFAULT 0,
        last_viewed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
    `);
  } catch {
    // Table already exists
  }

  // Create scenario_practices table for existing databases
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS scenario_practices (
        id TEXT PRIMARY KEY,
        scenario_id TEXT NOT NULL,
        selected_option_index INTEGER NOT NULL,
        reflection TEXT,
        completed_at TEXT NOT NULL
      );
    `);
  } catch {
    // Table already exists
  }
}

/**
 * Close database connection
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

/**
 * Clear all data (for testing or account reset)
 * WARNING: This deletes all user data
 */
export async function clearAllData(): Promise<void> {
  const database = await getDatabase();
  
  await database.execAsync(`
    DELETE FROM journal_entries;
    DELETE FROM daily_checkins;
    DELETE FROM milestones;
    DELETE FROM meeting_logs;
    DELETE FROM emotion_tags;
    DELETE FROM relapse_records;
    DELETE FROM sobriety_profile;
    DELETE FROM app_settings;
    DELETE FROM time_capsules;
    DELETE FROM motivation_vault;
    DELETE FROM scenario_practices;
  `);
}


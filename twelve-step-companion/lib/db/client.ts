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
      created_at TEXT NOT NULL,
      -- Enhanced fields (Phase 2)
      what_i_learned TEXT,
      quote_heard TEXT,
      connections_mode TEXT,
      connection_notes TEXT,
      did_share INTEGER DEFAULT 0,
      share_reflection TEXT,
      regular_meeting_id TEXT
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
      crisis_region TEXT NOT NULL DEFAULT 'US',
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

    -- V2 Tables --

    -- Recovery Contacts
    CREATE TABLE IF NOT EXISTS recovery_contacts (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      phone TEXT NOT NULL,
      role TEXT NOT NULL,
      notes TEXT,
      last_contacted_at TEXT,
      created_at TEXT NOT NULL
    );

    -- Regular Meetings (recurring schedule)
    CREATE TABLE IF NOT EXISTS regular_meetings (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      location TEXT,
      day_of_week INTEGER NOT NULL,
      time TEXT NOT NULL,
      type TEXT NOT NULL,
      is_home_group INTEGER NOT NULL DEFAULT 0,
      reminder_enabled INTEGER NOT NULL DEFAULT 1,
      reminder_minutes_before INTEGER NOT NULL DEFAULT 60,
      notes TEXT,
      created_at TEXT NOT NULL
    );

    -- Achievements
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      category TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      icon TEXT NOT NULL,
      unlock_type TEXT NOT NULL,
      target INTEGER,
      current INTEGER,
      status TEXT NOT NULL DEFAULT 'locked',
      unlocked_at TEXT,
      requires_days_clean INTEGER,
      requires_achievements TEXT,
      reflection TEXT
    );

    -- Daily Reading Reflections
    CREATE TABLE IF NOT EXISTS daily_reading_reflections (
      id TEXT PRIMARY KEY,
      reading_date TEXT NOT NULL,
      reflection TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    -- Fourth Step Inventory
    CREATE TABLE IF NOT EXISTS fourth_step_inventory (
      id TEXT PRIMARY KEY,
      type TEXT NOT NULL,
      who TEXT NOT NULL,
      cause TEXT NOT NULL,
      affects TEXT NOT NULL,
      my_part TEXT,
      created_at TEXT NOT NULL
    );

    -- Amends List (8th/9th Step)
    CREATE TABLE IF NOT EXISTS amends_list (
      id TEXT PRIMARY KEY,
      person TEXT NOT NULL,
      harm TEXT NOT NULL,
      amends_type TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'not_willing',
      notes TEXT,
      made_at TEXT,
      created_at TEXT NOT NULL
    );

    -- Phone Call Logs
    CREATE TABLE IF NOT EXISTS phone_call_logs (
      id TEXT PRIMARY KEY,
      contact_id TEXT NOT NULL,
      contact_name TEXT NOT NULL,
      duration INTEGER,
      notes TEXT,
      called_at TEXT NOT NULL,
      FOREIGN KEY (contact_id) REFERENCES recovery_contacts(id)
    );

    -- Gratitude Entries
    CREATE TABLE IF NOT EXISTS gratitude_entries (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      items TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    -- Tenth Step Reviews
    CREATE TABLE IF NOT EXISTS tenth_step_reviews (
      id TEXT PRIMARY KEY,
      date TEXT NOT NULL,
      was_resentful TEXT,
      was_selfish TEXT,
      was_dishonest TEXT,
      was_afraid TEXT,
      owe_apology TEXT,
      could_do_better TEXT,
      grateful_for TEXT,
      created_at TEXT NOT NULL
    );

    -- Literature Progress
    CREATE TABLE IF NOT EXISTS literature_progress (
      id TEXT PRIMARY KEY,
      book_id TEXT NOT NULL,
      chapter_id TEXT NOT NULL,
      is_completed INTEGER NOT NULL DEFAULT 0,
      notes TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL
    );

    -- Step Progress
    CREATE TABLE IF NOT EXISTS step_progress (
      id TEXT PRIMARY KEY,
      step_number INTEGER NOT NULL,
      questions_answered INTEGER NOT NULL DEFAULT 0,
      total_questions INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'locked',
      started_at TEXT,
      completed_at TEXT,
      discussed_at TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    -- Step Answers
    CREATE TABLE IF NOT EXISTS step_answers (
      id TEXT PRIMARY KEY,
      step_number INTEGER NOT NULL,
      question_index INTEGER NOT NULL,
      answer TEXT NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
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

    -- V2 Indexes
    CREATE INDEX IF NOT EXISTS idx_contacts_role ON recovery_contacts(role);
    CREATE INDEX IF NOT EXISTS idx_regular_meetings_day ON regular_meetings(day_of_week);
    CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
    CREATE INDEX IF NOT EXISTS idx_achievements_status ON achievements(status);
    CREATE INDEX IF NOT EXISTS idx_reading_reflections_date ON daily_reading_reflections(reading_date);
    CREATE INDEX IF NOT EXISTS idx_4th_step_type ON fourth_step_inventory(type);
    CREATE INDEX IF NOT EXISTS idx_amends_status ON amends_list(status);
    CREATE INDEX IF NOT EXISTS idx_phone_logs_called ON phone_call_logs(called_at);
    CREATE INDEX IF NOT EXISTS idx_gratitude_date ON gratitude_entries(date);
    CREATE INDEX IF NOT EXISTS idx_10th_step_date ON tenth_step_reviews(date);
    CREATE INDEX IF NOT EXISTS idx_literature_book ON literature_progress(book_id);
    CREATE INDEX IF NOT EXISTS idx_step_progress_number ON step_progress(step_number);
    CREATE INDEX IF NOT EXISTS idx_step_answers_step ON step_answers(step_number);
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

  // Add crisis_region column for existing databases
  try {
    await database.execAsync(`
      ALTER TABLE app_settings ADD COLUMN crisis_region TEXT NOT NULL DEFAULT 'US';
    `);
  } catch {
    // Column already exists
  }

  // Phase 2: Enhanced meeting_logs columns
  await addEnhancedMeetingColumns(database);

  // V2 Tables - Create for existing databases
  await createV2Tables(database);
}

/**
 * Add enhanced meeting_logs columns for Phase 2
 */
async function addEnhancedMeetingColumns(database: SQLite.SQLiteDatabase): Promise<void> {
  const columnsToAdd = [
    { name: 'what_i_learned', type: 'TEXT' },
    { name: 'quote_heard', type: 'TEXT' },
    { name: 'connections_mode', type: 'TEXT' },
    { name: 'connection_notes', type: 'TEXT' },
    { name: 'did_share', type: 'INTEGER DEFAULT 0' },
    { name: 'share_reflection', type: 'TEXT' },
    { name: 'regular_meeting_id', type: 'TEXT' },
  ];

  for (const column of columnsToAdd) {
    try {
      await database.execAsync(
        `ALTER TABLE meeting_logs ADD COLUMN ${column.name} ${column.type};`
      );
    } catch {
      // Column already exists
    }
  }
}

/**
 * Create V2 tables for existing databases
 */
async function createV2Tables(database: SQLite.SQLiteDatabase): Promise<void> {
  // Recovery Contacts
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS recovery_contacts (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        role TEXT NOT NULL,
        notes TEXT,
        last_contacted_at TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_contacts_role ON recovery_contacts(role);
    `);
  } catch {
    // Table already exists
  }

  // Regular Meetings
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS regular_meetings (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        location TEXT,
        day_of_week INTEGER NOT NULL,
        time TEXT NOT NULL,
        type TEXT NOT NULL,
        is_home_group INTEGER NOT NULL DEFAULT 0,
        reminder_enabled INTEGER NOT NULL DEFAULT 1,
        reminder_minutes_before INTEGER NOT NULL DEFAULT 60,
        notes TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_regular_meetings_day ON regular_meetings(day_of_week);
    `);
  } catch {
    // Table already exists
  }

  // Achievements
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS achievements (
        id TEXT PRIMARY KEY,
        category TEXT NOT NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        icon TEXT NOT NULL,
        unlock_type TEXT NOT NULL,
        target INTEGER,
        current INTEGER,
        status TEXT NOT NULL DEFAULT 'locked',
        unlocked_at TEXT,
        requires_days_clean INTEGER,
        requires_achievements TEXT,
        reflection TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_achievements_category ON achievements(category);
      CREATE INDEX IF NOT EXISTS idx_achievements_status ON achievements(status);
    `);
  } catch {
    // Table already exists
  }

  // Daily Reading Reflections
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS daily_reading_reflections (
        id TEXT PRIMARY KEY,
        reading_date TEXT NOT NULL,
        reflection TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_reading_reflections_date ON daily_reading_reflections(reading_date);
    `);
  } catch {
    // Table already exists
  }

  // Fourth Step Inventory
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS fourth_step_inventory (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        who TEXT NOT NULL,
        cause TEXT NOT NULL,
        affects TEXT NOT NULL,
        my_part TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_4th_step_type ON fourth_step_inventory(type);
    `);
  } catch {
    // Table already exists
  }

  // Amends List
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS amends_list (
        id TEXT PRIMARY KEY,
        person TEXT NOT NULL,
        harm TEXT NOT NULL,
        amends_type TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'not_willing',
        notes TEXT,
        made_at TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_amends_status ON amends_list(status);
    `);
  } catch {
    // Table already exists
  }

  // Phone Call Logs
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS phone_call_logs (
        id TEXT PRIMARY KEY,
        contact_id TEXT NOT NULL,
        contact_name TEXT NOT NULL,
        duration INTEGER,
        notes TEXT,
        called_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_phone_logs_called ON phone_call_logs(called_at);
    `);
  } catch {
    // Table already exists
  }

  // Gratitude Entries
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS gratitude_entries (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        items TEXT NOT NULL,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_gratitude_date ON gratitude_entries(date);
    `);
  } catch {
    // Table already exists
  }

  // Tenth Step Reviews
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS tenth_step_reviews (
        id TEXT PRIMARY KEY,
        date TEXT NOT NULL,
        was_resentful TEXT,
        was_selfish TEXT,
        was_dishonest TEXT,
        was_afraid TEXT,
        owe_apology TEXT,
        could_do_better TEXT,
        grateful_for TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_10th_step_date ON tenth_step_reviews(date);
    `);
  } catch {
    // Table already exists
  }

  // Literature Progress
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS literature_progress (
        id TEXT PRIMARY KEY,
        book_id TEXT NOT NULL,
        chapter_id TEXT NOT NULL,
        is_completed INTEGER NOT NULL DEFAULT 0,
        notes TEXT,
        completed_at TEXT,
        created_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_literature_book ON literature_progress(book_id);
    `);
  } catch {
    // Table already exists
  }

  // Step Progress
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS step_progress (
        id TEXT PRIMARY KEY,
        step_number INTEGER NOT NULL,
        questions_answered INTEGER NOT NULL DEFAULT 0,
        total_questions INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'locked',
        started_at TEXT,
        completed_at TEXT,
        discussed_at TEXT,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_step_progress_number ON step_progress(step_number);
    `);
  } catch {
    // Table already exists
  }

  // Step Answers
  try {
    await database.execAsync(`
      CREATE TABLE IF NOT EXISTS step_answers (
        id TEXT PRIMARY KEY,
        step_number INTEGER NOT NULL,
        question_index INTEGER NOT NULL,
        answer TEXT NOT NULL,
        created_at TEXT NOT NULL,
        updated_at TEXT NOT NULL
      );
      CREATE INDEX IF NOT EXISTS idx_step_answers_step ON step_answers(step_number);
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
    DELETE FROM recovery_contacts;
    DELETE FROM regular_meetings;
    DELETE FROM achievements;
    DELETE FROM daily_reading_reflections;
    DELETE FROM fourth_step_inventory;
    DELETE FROM amends_list;
    DELETE FROM phone_call_logs;
    DELETE FROM gratitude_entries;
    DELETE FROM tenth_step_reviews;
    DELETE FROM literature_progress;
    DELETE FROM step_progress;
    DELETE FROM step_answers;
  `);
}


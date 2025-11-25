# 12-Step Recovery Companion — React Native Native App Build
## BMAD (Before Making Any Decisions) Meta-Prompt for Cursor Pro + Claude Code

---

## CONTEXT BRIEFING

**Project:** Privacy-first 12-step recovery companion mobile app  
**Target:** Android (Google Play Store) — iOS-ready architecture  
**Builder:** Cursor Pro with Claude Code integration  
**Source Spec:** PDF feature document (attached) — 20+ innovative features across 5 categories  
**Privacy Model:** ALL sensitive data encrypted and stored on-device only. Zero server telemetry.

**Your Role:** You are a senior mobile architect specializing in privacy-first mental health applications. You will build a production-grade React Native (Expo) application that serves as a 12-step recovery companion. This is a greenfield build — no legacy code to port.

---

## PHASE 0: BEFORE MAKING ANY DECISIONS

**STOP. Do not write ANY implementation code until this phase is complete.**

### 0.1 Architecture Discovery

Before any code, output a structured document answering:

1. **Screen Inventory (MVP scope)**
   - List maximum 8-10 screens for MVP
   - Define each screen's purpose, inputs, outputs
   - Map navigation flow (which screens connect to which)

2. **Data Model Design**
   - Define all entities and their relationships
   - Identify which fields require encryption
   - Document primary keys and indexes

3. **Privacy Boundary Map**
   - What data NEVER leaves the device?
   - What data could optionally sync (with explicit consent)?
   - Where are encryption boundaries?

4. **Native Module Audit**
   - Which features require native code vs. pure JS?
   - Any Expo modules that need prebuild?
   - Verify all dependencies support New Architecture

5. **Feature Prioritization Matrix**
   - P0 (MVP Launch): Must ship
   - P1 (v1.1): High value, ship within 30 days
   - P2 (v1.2): Important, 60-day horizon
   - P3 (Backlog): Future consideration

### 0.2 Tech Stack (LOCKED — Do Not Deviate)

```yaml
Framework: React Native 0.76+ via Expo SDK 53
Language: TypeScript (strict mode, no any)
Runtime: New Architecture enabled (default in SDK 53)
Navigation: expo-router v4 (file-based routing)
State Management: Zustand (lightweight, no boilerplate)
Async State: TanStack Query v5 (React Query)
Database: expo-sqlite with SQLCipher encryption
ORM: Drizzle ORM (type-safe, generates migrations)
Secure Storage: expo-secure-store (biometric-protected keys)
Auth: Local biometric only (expo-local-authentication)
UI Framework: NativeWind v4 (TailwindCSS for RN) OR Tamagui
Icons: lucide-react-native
Notifications: expo-notifications (local only)
Audio: expo-av (voice journals)
Build: EAS Build (cloud)
```

### 0.3 Project Scaffold

```bash
# Initialize with Expo SDK 53
npx create-expo-app@latest twelve-step-companion -t tabs
cd twelve-step-companion

# Core dependencies
npx expo install expo-router expo-secure-store expo-sqlite expo-local-authentication expo-notifications expo-av expo-crypto

# State & data layer
npm install zustand @tanstack/react-query drizzle-orm
npm install -D drizzle-kit

# UI layer (choose one)
npm install nativewind tailwindcss
# OR
npm install tamagui @tamagui/config

# Dev tools
npm install -D @types/react @typescript-eslint/eslint-plugin
```

### 0.4 Directory Architecture

```
/app                          # expo-router file-based routing
  /_layout.tsx                # Root layout (providers, auth gate)
  /(auth)                     
    /lock.tsx                 # Biometric lock screen
    /onboarding.tsx           # First-time setup
  /(tabs)                     
    /_layout.tsx              # Tab navigator config
    /index.tsx                # Dashboard/Home
    /journal/
      /index.tsx              # Journal list
      /[id].tsx               # Single entry view
      /new.tsx                # Create entry
    /progress.tsx             # Milestones & achievements
    /tools.tsx                # Recovery toolkit
  /step-work/
    /[step].tsx               # Dynamic step work pages (1-12)
  /settings.tsx               # App settings
  
/src
  /db
    /schema.ts                # Drizzle schema definitions
    /migrations/              # Generated migrations
    /client.ts                # Database initialization with SQLCipher
  /stores
    /auth.store.ts            # Biometric state
    /journal.store.ts         # Journal CRUD
    /progress.store.ts        # Milestones, streaks
    /settings.store.ts        # User preferences
  /hooks
    /useEncryption.ts         # Encryption utilities
    /useBiometric.ts          # Auth flow
    /useJournal.ts            # Journal operations
  /components
    /ui/                      # Design system primitives
    /journal/                 # Journal-specific
    /progress/                # Charts, timeline
    /shared/                  # Reusable patterns
  /lib
    /encryption.ts            # Crypto operations
    /prompts.ts               # Journaling prompts by step
    /constants.ts             # App constants
  /types
    /index.ts                 # Shared TypeScript types

/assets
  /fonts/
  /images/
```

---

## PHASE 1: CORE INFRASTRUCTURE

### 1.1 Database Setup with SQLCipher Encryption

**Critical:** All journal content, mood data, and personal notes must be encrypted at rest.

```typescript
// src/db/client.ts
import * as SQLite from 'expo-sqlite';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import { drizzle } from 'drizzle-orm/expo-sqlite';
import * as schema from './schema';

const DB_NAME = 'recovery_companion.db';
const KEY_ALIAS = 'db_encryption_key';

async function getOrCreateEncryptionKey(): Promise<string> {
  let key = await SecureStore.getItemAsync(KEY_ALIAS, {
    requireAuthentication: true, // Biometric required to access key
  });
  
  if (!key) {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    key = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    await SecureStore.setItemAsync(KEY_ALIAS, key, {
      requireAuthentication: true,
      keychainAccessible: SecureStore.AFTER_FIRST_UNLOCK,
    });
  }
  
  return key;
}

export async function initDatabase() {
  const encryptionKey = await getOrCreateEncryptionKey();
  
  const sqlite = SQLite.openDatabaseSync(DB_NAME);
  
  // Enable SQLCipher encryption
  sqlite.execSync(`PRAGMA key = '${encryptionKey}'`);
  sqlite.execSync('PRAGMA cipher_compatibility = 4');
  
  return drizzle(sqlite, { schema });
}
```

**app.json addition for SQLCipher:**
```json
{
  "expo": {
    "plugins": [
      ["expo-sqlite", { "useSQLCipher": true }]
    ]
  }
}
```

### 1.2 Data Schema (Drizzle ORM)

```typescript
// src/db/schema.ts
import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';

export const profiles = sqliteTable('profiles', {
  id: text('id').primaryKey(),
  sobrietyDate: integer('sobriety_date', { mode: 'timestamp' }).notNull(),
  programType: text('program_type', { 
    enum: ['aa', 'na', 'smart', 'refuge', 'custom'] 
  }).notNull(),
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const journalEntries = sqliteTable('journal_entries', {
  id: text('id').primaryKey(),
  type: text('type', { 
    enum: ['freeform', 'step_work', 'meeting_reflection', 'daily_checkin', 'gratitude'] 
  }).notNull(),
  content: text('content').notNull(), // Already encrypted by SQLCipher
  moodBefore: integer('mood_before'), // 1-10
  moodAfter: integer('mood_after'),
  cravingLevel: integer('craving_level'), // 0-10
  stepNumber: integer('step_number'), // 1-12 if step_work
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
  updatedAt: integer('updated_at', { mode: 'timestamp' }).notNull(),
});

export const emotionTags = sqliteTable('emotion_tags', {
  id: text('id').primaryKey(),
  entryId: text('entry_id').references(() => journalEntries.id),
  tag: text('tag').notNull(),
});

export const milestones = sqliteTable('milestones', {
  id: text('id').primaryKey(),
  type: text('type', { 
    enum: ['time_based', 'step_completion', 'personal', 'meeting_count'] 
  }).notNull(),
  title: text('title').notNull(),
  reflection: text('reflection'),
  achievedAt: integer('achieved_at', { mode: 'timestamp' }).notNull(),
  daysAtAchievement: integer('days_at_achievement'),
});

export const dailyCheckins = sqliteTable('daily_checkins', {
  id: text('id').primaryKey(),
  date: text('date').notNull().unique(), // YYYY-MM-DD format
  mood: integer('mood').notNull(), // 1-10
  cravingLevel: integer('craving_level').notNull(), // 0-10
  gratitude: text('gratitude'),
  completedAt: integer('completed_at', { mode: 'timestamp' }).notNull(),
});

export const meetingLogs = sqliteTable('meeting_logs', {
  id: text('id').primaryKey(),
  name: text('name'),
  location: text('location'),
  meetingType: text('meeting_type', { enum: ['in_person', 'online', 'hybrid'] }),
  moodBefore: integer('mood_before').notNull(),
  moodAfter: integer('mood_after').notNull(),
  keyTakeaways: text('key_takeaways'),
  attendedAt: integer('attended_at', { mode: 'timestamp' }).notNull(),
});

export const meetingTopics = sqliteTable('meeting_topics', {
  id: text('id').primaryKey(),
  meetingId: text('meeting_id').references(() => meetingLogs.id),
  topic: text('topic').notNull(),
});

export const motivationVault = sqliteTable('motivation_vault', {
  id: text('id').primaryKey(),
  type: text('type', { 
    enum: ['letter', 'photo', 'audio', 'reason', 'quote'] 
  }).notNull(),
  title: text('title').notNull(),
  content: text('content'), // Text content or file path
  createdAt: integer('created_at', { mode: 'timestamp' }).notNull(),
});

export const relapseRecords = sqliteTable('relapse_records', {
  id: text('id').primaryKey(),
  occurredAt: integer('occurred_at', { mode: 'timestamp' }).notNull(),
  daysBeforeRelapse: integer('days_before_relapse').notNull(),
  triggers: text('triggers'), // JSON array
  reflection: text('reflection'),
  lessonsLearned: text('lessons_learned'),
  recoveryPlan: text('recovery_plan'),
});
```

### 1.3 Biometric Authentication Gate

```typescript
// app/_layout.tsx
import { useEffect, useState } from 'react';
import { Stack, useRouter, useSegments } from 'expo-router';
import * as LocalAuthentication from 'expo-local-authentication';
import { useAuthStore } from '@/stores/auth.store';

export default function RootLayout() {
  const { isAuthenticated, setAuthenticated } = useAuthStore();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    const inAuthGroup = segments[0] === '(auth)';
    
    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/lock');
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, segments]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(auth)" />
      <Stack.Screen name="(tabs)" />
    </Stack>
  );
}
```

---

## PHASE 2: MVP FEATURES (P0)

Build these **in order**. Each must be fully functional before proceeding.

### 2.1 Lock Screen & Authentication
- Biometric prompt on app open
- PIN/password fallback
- Auto-lock after 5 minutes in background
- "Emergency unlock" with extended timeout for crisis moments

### 2.2 Onboarding Flow
- Welcome screen (privacy commitment)
- Sobriety date picker (or "Just for Today" mode)
- Program type selection (AA, NA, SMART, etc.)
- Daily check-in time preference
- Notification permissions request
- **NO account creation — everything local**

### 2.3 Dashboard (Home Tab)
- Large, prominent sobriety counter
  - Days/hours/minutes toggle
  - "Progress not perfection" subtitle showing total days ever sober
- Today's check-in card (mood + craving quick-log)
- "How are you feeling?" → quick journal entry
- Next milestone preview
- Meeting streak indicator

### 2.4 Core Journaling
- Freeform text entry with auto-save
- Emotion tag picker (predefined + custom)
- Mood slider (1-10) with emoji indicators
- Craving level slider (0-10)
- Entry list with:
  - Search by keyword
  - Filter by emotion tag
  - Filter by date range
  - Filter by entry type
- Edit and delete with confirmation

### 2.5 Sobriety Tracking (Progress Tab)
- Visual recovery timeline (scrollable)
- Total days counter (persistent across relapses)
- Longest streak (personal record)
- Current streak
- "Progress Not Perfection" metrics:
  - % sober days over last 30/90/365 days
  - Total meetings attended
  - Journal entries written
- **Relapse logging with compassionate flow:**
  - "What happened?" (optional)
  - "What did you learn?"
  - "What's your plan for today?"
  - Previous achievements preserved and celebrated

### 2.6 Daily Check-In Ritual
- Push notification at user-set time
- Quick flow: Mood → Craving → Gratitude (optional)
- < 60 seconds to complete
- Calendar view showing check-in history
- Trend visualization (mood over time)
- Streak counter (but not punitive)

---

## PHASE 3: ENHANCED FEATURES (P1)

### 3.1 Advanced Journaling
- **Step Work Modules** (guided prompts for each of the 12 steps)
  - Step 1: Powerlessness reflection
  - Step 4: Personal inventory template (resentments, fears, harms)
  - Step 8: Amends list builder
  - Step 10: Daily inventory quick-log
- **Voice Journal** (expo-av)
  - Record audio entries
  - Playback with timestamp markers
  - Optional transcription (on-device if possible)
- **Time Capsule**
  - Write letter to future self
  - Set unlock date (e.g., 1-year anniversary)
  - Notification when capsule "opens"
- **Reflection Prompts**
  - "Look back at what you wrote 30 days ago"
  - Add commentary to past entries

### 3.2 Meeting Tracker
- Log meeting with:
  - Before/after mood comparison
  - Key takeaways field
  - Topic tags
- Meeting insights:
  - "Your mood improves X% after meetings"
  - "You've attended X meetings this month"
  - "Best meetings for mood: [tag]"
- Gentle reminder if no meeting in X days

### 3.3 Milestone Celebrations
- Time-based milestones with guided reflection:
  - 24 hours, 1 week, 30/60/90 days, 6 months, 1 year, etc.
  - "Write about how life has changed"
  - "What are you most proud of?"
- Custom achievement creation
- "Beyond sobriety" achievements:
  - "Reached out instead of isolating"
  - "Chaired a meeting"
  - "Made an amends"
  - "Helped a newcomer"
- Visual recovery timeline (interactive, tap to see entries)

### 3.4 Emotion Intelligence (On-Device)
- Pattern detection in journal entries:
  - "You mention 'anxious' more on Mondays"
  - "Gratitude entries correlate with higher mood"
- Weekly Recovery Report (auto-generated):
  - Days sober
  - Meetings attended
  - Journal entries written
  - Top emotion tags
  - Mood trend visualization
  - Encouragement based on progress

---

## PHASE 4: ADVANCED FEATURES (P2/P3)

### 4.1 Personal Motivation Vault (P2)
- Extra biometric layer for access
- Store: letters to self, photos, audio messages, reasons for sobriety
- Surfaced during high-craving moments
- "Add to vault" from any emotional moment

### 4.2 Trigger Scenario Simulator (P2)
- Choose-your-own-adventure scenarios
- Evidence-based coping strategies
- "Play the tape forward" exercises
- Track practiced scenarios as achievements

### 4.3 AI Recovery Companion (P3)
- On-device LLM if feasible
- OR: Optional cloud API with explicit E2E encryption consent
- Features:
  - Conversational support
  - Pattern insights from journal data
  - Step work guidance
  - Proactive check-ins

### 4.4 Recovery Buddy System (P3)
- Optional, privacy-conscious accountability
- Paired with sponsor/friend
- Minimal data: "checked in today" signal only
- No content sharing
- Celebrate milestones together

---

## CRITICAL REQUIREMENTS

### Privacy Non-Negotiables
- [ ] All journal content encrypted via SQLCipher
- [ ] Encryption key protected by biometrics (expo-secure-store)
- [ ] No server-side storage of ANY user content
- [ ] No analytics without explicit consent
- [ ] No required account creation
- [ ] Full offline functionality
- [ ] Data export capability (user owns their data)
- [ ] Complete data deletion option

### UX Anti-Patterns to Avoid
- ❌ Shame-based messaging after relapse
- ❌ "Streak lost" punitive UI
- ❌ Required social features
- ❌ Aggressive notification nagging
- ❌ Gamification that trivializes recovery
- ❌ Generic motivational quotes over personal content
- ❌ Comparison to other users

### UX Patterns to Embrace
- ✅ "Progress not perfection" messaging
- ✅ Celebrate total sober days (not just current streak)
- ✅ Compassionate relapse handling
- ✅ Personal motivation over generic content
- ✅ User controls notification frequency
- ✅ Meaningful achievements (not badges)
- ✅ Reflection over gamification

### Performance Targets
- App launch to usable: < 2 seconds
- Journal entry save: < 100ms
- Search 1000+ entries: < 500ms
- Bundle size: < 50MB
- Offline-first (all features work without internet)

---

## BUILD WORKFLOW

### For Cursor Pro

```
Step 1: "Complete PHASE 0 — output the architecture document"
Step 2: "Scaffold project structure per PHASE 1"
Step 3: "Implement database with SQLCipher encryption"
Step 4: "Build biometric lock screen"
Step 5: "Create onboarding flow"
Step 6: "Build dashboard with sobriety counter"
Step 7: "Implement core journaling"
Step 8: "Build daily check-in flow"
Step 9: "Add progress tracking with resilience metrics"
... continue sequentially through phases
```

### Testing Requirements
- Unit tests for all encryption utilities
- Integration tests for database operations
- E2E tests for critical flows (onboarding, journaling, relapse handling)
- Privacy audit before each release
- Accessibility testing (TalkBack support)

### Pre-Launch Checklist
- [ ] All data encrypted at rest (SQLCipher verified)
- [ ] Biometric lock functional
- [ ] Offline mode fully tested
- [ ] No network calls without consent
- [ ] App store metadata prepared
- [ ] Privacy policy written
- [ ] Accessibility audit passed (WCAG AA)
- [ ] Performance benchmarks met
- [ ] EAS Build successful for Android

---

## SUCCESS CRITERIA

MVP is COMPLETE when a user can:

1. ✅ Set up the app with sobriety date (no account required)
2. ✅ Be protected by biometric lock
3. ✅ Write encrypted journal entries with emotion tags
4. ✅ Complete daily check-ins (mood/craving/gratitude)
5. ✅ See sobriety counter with "progress not perfection" metrics
6. ✅ Log a relapse with compassionate, growth-focused flow
7. ✅ View their recovery timeline with milestones
8. ✅ Use the app completely offline
9. ✅ Export or delete their data at any time

---

## REFERENCE: FEATURE SPEC FROM PDF

The attached PDF contains 20+ innovative features across these categories:

1. **Journaling Innovations**
   - Guided/adaptive prompts by recovery stage
   - Emotion tagging with on-device sentiment analysis
   - Integrated 12-step work journals
   - Multi-modal (text, voice, art)
   - Reflection timeline and time capsules

2. **Advanced Meeting Tracker**
   - Meeting reflection log with takeaways
   - Mood before/after comparison
   - Topic tagging system
   - Attendance trends and gentle reminders

3. **Achievement & Milestone Depth**
   - Meaningful reflections (not just badges)
   - Personal achievements beyond sobriety days
   - "Progress not perfection" resilience metrics
   - Visual recovery timeline

4. **Retention & Emotional Continuity**
   - Daily check-in ritual
   - Weekly/monthly recovery reports
   - Relapse response with safe reset
   - Personal motivation vault
   - Recovery buddy check-in system

5. **Unique Companion Tools**
   - AI-powered recovery assistant
   - Interactive trigger scenario simulator
   - Dynamic step-by-step guide
   - Emotional intelligence feedback system
   - Privacy-first social sharing

**Prioritize P0/P1 features for MVP. P2/P3 are post-launch.**

---

## FIRST COMMAND

Execute PHASE 0 now. Output the complete architecture document including:
1. Screen inventory with navigation map
2. Data model ERD (text representation)
3. Feature prioritization matrix
4. Privacy boundary documentation
5. Native module requirements

**Do not proceed to implementation until this document is reviewed and approved.**

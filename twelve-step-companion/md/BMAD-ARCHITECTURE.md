# 12-Step Recovery Companion — BMAD Architecture Document

## Phase 0: Before Making Any Decisions

**Document Version:** 1.0  
**Date:** November 24, 2025  
**Status:** AWAITING APPROVAL

---

## 0.1 Architecture Analysis

### Screen Inventory (MVP: 8 Screens)

#### 1. Lock Screen (`/lock`)
**Purpose:** Biometric/PIN gate for app access  
**Wireframe Description:**
- Full-screen overlay with app logo centered
- Biometric prompt (fingerprint/face icon)
- "Unlock" button
- Fallback link: "Use PIN instead"
- Background: Subtle gradient, calming colors

#### 2. Onboarding Flow (`/onboarding/[step]`)
**Purpose:** First-time user setup  
**Steps:**
- **Step 1 - Welcome:** App introduction, privacy commitment
- **Step 2 - Recovery Date:** Date picker for sobriety date OR "Just for today" toggle
- **Step 3 - Program Type:** Selection cards (AA, NA, SMART, Custom)
- **Step 4 - Notifications:** Set daily check-in time, notification preferences

**Wireframe Description:**
- Progress dots at top
- Large, clear headings
- Single-focus per screen
- "Continue" button at bottom
- "Skip" option where appropriate

#### 3. Dashboard/Home (`/(tabs)/index`)
**Purpose:** Recovery at-a-glance  
**Wireframe Description:**
- **Header:** Greeting ("Good morning, [Name]")
- **Sobriety Counter:** Large, prominent display
  - Days counter (primary)
  - Hours/minutes toggle option
  - Circular progress visualization
- **Today's Check-in Card:** Quick mood/craving capture
  - "How are you feeling?" prompt
  - One-tap emotion buttons
  - Craving level indicator
- **Quick Journal Entry:** "What's on your mind?" input
- **Next Milestone:** Preview card with countdown
- **Recent Insights:** AI-generated pattern observation (P2)

#### 4. Journal Hub (`/(tabs)/journal`)
**Purpose:** All journaling activities  
**Wireframe Description:**
- **Tab Navigation:** All | Daily | Step Work | Reflections
- **Entry List:** Scrollable timeline view
  - Entry card: Date, excerpt, mood indicator, emotion tags
  - Search bar with filter options
- **FAB (Floating Action Button):** New entry
- **Empty State:** Encouraging prompt to start journaling

#### 5. Journal Entry (`/journal/[id]`)
**Purpose:** Create/view/edit journal entries  
**Wireframe Description:**
- **Type Selector:** Freeform | Step Work | Meeting Reflection | Daily Check-in
- **Text Editor:** Full-screen, distraction-free
- **Mood Slider:** Before/after (1-10)
- **Craving Slider:** 0-10 scale
- **Emotion Tags:** Pill-style selector (happy, anxious, grateful, etc.)
- **Save Button:** Prominent, top-right
- **Voice Recording Button (P1):** Microphone icon

#### 6. Progress/Milestones (`/(tabs)/progress`)
**Purpose:** Track achievements and visualize journey  
**Wireframe Description:**
- **Timeline View:** Visual journey with milestones
  - Time-based milestones (1 day, 1 week, 30 days, 90 days, etc.)
  - Custom achievements
  - Step completions
- **Statistics Cards:**
  - Current streak
  - Total sober days
  - % sober last 30/90/365 days
  - Longest streak
- **Mood Trends:** Line graph over time
- **Add Achievement Button:** For personal milestones

#### 7. Tools (`/(tabs)/tools`)
**Purpose:** Recovery resources and utilities  
**Wireframe Description:**
- **Grid Layout:**
  - Step Work Guide
  - Meeting Tracker (P1)
  - Emergency Resources
  - Motivation Vault (P2)
  - Trigger Scenarios (P2)
  - Daily Affirmations
- **Each Tool Card:** Icon, title, brief description

#### 8. Settings (`/settings`)
**Purpose:** App configuration  
**Wireframe Description:**
- **Profile Section:** Name, sobriety date, program type
- **Security:** Biometric toggle, PIN change, auto-lock timer
- **Notifications:** Check-in reminders, milestone alerts
- **Data:** Export, backup, clear data
- **About:** Privacy policy, version, support

---

### Data Models and Relationships

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           DATA MODEL DIAGRAM                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌──────────────────┐                                                       │
│  │ SobrietyProfile  │                                                       │
│  ├──────────────────┤                                                       │
│  │ id: string (PK)  │                                                       │
│  │ sobrietyDate     │                                                       │
│  │ programType      │                                                       │
│  │ displayName      │                                                       │
│  │ createdAt        │                                                       │
│  │ updatedAt        │                                                       │
│  └────────┬─────────┘                                                       │
│           │                                                                 │
│           │ 1:N                                                             │
│           ▼                                                                 │
│  ┌──────────────────┐     ┌──────────────────┐     ┌──────────────────┐    │
│  │   JournalEntry   │     │    DailyCheckin   │     │    Milestone     │    │
│  ├──────────────────┤     ├──────────────────┤     ├──────────────────┤    │
│  │ id: string (PK)  │     │ id: string (PK)  │     │ id: string (PK)  │    │
│  │ type             │     │ date (unique)    │     │ type             │    │
│  │ content [ENC]    │     │ mood             │     │ title            │    │
│  │ moodBefore       │     │ cravingLevel     │     │ reflection [ENC] │    │
│  │ moodAfter        │     │ gratitude [ENC]  │     │ achievedAt       │    │
│  │ cravingLevel     │     │ isCheckedIn      │     │ metadata         │    │
│  │ emotionTags[]    │     │ createdAt        │     │ createdAt        │    │
│  │ stepNumber?      │     └──────────────────┘     └──────────────────┘    │
│  │ meetingId?       │                                                       │
│  │ createdAt        │                                                       │
│  │ updatedAt        │                                                       │
│  └────────┬─────────┘                                                       │
│           │                                                                 │
│           │ N:1 (optional)                                                  │
│           ▼                                                                 │
│  ┌──────────────────┐     ┌──────────────────┐                             │
│  │    MeetingLog    │     │   EmotionTag     │                             │
│  ├──────────────────┤     ├──────────────────┤                             │
│  │ id: string (PK)  │     │ id: string (PK)  │                             │
│  │ name             │     │ name             │                             │
│  │ location         │     │ color            │                             │
│  │ type             │     │ isCustom         │                             │
│  │ moodBefore       │     │ createdAt        │                             │
│  │ moodAfter        │     └──────────────────┘                             │
│  │ keyTakeaways[ENC]│                                                       │
│  │ topicTags[]      │     ┌──────────────────┐                             │
│  │ attendedAt       │     │   AppSettings    │                             │
│  │ createdAt        │     ├──────────────────┤                             │
│  └──────────────────┘     │ id: string (PK)  │                             │
│                           │ checkInTime      │                             │
│  [ENC] = Encrypted field  │ autoLockMinutes  │                             │
│                           │ biometricEnabled │                             │
│                           │ themeMode        │                             │
│                           │ createdAt        │                             │
│                           │ updatedAt        │                             │
│                           └──────────────────┘                             │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### TypeScript Interfaces

```typescript
// Core Types
type EncryptedString = string; // Base64 encoded encrypted content
type ProgramType = '12-step-aa' | '12-step-na' | 'smart' | 'custom';
type JournalType = 'freeform' | 'step-work' | 'meeting-reflection' | 'daily-checkin';
type MilestoneType = 'time-based' | 'step-completion' | 'personal' | 'meeting';
type MeetingType = 'in-person' | 'online';

// Models
interface SobrietyProfile {
  id: string;
  sobrietyDate: Date;
  programType: ProgramType;
  displayName?: string;
  createdAt: Date;
  updatedAt: Date;
}

interface JournalEntry {
  id: string;
  type: JournalType;
  content: EncryptedString;
  moodBefore?: number;  // 1-10
  moodAfter?: number;   // 1-10
  cravingLevel?: number; // 0-10
  emotionTags: string[];
  stepNumber?: number;   // 1-12 if step-work type
  meetingId?: string;    // if meeting-reflection type
  createdAt: Date;
  updatedAt: Date;
}

interface Milestone {
  id: string;
  type: MilestoneType;
  title: string;
  description?: string;
  reflection?: EncryptedString;
  achievedAt: Date;
  metadata: Record<string, unknown>;
  createdAt: Date;
}

interface MeetingLog {
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

interface DailyCheckin {
  id: string;
  date: Date; // One per day (date only, no time)
  mood: number;
  cravingLevel: number;
  gratitude?: EncryptedString;
  isCheckedIn: boolean;
  createdAt: Date;
}

interface EmotionTag {
  id: string;
  name: string;
  color: string;
  isCustom: boolean;
  createdAt: Date;
}

interface AppSettings {
  id: string;
  checkInTime: string; // HH:mm format
  autoLockMinutes: number;
  biometricEnabled: boolean;
  themeMode: 'light' | 'dark' | 'system';
  notificationsEnabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

---

## 0.2 Tech Stack Lock-In

### Confirmed Technology Stack

| Category | Technology | Version | Justification |
|----------|------------|---------|---------------|
| **Framework** | React Native + Expo | SDK 52+ | File-based routing, excellent DX, OTA updates |
| **Language** | TypeScript | 5.x (strict) | Type safety, better IDE support |
| **State Management** | Zustand | 5.x | Lightweight, simple, TypeScript-first |
| **Server State** | TanStack Query | 5.x | Caching, offline support, mutations |
| **Local Database** | expo-sqlite + expo-crypto | Latest | Native SQLite, encryption support |
| **Secure Storage** | expo-secure-store | Latest | Biometric-protected key storage |
| **Navigation** | expo-router | 4.x | File-based, Next.js-like |
| **UI Framework** | NativeWind | 4.x | Tailwind for RN, consistent styling |
| **Authentication** | expo-local-authentication | Latest | Biometric + fallback PIN |
| **Testing** | Jest + RNTL | Latest | Unit + integration testing |
| **Audio (P1)** | expo-av | Latest | Voice journal recording |
| **Notifications** | expo-notifications | Latest | Daily check-in reminders |

### Why These Choices?

1. **expo-sqlite over WatermelonDB:** Simpler setup, native Expo support, sufficient for our scale
2. **NativeWind over Tamagui:** More familiar Tailwind syntax, lighter bundle
3. **Zustand over Redux:** Less boilerplate, easier async, smaller bundle
4. **expo-router:** Mirrors Next.js file-based routing (familiar from web app)

---

## 0.3 Feature Prioritization Matrix

### P0 — MVP Launch (v1.0)
*Must be complete before first release*

| Feature | Description | Complexity | Dependencies |
|---------|-------------|------------|--------------|
| Biometric Lock Screen | App-level security gate | Medium | expo-local-authentication |
| Onboarding Flow | First-time setup, no account | Low | expo-secure-store |
| Dashboard | Sobriety counter, quick check-in | Medium | Zustand, expo-sqlite |
| Basic Journaling | Freeform entries, mood/craving | Medium | Encryption lib |
| Sobriety Tracking | Timeline, streaks, progress metrics | Medium | expo-sqlite |
| Daily Check-In | Quick mood/craving/gratitude | Low | Notifications (expo-notifications) |
| Relapse Logging | Compassionate UI, preserves history | Medium | All above |
| Settings | Basic app configuration | Low | expo-secure-store |

### P1 — Enhanced Features (v1.1)
*Second release, 4-6 weeks post-MVP*

| Feature | Description | Complexity | Dependencies |
|---------|-------------|------------|--------------|
| Step Work Journals | Guided prompts per step | Medium | Journal system |
| Voice Journal | Audio recording entries | High | expo-av |
| Meeting Tracker | Log meetings, mood comparison | Medium | Journal system |
| Emotion Intelligence | Pattern detection, insights | High | Journal data |
| Advanced Milestones | Custom achievements, reflections | Medium | Milestone system |
| Time Capsule | Letters to future self | Low | Journal system |
| Weekly Report | Auto-generated recovery summary | Medium | All data |

### P2 — Advanced Features (v1.2)
*Third release, 3+ months post-MVP*

| Feature | Description | Complexity | Dependencies |
|---------|-------------|------------|--------------|
| AI Companion | Local LLM or E2E encrypted cloud | Very High | react-native-fast-tflite OR API |
| Trigger Scenarios | Choose-your-own-adventure coping | High | Custom content |
| Motivation Vault | Extra-protected personal content | Medium | Biometric layer |
| Theming | Multiple visual themes | Low | NativeWind |

### P3 — Future Features
*Post 1.2, based on user feedback*

| Feature | Description | Complexity | Dependencies |
|---------|-------------|------------|--------------|
| Privacy-First Sharing | Anonymous milestone cards | Medium | Image generation |
| Cross-Device Sync | E2E encrypted Supabase sync | Very High | Supabase, encryption |
| Recovery Buddy System | Paired accountability | High | Backend service |
| Widget Support | Home screen sobriety counter | Medium | expo-widgets |
| Apple Watch / WearOS | Companion app | Very High | Native modules |

---

## 0.4 Native Module Requirements

### Pure JavaScript (No Native Modules)
- Zustand state management
- TanStack Query
- Date/time calculations
- Encryption (using expo-crypto)
- UI components (NativeWind)

### Expo Managed Native Modules (No Ejection Required)
| Module | Purpose | Platform |
|--------|---------|----------|
| expo-secure-store | Encryption key storage | iOS/Android |
| expo-local-authentication | Biometrics | iOS/Android |
| expo-sqlite | Local database | iOS/Android |
| expo-crypto | Encryption operations | iOS/Android |
| expo-notifications | Daily reminders | iOS/Android |
| expo-av | Voice recording (P1) | iOS/Android |
| expo-file-system | Export/backup | iOS/Android |

### Custom Native Code Required (P2+)
| Module | Purpose | Notes |
|--------|---------|-------|
| react-native-fast-tflite | On-device LLM | Only if implementing local AI |

**Recommendation:** Stay in Expo Managed Workflow for MVP and P1. Evaluate ejection only if P2 AI features require it.

---

## 0.5 Privacy Boundary Documentation

### Data Classification

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         PRIVACY BOUNDARIES                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    LOCAL-ONLY (NEVER LEAVES DEVICE)                  │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • Journal entry content (encrypted at rest)                        │   │
│  │  • Meeting notes and reflections (encrypted at rest)                │   │
│  │  • Gratitude entries (encrypted at rest)                            │   │
│  │  • Voice recordings (encrypted at rest)                             │   │
│  │  • Milestone reflections (encrypted at rest)                        │   │
│  │  • Motivation vault content (encrypted at rest)                     │   │
│  │  • Mood/craving history                                             │   │
│  │  • Sobriety date and streaks                                        │   │
│  │  • Personal achievements                                            │   │
│  │  • App settings and preferences                                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                OPTIONAL SYNC (E2E Encrypted) - P3 ONLY              │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • All data above, IF user explicitly enables sync                  │   │
│  │  • Encrypted before leaving device                                  │   │
│  │  • Server sees only opaque encrypted blobs                          │   │
│  │  • User controls sync triggers (never automatic)                    │   │
│  │  • Local version ALWAYS wins conflicts                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │                    NEVER COLLECTED OR TRANSMITTED                    │   │
│  ├─────────────────────────────────────────────────────────────────────┤   │
│  │  • Analytics without explicit consent                               │   │
│  │  • Location data                                                    │   │
│  │  • Contact information                                              │   │
│  │  • Usage patterns (without consent)                                 │   │
│  │  • Device identifiers (beyond necessary for app function)           │   │
│  │  • Any personally identifiable information                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Encryption Strategy

```typescript
// Encryption flow for sensitive data

// 1. On first app launch, generate encryption key
const generateEncryptionKey = async (): Promise<void> => {
  const keyExists = await SecureStore.getItemAsync('app_encryption_key');
  if (!keyExists) {
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    const key = Array.from(randomBytes)
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');
    
    await SecureStore.setItemAsync('app_encryption_key', key, {
      requireAuthentication: true, // Biometric required to access
    });
  }
};

// 2. Before storing any sensitive data
const encryptContent = async (plaintext: string): Promise<EncryptedString> => {
  const key = await SecureStore.getItemAsync('app_encryption_key');
  // AES-256-GCM encryption
  return encrypt(plaintext, key);
};

// 3. When retrieving sensitive data
const decryptContent = async (ciphertext: EncryptedString): Promise<string> => {
  const key = await SecureStore.getItemAsync('app_encryption_key');
  return decrypt(ciphertext, key);
};
```

### Data Retention

- **Local Data:** Persists until user explicitly deletes
- **Backups:** User-initiated, encrypted exports only
- **No Server:** No server means no server-side retention
- **Uninstall:** All data deleted with app (platform behavior)

---

## 0.6 Offline-First Data Strategy

### Principles

1. **Default Offline:** All features work without internet
2. **Local-First:** Data written to local SQLite immediately
3. **Optional Sync:** Only if user explicitly enables (P3)
4. **Conflict Resolution:** Local always wins
5. **No Network Dependency:** App never blocks on network calls

### Data Flow

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           OFFLINE-FIRST FLOW                                │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  User Action                                                                │
│      │                                                                      │
│      ▼                                                                      │
│  ┌────────────────┐                                                         │
│  │ Encrypt Data   │  (if sensitive)                                         │
│  └───────┬────────┘                                                         │
│          │                                                                  │
│          ▼                                                                  │
│  ┌────────────────┐                                                         │
│  │ Write to       │                                                         │
│  │ Local SQLite   │  ← IMMEDIATE (< 100ms)                                  │
│  └───────┬────────┘                                                         │
│          │                                                                  │
│          ▼                                                                  │
│  ┌────────────────┐                                                         │
│  │ Update UI      │  ← OPTIMISTIC                                           │
│  └───────┬────────┘                                                         │
│          │                                                                  │
│          ▼                                                                  │
│  ┌────────────────┐     ┌────────────────┐                                 │
│  │ Sync Enabled?  │─NO─▶│     DONE       │                                 │
│  └───────┬────────┘     └────────────────┘                                 │
│          │                                                                  │
│          │ YES (P3 only)                                                    │
│          ▼                                                                  │
│  ┌────────────────┐                                                         │
│  │ Queue for Sync │  (background, non-blocking)                            │
│  └───────┬────────┘                                                         │
│          │                                                                  │
│          ▼                                                                  │
│  ┌────────────────┐     ┌────────────────┐                                 │
│  │ Network?       │─NO─▶│  Retry Later   │                                 │
│  └───────┬────────┘     └────────────────┘                                 │
│          │                                                                  │
│          │ YES                                                              │
│          ▼                                                                  │
│  ┌────────────────┐                                                         │
│  │ Sync (E2E Enc) │                                                         │
│  └────────────────┘                                                         │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### SQLite Schema

```sql
-- Core tables
CREATE TABLE sobriety_profile (
  id TEXT PRIMARY KEY,
  sobriety_date TEXT NOT NULL,
  program_type TEXT NOT NULL,
  display_name TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE journal_entries (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  content TEXT NOT NULL, -- Encrypted
  mood_before INTEGER,
  mood_after INTEGER,
  craving_level INTEGER,
  emotion_tags TEXT, -- JSON array
  step_number INTEGER,
  meeting_id TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (meeting_id) REFERENCES meeting_logs(id)
);

CREATE TABLE daily_checkins (
  id TEXT PRIMARY KEY,
  date TEXT NOT NULL UNIQUE,
  mood INTEGER NOT NULL,
  craving_level INTEGER NOT NULL,
  gratitude TEXT, -- Encrypted
  is_checked_in INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE milestones (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  reflection TEXT, -- Encrypted
  achieved_at TEXT NOT NULL,
  metadata TEXT, -- JSON
  created_at TEXT NOT NULL
);

CREATE TABLE meeting_logs (
  id TEXT PRIMARY KEY,
  name TEXT,
  location TEXT,
  type TEXT NOT NULL,
  mood_before INTEGER NOT NULL,
  mood_after INTEGER NOT NULL,
  key_takeaways TEXT NOT NULL, -- Encrypted
  topic_tags TEXT, -- JSON array
  attended_at TEXT NOT NULL,
  created_at TEXT NOT NULL
);

CREATE TABLE emotion_tags (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  color TEXT NOT NULL,
  is_custom INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL
);

CREATE TABLE app_settings (
  id TEXT PRIMARY KEY,
  check_in_time TEXT NOT NULL,
  auto_lock_minutes INTEGER NOT NULL DEFAULT 5,
  biometric_enabled INTEGER NOT NULL DEFAULT 1,
  theme_mode TEXT NOT NULL DEFAULT 'system',
  notifications_enabled INTEGER NOT NULL DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Indexes for performance
CREATE INDEX idx_journal_created ON journal_entries(created_at);
CREATE INDEX idx_journal_type ON journal_entries(type);
CREATE INDEX idx_checkin_date ON daily_checkins(date);
CREATE INDEX idx_milestone_achieved ON milestones(achieved_at);
```

---

## 0.7 Performance Targets

| Metric | Target | Measurement |
|--------|--------|-------------|
| App launch to usable | < 2s | Cold start to interactive dashboard |
| Journal entry save | < 100ms | Tap save → confirmation |
| Search 1000 entries | < 500ms | Query → results rendered |
| Encryption/decryption | < 50ms | Per operation |
| Bundle size (Android) | < 50MB | APK size |
| Memory usage | < 150MB | Active usage |
| Battery impact | < 2%/hour | Active usage |

---

## 0.8 Directory Structure

```
twelve-step-companion/
├── app/                          # expo-router screens
│   ├── (tabs)/                   # Main tab navigation
│   │   ├── _layout.tsx           # Tab bar layout
│   │   ├── index.tsx             # Dashboard/Home
│   │   ├── journal.tsx           # Journal hub
│   │   ├── progress.tsx          # Milestones & achievements
│   │   └── tools.tsx             # Recovery tools
│   ├── (auth)/                   # Authentication gate
│   │   ├── _layout.tsx           # Auth layout
│   │   └── lock.tsx              # Lock screen
│   ├── onboarding/               # Onboarding flow
│   │   ├── _layout.tsx           # Onboarding layout
│   │   ├── welcome.tsx           # Step 1
│   │   ├── date.tsx              # Step 2
│   │   ├── program.tsx           # Step 3
│   │   └── notifications.tsx     # Step 4
│   ├── journal/                  # Journal screens
│   │   ├── [id].tsx              # View/edit entry
│   │   └── new.tsx               # New entry
│   ├── step-work/                # Step work modules
│   │   └── [step].tsx            # Step-specific prompts
│   ├── settings/                 # Settings screens
│   │   ├── index.tsx             # Main settings
│   │   ├── profile.tsx           # Profile settings
│   │   ├── security.tsx          # Security settings
│   │   └── data.tsx              # Data management
│   ├── _layout.tsx               # Root layout
│   └── +not-found.tsx            # 404 screen
├── components/                   # Shared components
│   ├── ui/                       # Design system primitives
│   │   ├── Button.tsx
│   │   ├── Card.tsx
│   │   ├── Input.tsx
│   │   ├── Slider.tsx
│   │   ├── Modal.tsx
│   │   └── index.ts
│   ├── journal/                  # Journal-specific
│   │   ├── EntryCard.tsx
│   │   ├── MoodSlider.tsx
│   │   ├── EmotionTags.tsx
│   │   └── index.ts
│   ├── progress/                 # Progress-specific
│   │   ├── SobrietyCounter.tsx
│   │   ├── MilestoneCard.tsx
│   │   ├── Timeline.tsx
│   │   └── index.ts
│   └── common/                   # Common components
│       ├── Header.tsx
│       ├── LoadingSpinner.tsx
│       └── EmptyState.tsx
├── lib/                          # Core utilities
│   ├── db/                       # Database layer
│   │   ├── client.ts             # SQLite client
│   │   ├── migrations.ts         # Schema migrations
│   │   ├── models/               # Model classes
│   │   │   ├── JournalEntry.ts
│   │   │   ├── DailyCheckin.ts
│   │   │   ├── Milestone.ts
│   │   │   └── index.ts
│   │   └── index.ts
│   ├── encryption/               # Crypto utilities
│   │   ├── keyManager.ts         # Key generation/storage
│   │   ├── encrypt.ts            # Encryption functions
│   │   ├── decrypt.ts            # Decryption functions
│   │   └── index.ts
│   ├── hooks/                    # Custom hooks
│   │   ├── useAuth.ts            # Biometric auth
│   │   ├── useSobriety.ts        # Sobriety calculations
│   │   ├── useJournal.ts         # Journal operations
│   │   ├── useCheckin.ts         # Daily check-in
│   │   └── index.ts
│   ├── store/                    # Zustand stores
│   │   ├── authStore.ts          # Auth state
│   │   ├── profileStore.ts       # User profile
│   │   ├── journalStore.ts       # Journal state
│   │   ├── settingsStore.ts      # App settings
│   │   └── index.ts
│   └── constants/                # App constants
│       ├── emotions.ts           # Default emotion tags
│       ├── milestones.ts         # Time-based milestones
│       ├── stepPrompts.ts        # Step work prompts
│       └── index.ts
├── assets/                       # Static assets
│   ├── images/                   # Images
│   └── fonts/                    # Custom fonts
├── __tests__/                    # Test files
│   ├── unit/                     # Unit tests
│   ├── integration/              # Integration tests
│   └── e2e/                      # E2E tests
├── app.json                      # Expo config
├── babel.config.js               # Babel config
├── tailwind.config.js            # NativeWind config
├── tsconfig.json                 # TypeScript config
├── package.json                  # Dependencies
└── README.md                     # Documentation
```

---

## Approval Checklist

Before proceeding to Phase 1 (Implementation), please confirm:

- [ ] Screen inventory is complete and accurate
- [ ] Data models correctly represent domain requirements
- [ ] Tech stack is approved
- [ ] Feature prioritization aligns with business goals
- [ ] Privacy boundaries are acceptable
- [ ] Performance targets are realistic
- [ ] Directory structure is approved

---

## Next Steps

Upon approval of this document:

1. **Phase 1:** Initialize Expo project with defined structure
2. **Phase 2.1:** Implement biometric lock screen
3. **Phase 2.2:** Build onboarding flow
4. **Phase 2.3:** Create dashboard with sobriety counter
5. **Phase 2.4:** Implement encrypted journaling
6. **Phase 2.5:** Build progress tracking
7. **Phase 2.6:** Add daily check-in with notifications

---

**Document Status:** READY FOR REVIEW  
**Created By:** AI Architect  
**Awaiting Approval From:** Product Owner


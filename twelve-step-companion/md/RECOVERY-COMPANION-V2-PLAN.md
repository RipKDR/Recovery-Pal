# Recovery Companion V2: Complete Development Plan

## BMAD (Before Making Any Decisions) Methodology

---

## Executive Summary

**Current State:** Feature-complete MVP with solid foundation  
**Goal:** Transform into a comprehensive digital fellowship companion  
**Philosophy:** Mirror the actual 12-step experience, not generic wellness tracking

---

## Design Principles

### Core Design Philosophy

1. **Clean & Minimal** — Google/Apple-level simplicity
2. **Content-First** — UI disappears, content shines
3. **Purposeful** — Every element serves recovery
4. **Accessible** — Works for everyone, especially in crisis
5. **Professional** — Not "app-like", feels like a trusted tool

### Visual Guidelines

| Element | Specification |
|---------|---------------|
| Typography | System fonts, clear hierarchy, generous line-height (1.5-1.6) |
| Spacing | Consistent 8px grid system, generous padding |
| Colors | Muted palette, high contrast for readability |
| Icons | Minimal use, only when adding clarity |
| Animations | Subtle, functional, never decorative |
| Density | Comfortable touch targets (44px min), breathing room |

### What to Avoid

- Excessive emojis (use sparingly, purposefully)
- Gradient backgrounds
- Drop shadows on everything
- Rounded corners on everything
- Generic placeholder imagery
- Gamification that trivializes recovery

---

## Phase 0: Assessment & Preparation

**Duration:** 1-2 days  
**Status:** Planning

### 0.1 Technical Debt Resolution

| Task | Priority | Status |
|------|----------|--------|
| Create `eas.json` for production builds | Critical | Pending |
| Replace EAS placeholder values in `app.json` | Critical | Pending |
| Upgrade encryption from XOR to AES-256-GCM | High | Pending |
| Add Jest testing framework | High | Pending |
| Fix crisis hotline region consistency | Medium | Pending |
| Implement profile editing (currently "Coming Soon") | Medium | Pending |

### 0.2 New Type Definitions Required

```typescript
// New types to add to lib/types.ts

// Recovery contacts
export interface RecoveryContact {
  id: string;
  name: string;
  phone: string;
  role: 'sponsor' | 'sponsee' | 'home_group' | 'fellowship' | 'emergency';
  notes?: string;
  lastContactedAt?: Date;
  createdAt: Date;
}

// Regular meetings (recurring)
export interface RegularMeeting {
  id: string;
  name: string;
  location?: string;
  dayOfWeek: number; // 0-6 (Sunday-Saturday)
  time: string; // HH:mm format
  type: 'in-person' | 'online' | 'hybrid';
  isHomeGroup: boolean;
  reminderEnabled: boolean;
  reminderMinutesBefore: number;
  notes?: string;
  createdAt: Date;
}

// Achievements
export type AchievementCategory = 
  | 'keytags' 
  | 'step_work' 
  | 'fellowship' 
  | 'service' 
  | 'daily_practice';

export type AchievementStatus = 
  | 'locked' 
  | 'available' 
  | 'in_progress' 
  | 'unlocked';

export interface Achievement {
  id: string;
  category: AchievementCategory;
  title: string;
  description: string;
  icon: string;
  unlockType: 'self_check' | 'automatic' | 'progressive' | 'count' | 'streak';
  target?: number;
  current?: number;
  status: AchievementStatus;
  unlockedAt?: Date;
  requiresDaysClean?: number;
  requiresAchievements?: string[];
}

// Daily readings
export interface DailyReading {
  id: string;
  date: string; // MM-DD format
  title: string;
  content: string;
  reflectionPrompt: string;
  source: 'jft' | 'daily_reflections' | 'custom';
}

// 4th Step inventory
export interface FourthStepEntry {
  id: string;
  type: 'resentment' | 'fear' | 'sex_conduct';
  who: string;
  cause: string;
  affects: string[];
  myPart: string;
  createdAt: Date;
}

// 8th/9th Step amends
export interface AmendsEntry {
  id: string;
  person: string;
  harm: string;
  amendsType: 'direct' | 'indirect' | 'living';
  status: 'not_willing' | 'willing' | 'planned' | 'in_progress' | 'made';
  notes?: string;
  madeAt?: Date;
  createdAt: Date;
}

// Phone call log
export interface PhoneCallLog {
  id: string;
  contactId: string;
  contactName: string;
  duration?: number; // minutes
  notes?: string;
  calledAt: Date;
}

// Gratitude entry
export interface GratitudeEntry {
  id: string;
  date: Date;
  items: string[];
  createdAt: Date;
}

// 10th Step review
export interface TenthStepReview {
  id: string;
  date: Date;
  wasResentful?: string;
  wasSelfish?: string;
  wasDishonest?: string;
  wasAfraid?: string;
  oweApology?: string;
  couldDoBetter?: string;
  gratefulFor?: string;
  createdAt: Date;
}
```

### 0.3 Database Schema Updates

New tables required:

- `recovery_contacts`
- `regular_meetings`
- `achievements`
- `daily_reading_reflections`
- `fourth_step_inventory`
- `amends_list`
- `phone_call_logs`
- `gratitude_entries`
- `tenth_step_reviews`
- `literature_progress`

### 0.4 Deliverables

- [ ] Technical debt items resolved
- [ ] New types defined
- [ ] Database migrations created
- [ ] Design tokens documented

---

## Phase 1: Daily Engagement Foundation

**Duration:** 5-7 days  
**Prerequisites:** Phase 0 complete

### 1.1 Daily Reading System (JFT)

**User Story:** As a member, I want to read today's JFT reading when I open the app.

**Components:**

- `lib/constants/dailyReadings.ts` — 365 daily readings
- `lib/store/readingStore.ts` — Reading state management
- `components/home/DailyReadingCard.tsx` — Home page card
- `app/reading/index.tsx` — Full reading screen
- `app/reading/reflect.tsx` — Reflection screen

**Home Page Card Design:**

┌─────────────────────────────────────────────────┐
│                                                 │
│  Today's Reading                    Nov 25     │
│                                                 │
│  "Letting Go"                                  │
│                                                 │
│  We've found that we no longer need to hang    │
│  onto old ideas and old ways of doing things...│
│                                                 │
│  ─────────────────────────────────────────────  │
│                                                 │
│  Read More                          Reflect →  │
│                                                 │
└─────────────────────────────────────────────────┘

**Technical Notes:**

- Store 365 readings in constants file (can be updated OTA later)
- Track read status in SQLite
- Reflection saves to journal with type 'jft-reflection'
- Show streak for consecutive days read

### 1.2 Recovery Contacts System

**User Story:** As a member, I need quick access to call my sponsor and network.

**Components:**

- `lib/store/contactStore.ts` — Contact state management
- `app/contacts/index.tsx` — Contacts list
- `app/contacts/add.tsx` — Add contact
- `components/contacts/ContactCard.tsx` — Contact display
- `components/contacts/QuickCall.tsx` — One-tap calling

**Database Schema:**

```sql
CREATE TABLE recovery_contacts (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  phone TEXT NOT NULL,
  role TEXT NOT NULL,
  notes TEXT,
  last_contacted_at TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX idx_contacts_role ON recovery_contacts(role);
```

**Design Requirements:**

- Sponsor prominently displayed at top
- One-tap call functionality
- "Days since last contact" subtle reminder
- SOS mode pre-fills text message

### 1.3 Phone Call Tracker

**User Story:** As a member, I want to track my calls to stay connected.

**Components:**

- `lib/store/phoneStore.ts` — Call log state
- `components/home/PhoneWidget.tsx` — Home page widget
- `app/phone/index.tsx` — Full call history

**Home Widget Design:**

┌─────────────────────────────────────────────────┐
│                                                 │
│  Calls Today                              2/3  │
│  ████████████████████░░░░░░░░░░░░░░░░░░░░░░░░  │
│                                                 │
│  John D. (Sponsor)              9:15 AM  12m  │
│  Mike T.                        2:30 PM   8m  │
│                                                 │
│  Call Someone →                                │
│                                                 │
└─────────────────────────────────────────────────┘

### 1.4 Home Page Redesign

**User Story:** As a member, I want the home page to show everything important at a glance.

**New Home Page Layout:**

┌─────────────────────────────────────────────────┐
│ Good morning, [Name]                    Day 47 │
│ Monday, November 25                            │
├─────────────────────────────────────────────────┤
│ [Daily Reading Card]                           │
├─────────────────────────────────────────────────┤
│ [Clean Time Display - Minimal]                 │
├─────────────────────────────────────────────────┤
│ [Check-in Card - if not done]                  │
├─────────────────────────────────────────────────┤
│ Stats Row:                                     │
│ ┌─────────┐ ┌─────────┐ ┌─────────┐           │
│ │ 127     │ │ 12      │ │ 7.2     │           │
│ │meetings │ │ streak  │ │ mood    │           │
│ └─────────┘ └─────────┘ └─────────┘           │
├─────────────────────────────────────────────────┤
│ [Phone Calls Widget]                           │
├─────────────────────────────────────────────────┤
│ [Upcoming Meeting - if today]                  │
└─────────────────────────────────────────────────┘

### 1.5 Deliverables

- [ ] Daily reading system functional
- [ ] 365 daily readings loaded
- [ ] Recovery contacts CRUD complete
- [ ] Phone call tracking working
- [ ] Home page redesigned
- [ ] All screens follow design guidelines

---

## Phase 2: Fellowship Features

**Duration:** 5-7 days  
**Prerequisites:** Phase 1 complete

### 2.1 Regular Meetings Manager

**User Story:** As a member, I want to save my regular meetings with reminders.

**Components:**

- `lib/store/regularMeetingStore.ts`
- `app/my-meetings/index.tsx` — My meetings list
- `app/my-meetings/add.tsx` — Add regular meeting
- `app/my-meetings/[id].tsx` — Meeting details
- `lib/notifications/meetingReminders.ts`

**Database Schema:**

```sql
CREATE TABLE regular_meetings (
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
```

**Features:**

- Set home group (one only)
- Configure reminder timing
- Quick "Mark Attended" from notification
- Week view of upcoming meetings

### 2.2 Enhanced Meeting Log

**User Story:** As a member, I want to record what I learned from each meeting.

**Expand existing meeting log:**

```typescript
// Add to MeetingLog interface
interface MeetingLogEnhanced extends MeetingLog {
  whatILearned?: EncryptedString;
  quoteHeard?: EncryptedString;
  connectionsMode?: ('got_number' | 'conversation' | 'made_plans' | 'sponsor')[];
  connectionNotes?: EncryptedString;
  didShare: boolean;
  shareReflection?: EncryptedString;
  regularMeetingId?: string; // Link to regular meeting
}
```

**New Fields in Meeting Log Form:**

- "What did I take from this meeting?"
- "Something I heard that I want to remember"
- Checkboxes: "Got a number", "Had meaningful conversation", etc.
- "Did you share?" toggle with optional reflection

### 2.3 Meeting Share Preparation

**User Story:** As a member, I want to prepare notes before sharing at a meeting.

**Components:**

- `app/share-prep/index.tsx` — Share preparation screen
- `components/meetings/SharePrepCard.tsx`

**Features:**

- Access from meeting reminder notification
- Template prompts (Today's topic, Gratitude, Struggle, Experience)
- Saves notes locally until meeting logged
- Link to today's JFT reading for context

### 2.4 Sponsor Connection

**User Story:** As a member, I need one-tap access to contact my sponsor.

**Components:**

- `components/common/SponsorWidget.tsx`
- Quick call, text, and SOS buttons
- "Days since last contact" indicator
- Appears on home page if sponsor configured

**SOS Functionality:**

- Pre-written message: "Hey, I'm having a hard time. Can you talk?"
- One tap sends via SMS
- Falls back to call if text fails

### 2.5 Deliverables

- [ ] Regular meetings CRUD complete
- [ ] Meeting reminders working (local notifications)
- [ ] Enhanced meeting reflection saved
- [ ] Share preparation screen functional
- [ ] Sponsor widget integrated
- [ ] SOS messaging working

---

## Phase 3: Step Work Enhancement

**Duration:** 7-10 days  
**Prerequisites:** Phase 2 complete

### 3.1 Progressive Step Work System

**User Story:** As a member, I want guided step work that tracks my progress.

**Restructure Step Work:**

Step Progress States:

- locked (prerequisites not met)
- available (can start)
- started (< 50% questions answered)
- in_progress (50-99% complete)
- completed (100% answered)
- discussed (marked as discussed with sponsor)

**Components:**

- `lib/store/stepWorkStore.ts` — Step progress state
- `app/step-work/index.tsx` — Updated overview
- `app/step-work/[step]/index.tsx` — Step detail
- `app/step-work/[step]/question/[id].tsx` — Individual question

**Database Schema:**

```sql
CREATE TABLE step_progress (
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

CREATE TABLE step_answers (
  id TEXT PRIMARY KEY,
  step_number INTEGER NOT NULL,
  question_index INTEGER NOT NULL,
  answer TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
```

### 3.2 Fourth Step Inventory (Proper Format)

**User Story:** As a member, I want to do my 4th step inventory in the correct format.

**The Big Book Format:**

1. Resentments (Who, Cause, Affects, My Part)
2. Fears (Fear, Why, How it affects me)
3. Sex Conduct/Relationships (Who, What, Affected, My Ideal)

**Components:**

- `app/step-work/4/inventory/index.tsx` — Inventory overview
- `app/step-work/4/inventory/resentments.tsx`
- `app/step-work/4/inventory/fears.tsx`
- `app/step-work/4/inventory/relationships.tsx`
- `app/step-work/4/inventory/add.tsx` — Add entry

**Database Schema:**

```sql
CREATE TABLE fourth_step_inventory (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  who_what TEXT NOT NULL,
  cause TEXT NOT NULL,
  affects TEXT NOT NULL,
  my_part TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX idx_4th_step_type ON fourth_step_inventory(type);
```

### 3.3 Eighth/Ninth Step Amends Tracker

**User Story:** As a member, I want to track my amends list and progress.

**Components:**

- `app/step-work/8-9/index.tsx` — Amends overview
- `app/step-work/8-9/add.tsx` — Add person
- `app/step-work/8-9/[id].tsx` — Amend detail

**Amends Categories:**

- Willing & Able (can make direct amends)
- Would Cause Harm (need indirect/living amends)
- Not Yet Willing (praying for willingness)
- Completed

### 3.4 Tenth Step Nightly Review

**User Story:** As a member, I want a structured nightly review.

**Components:**

- `app/step-work/10/review.tsx` — Nightly review form
- `app/step-work/10/history.tsx` — Past reviews
- Evening notification prompt

**Questions (from Big Book):**

1. Was I resentful?
2. Was I selfish?
3. Was I dishonest?
4. Was I afraid?
5. Do I owe anyone an apology?
6. What could I have done better?
7. What am I grateful for?

### 3.5 Eleventh Step Practice

**User Story:** As a member, I want guided prayer and meditation.

**Components:**

- `app/step-work/11/index.tsx` — Step 11 practice home
- `app/step-work/11/morning.tsx` — Morning practice
- `app/step-work/11/evening.tsx` — Evening practice
- `app/prayers/index.tsx` — Prayer library
- `app/meditation/index.tsx` — Meditation timer

**Prayer Library Contents:**

- Serenity Prayer (short & long)
- Third Step Prayer
- Seventh Step Prayer
- Eleventh Step Prayer (St. Francis)
- Set Aside Prayer

### 3.6 Deliverables

- [ ] Progressive step work functional
- [ ] 4th step inventory with columns
- [ ] 8th/9th step amends tracker
- [ ] 10th step nightly review
- [ ] 11th step practice tools
- [ ] Prayer library complete
- [ ] All encrypted properly

---

## Phase 4: Achievement System

**Duration:** 5-7 days  
**Prerequisites:** Phase 3 complete

### 4.1 Keytag System

**User Story:** As a member, I want to see my keytags like my physical collection.

**Keytag Milestones (NA Standard):**

| Tag | Color | Days |
|-----|-------|------|
| Welcome/JFT | White | 0 |
| 30 Days | Orange | 30 |
| 60 Days | Green | 60 |
| 90 Days | Red | 90 |
| 6 Months | Blue | 180 |
| 9 Months | Yellow | 270 |
| 1 Year | Moonlight | 365 |
| 18 Months | Gray | 547 |
| Multiple Years | Black | 730+ |

**Components:**

- `lib/constants/keytags.ts` — Keytag definitions
- `lib/store/achievementStore.ts` — Achievement state
- `app/achievements/index.tsx` — Wall of Achievements
- `app/achievements/[id].tsx` — Achievement detail
- `components/achievements/KeytagWall.tsx`
- `components/achievements/KeytagModal.tsx`

### 4.2 Fellowship Achievements

| Achievement | Unlock Condition |
|-------------|------------------|
| Newcomer Tag | Self-check |
| First Contact | Add 1 recovery contact |
| Building Network | Add 3 contacts |
| Connected | Add 10 contacts |
| Found My Home | Set home group |
| Got a Sponsor | Add sponsor contact |
| Found My Voice | Self-check (shared at meeting) |
| First Service | Self-check |
| 90 in 90 | 90 meetings in first 90 days |

### 4.3 Step Work Achievements

| Achievement | Unlock Condition |
|-------------|------------------|
| Started Step [X] | 50% of questions answered |
| Completed Step [X] | 100% of questions answered |
| Discussed Step [X] | Self-check with sponsor |
| All Steps Complete | All 12 completed |

### 4.4 Daily Practice Achievements

| Achievement | Unlock Condition |
|-------------|------------------|
| Daily Reader (7) | 7 consecutive JFT reads |
| Daily Reader (30) | 30 consecutive JFT reads |
| Check-in Streak (7) | 7 consecutive check-ins |
| Check-in Streak (30) | 30 consecutive check-ins |
| Phone Therapy | 3 calls in one day, 7 days |
| Nightly Review | 7 consecutive 10th step reviews |

### 4.5 Wall of Achievements Screen

**Design:**

┌─────────────────────────────────────────────────┐
│ ← Back                                          │
│                                                 │
│ My Recovery Journey                             │
│                                                 │
│ Progress: 14 of 37 achievements                │
│ ██████████████░░░░░░░░░░░░░░░░░░░░░░░░░░  38%  │
│                                                 │
├─────────────────────────────────────────────────┤
│                                                 │
│ KEYTAGS                                         │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐       │
│ │ ○   │ │ ○   │ │ ○   │ │ ○   │ │ ○   │       │
│ │ JFT │ │ 30  │ │ 60  │ │ 90  │ │ 6mo │       │
│ │ ✓   │ │ ✓   │ │ ✓   │ │ ✓   │ │ ---  │       │
│ └─────┘ └─────┘ └─────┘ └─────┘ └─────┘       │
│                                                 │
│ STEP WORK                       3 of 12        │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│ │ 1   │ │ 2   │ │ 3   │ │ 4   │ ...          │
│ │ ✓   │ │ ✓   │ │ ✓   │ │ ░░  │              │
│ └─────┘ └─────┘ └─────┘ └─────┘              │
│                                                 │
│ FELLOWSHIP                      4 of 9         │
│ ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐              │
│ │ tag │ │home │ │spnsr│ │voice│ ...          │
│ │ ✓   │ │ ✓   │ │ ✓   │ │ ✓   │              │
│ └─────┘ └─────┘ └─────┘ └─────┘              │
│                                                 │
└─────────────────────────────────────────────────┘

### 4.6 Deliverables

- [ ] Keytag system implemented
- [ ] All achievements defined
- [ ] Achievement unlock logic
- [ ] Wall of achievements screen
- [ ] Achievement detail modals
- [ ] Unlock celebrations (subtle)
- [ ] Achievement reflection capture

---

## Phase 5: Literature & Resources

**Duration:** 3-5 days  
**Prerequisites:** Phase 4 complete

### 5.1 Readings Library

**User Story:** As a member, I want quick access to common readings.

**Components:**

- `lib/constants/readings.ts` — All standard readings
- `app/readings/index.tsx` — Readings library
- `app/readings/[id].tsx` — Reading detail

**Readings to Include:**

- Who Is an Addict?
- What Is the NA Program?
- Why Are We Here?
- How It Works (Chapter 5)
- We Do Recover
- Just for Today (closing)

### 5.2 Prayer Library

**User Story:** As a member, I want all prayers in one place.

**Components:**

- `lib/constants/prayers.ts`
- `app/prayers/index.tsx`
- `app/prayers/[id].tsx`

**Prayers to Include:**

- Serenity Prayer (short)
- Serenity Prayer (long)
- Third Step Prayer
- Seventh Step Prayer
- Eleventh Step Prayer
- Set Aside Prayer

### 5.3 Slogans Reference

**User Story:** As a member, I want quick access to program slogans.

**Components:**

- `lib/constants/slogans.ts`
- `app/slogans/index.tsx`

**Slogans:**

- One Day at a Time
- Keep Coming Back
- Easy Does It
- First Things First
- Let Go and Let God
- This Too Shall Pass
- Progress Not Perfection
- HALT (Hungry, Angry, Lonely, Tired)
- Think Think Think
- Live and Let Live

### 5.4 The Promises

**User Story:** As a member, I want to track which promises I'm seeing come true.

**Components:**

- `app/promises/index.tsx`
- Checkbox to mark promises experienced
- Reflection prompt for each

### 5.5 Literature Progress Tracker

**User Story:** As a member, I want to track my reading of the Basic Text.

**Components:**

- `app/literature/index.tsx`
- `lib/store/literatureStore.ts`
- Chapter checklist with notes

### 5.6 Deliverables

- [ ] Readings library complete
- [ ] Prayer library complete
- [ ] Slogans with explanations
- [ ] Promises tracker
- [ ] Literature progress
- [ ] All text reviewed for accuracy

---

## Phase 6: Journal Enhancement

**Duration:** 3-5 days  
**Prerequisites:** Phase 5 complete

### 6.1 Apple Notes-Style Journal

**User Story:** As a member, I want a beautiful, distraction-free writing experience.

**Design Principles:**

- Warm, paper-like background (#FDFBF7 light, #1C1C1E dark)
- Serif typography for body (Georgia/Charter)
- Generous margins and line height
- Minimal chrome when typing
- Auto-save indicator (subtle checkmark)

**Components:**

- `app/journal/new.tsx` — Redesigned
- `app/journal/[id].tsx` — Redesigned
- `components/journal/Editor.tsx` — Clean editor

### 6.2 Journal Organization

**Features:**

- Automatic date grouping (Today, Yesterday, This Week, etc.)
- Filter by type (Freeform, Step Work, JFT, Meeting)
- Full-text search (after decryption)
- Quick entry from home screen

### 6.3 Gratitude List Feature

**User Story:** As a member, I want a quick way to list daily gratitudes.

**Components:**

- `app/gratitude/index.tsx` — Gratitude home
- `app/gratitude/add.tsx` — Quick add (3 items)
- Streak tracking
- History view

### 6.4 Deliverables

- [ ] Journal editor redesigned
- [ ] Focus mode implemented
- [ ] Journal organization improved
- [ ] Gratitude list feature
- [ ] Search functional
- [ ] Performance optimized (many entries)

---

## Phase 7: Early Recovery Pathway

**Duration:** 3-5 days  
**Prerequisites:** Phase 6 complete

### 7.1 Newcomer Mode

**User Story:** As a newcomer, I want guidance on what to do first.

**Features:**

- Activated for users < 90 days
- Simplified home page
- Guided checklist
- 90-in-90 tracker
- Prominent crisis resources

### 7.2 First 90 Days Checklist

**Tasks:**

- [ ] Attend your first meeting
- [ ] Get phone numbers from 3 people
- [ ] Find a sponsor (even temporary)
- [ ] Get your newcomer tag
- [ ] Read Chapter 1 of Basic Text
- [ ] Do your first check-in
- [ ] Complete Step 1 questions
- [ ] Share at a meeting (even just your name)
- [ ] Call someone from the fellowship
- [ ] Set up your home group

### 7.3 90-in-90 Tracker

**User Story:** As a newcomer, I want to track my 90 meetings in 90 days.

**Components:**

- `components/home/NinetyInNinety.tsx`
- Progress bar
- Calendar view of attendance
- Pace indicator ("on track", "behind")

### 7.4 Deliverables

- [ ] Newcomer mode detection
- [ ] Simplified UI for newcomers
- [ ] First 90 days checklist
- [ ] 90-in-90 tracker
- [ ] Appropriate feature gating

---

## Phase 8: Polish & Production

**Duration:** 5-7 days  
**Prerequisites:** All previous phases

### 8.1 Performance Optimization

| Check | Target |
|-------|--------|
| Cold start | < 2 seconds |
| Navigation | < 100ms |
| Journal scroll (500 entries) | 60fps |
| Database queries | < 50ms |
| Bundle size | < 50MB |

### 8.2 Encryption Upgrade

**Current:** XOR (demo)
**Target:** AES-256-GCM

**Implementation:**

- Use `react-native-aes-gcm-crypto` or similar
- Migrate existing data
- Test thoroughly

### 8.3 Testing Implementation

**Framework:** Jest + React Native Testing Library

**Test Coverage Targets:**

- Stores: 80%
- Utils: 90%
- Hooks: 70%
- Components: 50%

### 8.4 Accessibility Audit

- [ ] All interactive elements have labels
- [ ] Color contrast passes WCAG AA
- [ ] Screen reader navigation works
- [ ] Touch targets ≥ 44px
- [ ] Focus management correct

### 8.5 Final QA

| Test Type | Scope |
|-----------|-------|
| Smoke test | All screens load |
| Flow test | Complete user journeys |
| Edge cases | Empty states, errors |
| Device testing | Multiple screen sizes |
| Offline | App works without network |

### 8.6 EAS Configuration

Create `eas.json`:

```json
{
  "cli": {
    "version": ">= 7.0.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "ios": {
        "simulator": true
      }
    },
    "production": {
      "autoIncrement": true
    }
  },
  "submit": {
    "production": {}
  }
}
```

Update `app.json` placeholders:

- `projectId` — Get from `eas init`
- `owner` — Your Expo username

### 8.7 Deliverables

- [ ] Performance targets met
- [ ] Encryption upgraded
- [ ] Tests written and passing
- [ ] Accessibility audit passed
- [ ] EAS configured
- [ ] Production build successful

---

## File Structure (New/Modified)

lib/
├── constants/
│   ├── dailyReadings.ts      [NEW]
│   ├── keytags.ts            [NEW]
│   ├── achievements.ts       [NEW]
│   ├── prayers.ts            [NEW]
│   ├── readings.ts           [NEW]
│   ├── slogans.ts            [NEW]
│   └── promises.ts           [NEW]
├── store/
│   ├── readingStore.ts       [NEW]
│   ├── contactStore.ts       [NEW]
│   ├── phoneStore.ts         [NEW]
│   ├── regularMeetingStore.ts [NEW]
│   ├── achievementStore.ts   [NEW]
│   ├── stepWorkStore.ts      [NEW]
│   ├── amendsStore.ts        [NEW]
│   ├── literatureStore.ts    [NEW]
│   └── gratitudeStore.ts     [NEW]
├── hooks/
│   ├── useReading.ts         [NEW]
│   ├── useContacts.ts        [NEW]
│   ├── usePhoneCalls.ts      [NEW]
│   ├── useRegularMeetings.ts [NEW]
│   ├── useAchievements.ts    [NEW]
│   └── useStepWork.ts        [NEW]
└── types.ts                  [MODIFIED]

app/
├── (tabs)/
│   └── index.tsx             [MODIFIED - New home layout]
├── contacts/
│   ├── index.tsx             [NEW]
│   └── add.tsx               [NEW]
├── my-meetings/
│   ├── index.tsx             [NEW]
│   ├── add.tsx               [NEW]
│   └── [id].tsx              [NEW]
├── reading/
│   ├── index.tsx             [NEW]
│   └── reflect.tsx           [NEW]
├── achievements/
│   ├── index.tsx             [NEW]
│   └── [id].tsx              [NEW]
├── prayers/
│   └── index.tsx             [NEW]
├── readings/
│   └── index.tsx             [NEW]
├── slogans/
│   └── index.tsx             [NEW]
├── promises/
│   └── index.tsx             [NEW]
├── literature/
│   └── index.tsx             [NEW]
├── gratitude/
│   ├── index.tsx             [NEW]
│   └── add.tsx               [NEW]
├── share-prep/
│   └── index.tsx             [NEW]
├── step-work/
│   ├── 4/
│   │   └── inventory/        [NEW - 4th step columns]
│   ├── 8-9/
│   │   └── index.tsx         [NEW - Amends tracker]
│   ├── 10/
│   │   └── review.tsx        [NEW - Nightly review]
│   └── 11/
│       └── index.tsx         [NEW - Prayer/meditation]
└── journal/
    ├── new.tsx               [MODIFIED - Better editor]
    └── [id].tsx              [MODIFIED - Better editor]

components/
├── home/
│   ├── DailyReadingCard.tsx  [NEW]
│   ├── PhoneWidget.tsx       [NEW]
│   ├── SponsorWidget.tsx     [NEW]
│   ├── MeetingWidget.tsx     [NEW]
│   └── NinetyInNinety.tsx    [NEW]
├── achievements/
│   ├── KeytagWall.tsx        [NEW]
│   ├── KeytagModal.tsx       [NEW]
│   └── AchievementCard.tsx   [NEW]
├── contacts/
│   ├── ContactCard.tsx       [NEW]
│   └── QuickCall.tsx         [NEW]
├── journal/
│   └── Editor.tsx            [NEW - Clean editor]
└── step-work/
    ├── InventoryForm.tsx     [NEW]
    ├── AmendsCard.tsx        [NEW]
    └── ReviewForm.tsx        [NEW]

## Timeline Summary

| Phase | Duration | Focus |
|-------|----------|-------|
| Phase 0 | 1-2 days | Assessment & Prep |
| Phase 1 | 5-7 days | Daily Engagement |
| Phase 2 | 5-7 days | Fellowship Features |
| Phase 3 | 7-10 days | Step Work Enhancement |
| Phase 4 | 5-7 days | Achievement System |
| Phase 5 | 3-5 days | Literature & Resources |
| Phase 6 | 3-5 days | Journal Enhancement |
| Phase 7 | 3-5 days | Early Recovery Pathway |
| Phase 8 | 5-7 days | Polish & Production |

**Total Estimate:** 5-8 weeks

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Day 7 retention | > 40% |
| Day 30 retention | > 25% |
| Daily active usage | > 60% of active users |
| Check-in completion | > 70% daily |
| JFT read rate | > 50% daily |
| Meeting logging | > 80% of attended |
| Crash-free rate | > 99.5% |
| App Store rating | > 4.5 stars |

---

## Guiding Principles

1. **The program comes first** — Features map to actual recovery practices
2. **Privacy is sacred** — Everything encrypted, nothing leaves device
3. **Simplicity wins** — Every screen should be obvious
4. **Crisis-ready** — Help is always one tap away
5. **No judgment** — Language is always compassionate
6. **Progress not perfection** — Celebrate effort, not just outcomes

---

**Document Version:** 2.0  
**Created:** November 25, 2024  
**Methodology:** BMAD (Before Making Any Decisions)  
**Status:** Ready for Implementation

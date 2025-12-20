/**
 * Meeting Store
 * Manages meeting attendance logs and insights
 */

import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { getDatabase } from '../db';
import { encryptContent, decryptContent } from '../encryption';
import {
  scheduleMeetingReminder,
  cancelMeetingReminder,
  sendMeetingEncouragement,
} from '../notifications';
import type { MeetingLog, DbMeetingLog, MeetingType, MeetingConnectionMode } from '../types';

interface MeetingInsights {
  totalMeetings: number;
  meetingsThisMonth: number;
  meetingsThisWeek: number;
  averageMoodImprovement: number;
  mostCommonTopic: string | null;
  lastMeetingDate: Date | null;
  daysSinceLastMeeting: number | null;
  shareRate: number; // Percentage of meetings where user shared
}

interface MeetingState {
  meetings: MeetingLog[];
  isLoading: boolean;
  insights: MeetingInsights;
}

interface CreateMeetingData {
  name?: string;
  location?: string;
  type: MeetingType;
  moodBefore: number;
  moodAfter: number;
  keyTakeaways: string;
  topicTags: string[];
  attendedAt?: Date;
  // Enhanced fields
  whatILearned?: string;
  quoteHeard?: string;
  connectionsMode?: MeetingConnectionMode[];
  connectionNotes?: string;
  didShare?: boolean;
  shareReflection?: string;
  regularMeetingId?: string;
}

interface UpdateMeetingData {
  name?: string;
  location?: string;
  type?: MeetingType;
  moodBefore?: number;
  moodAfter?: number;
  keyTakeaways?: string;
  topicTags?: string[];
  attendedAt?: Date;
  // Enhanced fields
  whatILearned?: string;
  quoteHeard?: string;
  connectionsMode?: MeetingConnectionMode[];
  connectionNotes?: string;
  didShare?: boolean;
  shareReflection?: string;
  regularMeetingId?: string;
}

interface MeetingActions {
  loadMeetings: () => Promise<void>;
  createMeeting: (data: CreateMeetingData) => Promise<MeetingLog>;
  updateMeeting: (id: string, data: UpdateMeetingData) => Promise<void>;
  deleteMeeting: (id: string) => Promise<void>;
  getMeetingById: (id: string) => Promise<MeetingLog | null>;
  calculateInsights: () => void;
}

const initialInsights: MeetingInsights = {
  totalMeetings: 0,
  meetingsThisMonth: 0,
  meetingsThisWeek: 0,
  averageMoodImprovement: 0,
  mostCommonTopic: null,
  lastMeetingDate: null,
  daysSinceLastMeeting: null,
  shareRate: 0,
};

export const useMeetingStore = create<MeetingState & MeetingActions>((set, get) => ({
  meetings: [],
  isLoading: false,
  insights: initialInsights,

  loadMeetings: async () => {
    set({ isLoading: true });
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<DbMeetingLog>(
        'SELECT * FROM meeting_logs ORDER BY attended_at DESC'
      );

      const meetings: MeetingLog[] = await Promise.all(
        rows.map(async (row) => ({
          id: row.id,
          name: row.name || undefined,
          location: row.location || undefined,
          type: row.type as MeetingType,
          moodBefore: row.mood_before,
          moodAfter: row.mood_after,
          keyTakeaways: row.key_takeaways ? await decryptContent(row.key_takeaways) : '',
          topicTags: row.topic_tags ? JSON.parse(row.topic_tags) : [],
          attendedAt: new Date(row.attended_at),
          createdAt: new Date(row.created_at),
          // Enhanced fields
          whatILearned: row.what_i_learned ? await decryptContent(row.what_i_learned) : undefined,
          quoteHeard: row.quote_heard ? await decryptContent(row.quote_heard) : undefined,
          connectionsMode: row.connections_mode ? JSON.parse(row.connections_mode) : undefined,
          connectionNotes: row.connection_notes ? await decryptContent(row.connection_notes) : undefined,
          didShare: row.did_share === 1,
          shareReflection: row.share_reflection ? await decryptContent(row.share_reflection) : undefined,
          regularMeetingId: row.regular_meeting_id || undefined,
        }))
      );

      set({ meetings, isLoading: false });
      get().calculateInsights();
    } catch (error) {
      console.error('Failed to load meetings:', error);
      set({ isLoading: false });
    }
  },

  createMeeting: async (data) => {
    const id = uuid();
    const now = new Date();
    const attendedAt = data.attendedAt || now;

    // Encrypt sensitive fields
    const encryptedTakeaways = data.keyTakeaways
      ? await encryptContent(data.keyTakeaways)
      : '';
    const encryptedWhatILearned = data.whatILearned
      ? await encryptContent(data.whatILearned)
      : null;
    const encryptedQuoteHeard = data.quoteHeard
      ? await encryptContent(data.quoteHeard)
      : null;
    const encryptedConnectionNotes = data.connectionNotes
      ? await encryptContent(data.connectionNotes)
      : null;
    const encryptedShareReflection = data.shareReflection
      ? await encryptContent(data.shareReflection)
      : null;

    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO meeting_logs (
        id, name, location, type, mood_before, mood_after,
        key_takeaways, topic_tags, attended_at, created_at,
        what_i_learned, quote_heard, connections_mode, connection_notes,
        did_share, share_reflection, regular_meeting_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        data.name || null,
        data.location || null,
        data.type,
        data.moodBefore,
        data.moodAfter,
        encryptedTakeaways,
        JSON.stringify(data.topicTags),
        attendedAt.toISOString(),
        now.toISOString(),
        encryptedWhatILearned,
        encryptedQuoteHeard,
        data.connectionsMode ? JSON.stringify(data.connectionsMode) : null,
        encryptedConnectionNotes,
        data.didShare ? 1 : 0,
        encryptedShareReflection,
        data.regularMeetingId || null,
      ]
    );

    const meeting: MeetingLog = {
      id,
      name: data.name,
      location: data.location,
      type: data.type,
      moodBefore: data.moodBefore,
      moodAfter: data.moodAfter,
      keyTakeaways: data.keyTakeaways,
      topicTags: data.topicTags,
      attendedAt,
      createdAt: now,
      whatILearned: data.whatILearned,
      quoteHeard: data.quoteHeard,
      connectionsMode: data.connectionsMode,
      connectionNotes: data.connectionNotes,
      didShare: data.didShare || false,
      shareReflection: data.shareReflection,
      regularMeetingId: data.regularMeetingId,
    };

    set((state) => ({
      meetings: [meeting, ...state.meetings],
    }));
    get().calculateInsights();

    // Cancel any pending meeting reminders since user just logged one
    cancelMeetingReminder();

    // Send encouragement if mood improved
    const moodImprovement = data.moodAfter - data.moodBefore;
    if (moodImprovement > 0) {
      sendMeetingEncouragement(moodImprovement);
    }

    return meeting;
  },

  updateMeeting: async (id, data) => {
    const db = await getDatabase();
    const updates: string[] = [];
    const values: (string | number | null)[] = [];

    if (data.name !== undefined) {
      updates.push('name = ?');
      values.push(data.name || null);
    }
    if (data.location !== undefined) {
      updates.push('location = ?');
      values.push(data.location || null);
    }
    if (data.type !== undefined) {
      updates.push('type = ?');
      values.push(data.type);
    }
    if (data.moodBefore !== undefined) {
      updates.push('mood_before = ?');
      values.push(data.moodBefore);
    }
    if (data.moodAfter !== undefined) {
      updates.push('mood_after = ?');
      values.push(data.moodAfter);
    }
    if (data.keyTakeaways !== undefined) {
      updates.push('key_takeaways = ?');
      values.push(await encryptContent(data.keyTakeaways));
    }
    if (data.topicTags !== undefined) {
      updates.push('topic_tags = ?');
      values.push(JSON.stringify(data.topicTags));
    }
    if (data.attendedAt !== undefined) {
      updates.push('attended_at = ?');
      values.push(data.attendedAt.toISOString());
    }
    // Enhanced fields
    if (data.whatILearned !== undefined) {
      updates.push('what_i_learned = ?');
      values.push(data.whatILearned ? await encryptContent(data.whatILearned) : null);
    }
    if (data.quoteHeard !== undefined) {
      updates.push('quote_heard = ?');
      values.push(data.quoteHeard ? await encryptContent(data.quoteHeard) : null);
    }
    if (data.connectionsMode !== undefined) {
      updates.push('connections_mode = ?');
      values.push(data.connectionsMode ? JSON.stringify(data.connectionsMode) : null);
    }
    if (data.connectionNotes !== undefined) {
      updates.push('connection_notes = ?');
      values.push(data.connectionNotes ? await encryptContent(data.connectionNotes) : null);
    }
    if (data.didShare !== undefined) {
      updates.push('did_share = ?');
      values.push(data.didShare ? 1 : 0);
    }
    if (data.shareReflection !== undefined) {
      updates.push('share_reflection = ?');
      values.push(data.shareReflection ? await encryptContent(data.shareReflection) : null);
    }
    if (data.regularMeetingId !== undefined) {
      updates.push('regular_meeting_id = ?');
      values.push(data.regularMeetingId || null);
    }

    if (updates.length === 0) return;

    values.push(id);
    await db.runAsync(
      `UPDATE meeting_logs SET ${updates.join(', ')} WHERE id = ?`,
      values
    );

    set((state) => ({
      meetings: state.meetings.map((m) =>
        m.id === id ? { ...m, ...data } : m
      ),
    }));
    get().calculateInsights();
  },

  deleteMeeting: async (id) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM meeting_logs WHERE id = ?', [id]);

    set((state) => ({
      meetings: state.meetings.filter((m) => m.id !== id),
    }));
    get().calculateInsights();
  },

  getMeetingById: async (id) => {
    const { meetings } = get();
    const cached = meetings.find((m) => m.id === id);
    if (cached) return cached;

    try {
      const db = await getDatabase();
      const row = await db.getFirstAsync<DbMeetingLog>(
        'SELECT * FROM meeting_logs WHERE id = ?',
        [id]
      );

      if (!row) return null;

      return {
        id: row.id,
        name: row.name || undefined,
        location: row.location || undefined,
        type: row.type as MeetingType,
        moodBefore: row.mood_before,
        moodAfter: row.mood_after,
        keyTakeaways: row.key_takeaways ? await decryptContent(row.key_takeaways) : '',
        topicTags: row.topic_tags ? JSON.parse(row.topic_tags) : [],
        attendedAt: new Date(row.attended_at),
        createdAt: new Date(row.created_at),
        // Enhanced fields
        whatILearned: row.what_i_learned ? await decryptContent(row.what_i_learned) : undefined,
        quoteHeard: row.quote_heard ? await decryptContent(row.quote_heard) : undefined,
        connectionsMode: row.connections_mode ? JSON.parse(row.connections_mode) : undefined,
        connectionNotes: row.connection_notes ? await decryptContent(row.connection_notes) : undefined,
        didShare: row.did_share === 1,
        shareReflection: row.share_reflection ? await decryptContent(row.share_reflection) : undefined,
        regularMeetingId: row.regular_meeting_id || undefined,
      };
    } catch (error) {
      console.error('Failed to get meeting:', error);
      return null;
    }
  },

  calculateInsights: () => {
    const { meetings } = get();
    const now = new Date();

    // Date boundaries
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);

    const monthAgo = new Date(now);
    monthAgo.setMonth(now.getMonth() - 1);

    // Calculate stats
    const meetingsThisWeek = meetings.filter(
      (m) => new Date(m.attendedAt) >= weekAgo
    ).length;

    const meetingsThisMonth = meetings.filter(
      (m) => new Date(m.attendedAt) >= monthAgo
    ).length;

    // Average mood improvement
    const moodImprovements = meetings.map((m) => m.moodAfter - m.moodBefore);
    const averageMoodImprovement =
      moodImprovements.length > 0
        ? moodImprovements.reduce((a, b) => a + b, 0) / moodImprovements.length
        : 0;

    // Most common topic
    const topicCounts: Record<string, number> = {};
    meetings.forEach((m) => {
      m.topicTags.forEach((tag) => {
        topicCounts[tag] = (topicCounts[tag] || 0) + 1;
      });
    });
    const sortedTopics = Object.entries(topicCounts).sort((a, b) => b[1] - a[1]);
    const mostCommonTopic = sortedTopics.length > 0 ? sortedTopics[0][0] : null;

    // Last meeting
    const lastMeeting = meetings[0];
    const lastMeetingDate = lastMeeting ? new Date(lastMeeting.attendedAt) : null;
    const daysSinceLastMeeting = lastMeetingDate
      ? Math.floor((now.getTime() - lastMeetingDate.getTime()) / (1000 * 60 * 60 * 24))
      : null;

    // Share rate
    const meetingsWithShares = meetings.filter((m) => m.didShare).length;
    const shareRate = meetings.length > 0 ? (meetingsWithShares / meetings.length) * 100 : 0;

    set({
      insights: {
        totalMeetings: meetings.length,
        meetingsThisMonth,
        meetingsThisWeek,
        averageMoodImprovement,
        mostCommonTopic,
        lastMeetingDate,
        daysSinceLastMeeting,
        shareRate,
      },
    });

    // Schedule a gentle reminder if it's been more than 7 days
    if (daysSinceLastMeeting !== null && daysSinceLastMeeting > 7) {
      scheduleMeetingReminder(daysSinceLastMeeting);
    }
  },
}));

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
import type { MeetingLog, DbMeetingLog, MeetingType } from '../types';

interface MeetingInsights {
  totalMeetings: number;
  meetingsThisMonth: number;
  meetingsThisWeek: number;
  averageMoodImprovement: number;
  mostCommonTopic: string | null;
  lastMeetingDate: Date | null;
  daysSinceLastMeeting: number | null;
}

interface MeetingState {
  meetings: MeetingLog[];
  isLoading: boolean;
  insights: MeetingInsights;
}

interface MeetingActions {
  loadMeetings: () => Promise<void>;
  createMeeting: (data: {
    name?: string;
    location?: string;
    type: MeetingType;
    moodBefore: number;
    moodAfter: number;
    keyTakeaways: string;
    topicTags: string[];
    attendedAt?: Date;
  }) => Promise<MeetingLog>;
  updateMeeting: (id: string, data: Partial<{
    name: string;
    location: string;
    type: MeetingType;
    moodBefore: number;
    moodAfter: number;
    keyTakeaways: string;
    topicTags: string[];
    attendedAt: Date;
  }>) => Promise<void>;
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

    const encryptedTakeaways = data.keyTakeaways
      ? await encryptContent(data.keyTakeaways)
      : '';

    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO meeting_logs (
        id, name, location, type, mood_before, mood_after,
        key_takeaways, topic_tags, attended_at, created_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

    set({
      insights: {
        totalMeetings: meetings.length,
        meetingsThisMonth,
        meetingsThisWeek,
        averageMoodImprovement,
        mostCommonTopic,
        lastMeetingDate,
        daysSinceLastMeeting,
      },
    });

    // Schedule a gentle reminder if it's been more than 7 days
    if (daysSinceLastMeeting !== null && daysSinceLastMeeting > 7) {
      scheduleMeetingReminder(daysSinceLastMeeting);
    }
  },
}));


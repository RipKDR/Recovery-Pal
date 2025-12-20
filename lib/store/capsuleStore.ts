/**
 * Time Capsule Store
 * Manages time capsule entries - letters to future self
 */

import { create } from 'zustand';
import { v4 as uuid } from 'uuid';
import { getDatabase } from '../db';
import { encryptContent, decryptContent } from '../encryption';
import { scheduleTimeCapsuleNotification, cancelTimeCapsuleNotification } from '../notifications';
import type { TimeCapsule, DbTimeCapsule } from '../types';

interface CapsuleState {
  capsules: TimeCapsule[];
  isLoading: boolean;
  unlockedCapsule: TimeCapsule | null;
  decryptedContent: string | null;
}

interface CapsuleActions {
  loadCapsules: () => Promise<void>;
  createCapsule: (title: string, content: string, unlockDate: Date) => Promise<TimeCapsule>;
  unlockCapsule: (id: string) => Promise<string | null>;
  deleteCapsule: (id: string) => Promise<void>;
  checkForUnlockableCapsules: () => Promise<TimeCapsule[]>;
  getCapsuleById: (id: string) => Promise<TimeCapsule | null>;
  clearUnlockedCapsule: () => void;
}

export const useCapsuleStore = create<CapsuleState & CapsuleActions>((set, get) => ({
  capsules: [],
  isLoading: false,
  unlockedCapsule: null,
  decryptedContent: null,

  loadCapsules: async () => {
    set({ isLoading: true });
    try {
      const db = await getDatabase();
      const rows = await db.getAllAsync<DbTimeCapsule>(
        'SELECT * FROM time_capsules ORDER BY unlock_date ASC'
      );

      const capsules: TimeCapsule[] = rows.map((row) => ({
        id: row.id,
        title: row.title,
        content: row.content,
        unlockDate: new Date(row.unlock_date),
        isUnlocked: row.is_unlocked === 1,
        unlockedAt: row.unlocked_at ? new Date(row.unlocked_at) : undefined,
        createdAt: new Date(row.created_at),
      }));

      set({ capsules, isLoading: false });
    } catch (error) {
      console.error('Failed to load capsules:', error);
      set({ isLoading: false });
    }
  },

  createCapsule: async (title, content, unlockDate) => {
    const id = uuid();
    const now = new Date();

    const encryptedContent = await encryptContent(content);

    const db = await getDatabase();
    await db.runAsync(
      `INSERT INTO time_capsules (id, title, content, unlock_date, is_unlocked, created_at)
       VALUES (?, ?, ?, ?, 0, ?)`,
      [id, title, encryptedContent, unlockDate.toISOString(), now.toISOString()]
    );

    const capsule: TimeCapsule = {
      id,
      title,
      content: encryptedContent,
      unlockDate,
      isUnlocked: false,
      createdAt: now,
    };

    set((state) => ({
      capsules: [...state.capsules, capsule].sort(
        (a, b) => a.unlockDate.getTime() - b.unlockDate.getTime()
      ),
    }));

    // Schedule notification for unlock date
    await scheduleTimeCapsuleNotification(id, title, unlockDate);

    return capsule;
  },

  unlockCapsule: async (id) => {
    const db = await getDatabase();
    const now = new Date();

    // Get the capsule
    const { capsules } = get();
    const capsule = capsules.find((c) => c.id === id);

    if (!capsule) return null;

    // Check if it's time to unlock
    if (capsule.unlockDate > now) {
      return null; // Not yet unlockable
    }

    // Decrypt content
    const decrypted = await decryptContent(capsule.content);

    // Mark as unlocked in database
    await db.runAsync(
      `UPDATE time_capsules SET is_unlocked = 1, unlocked_at = ? WHERE id = ?`,
      [now.toISOString(), id]
    );

    // Update state
    const updatedCapsule = {
      ...capsule,
      isUnlocked: true,
      unlockedAt: now,
    };

    set((state) => ({
      capsules: state.capsules.map((c) => (c.id === id ? updatedCapsule : c)),
      unlockedCapsule: updatedCapsule,
      decryptedContent: decrypted,
    }));

    // Cancel the notification since it's now unlocked
    await cancelTimeCapsuleNotification(id);

    return decrypted;
  },

  deleteCapsule: async (id) => {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM time_capsules WHERE id = ?', [id]);

    set((state) => ({
      capsules: state.capsules.filter((c) => c.id !== id),
    }));

    // Cancel any scheduled notification
    await cancelTimeCapsuleNotification(id);
  },

  checkForUnlockableCapsules: async () => {
    const { capsules } = get();
    const now = new Date();

    return capsules.filter(
      (c) => !c.isUnlocked && c.unlockDate <= now
    );
  },

  getCapsuleById: async (id) => {
    const { capsules } = get();
    return capsules.find((c) => c.id === id) || null;
  },

  clearUnlockedCapsule: () => {
    set({ unlockedCapsule: null, decryptedContent: null });
  },
}));


/**
 * Share Prep Store
 * Temporary storage for meeting share preparation notes
 * Notes persist until user logs a meeting or clears them
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SharePrepNotes {
  topic: string;
  gratitude: string;
  struggle: string;
  experience: string;
  other: string;
  lastUpdated: Date | null;
}

interface SharePrepState {
  notes: SharePrepNotes;
  isLoading: boolean;
}

interface SharePrepActions {
  updateNote: (field: keyof Omit<SharePrepNotes, 'lastUpdated'>, value: string) => void;
  clearNotes: () => void;
  hasContent: () => boolean;
  getPreviewText: () => string;
}

const initialNotes: SharePrepNotes = {
  topic: '',
  gratitude: '',
  struggle: '',
  experience: '',
  other: '',
  lastUpdated: null,
};

export const useSharePrepStore = create<SharePrepState & SharePrepActions>()(
  persist(
    (set, get) => ({
      notes: initialNotes,
      isLoading: false,

      updateNote: (field, value) => {
        set((state) => ({
          notes: {
            ...state.notes,
            [field]: value,
            lastUpdated: new Date(),
          },
        }));
      },

      clearNotes: () => {
        set({ notes: initialNotes });
      },

      hasContent: () => {
        const { notes } = get();
        return !!(
          notes.topic.trim() ||
          notes.gratitude.trim() ||
          notes.struggle.trim() ||
          notes.experience.trim() ||
          notes.other.trim()
        );
      },

      getPreviewText: () => {
        const { notes } = get();
        const parts: string[] = [];
        
        if (notes.topic.trim()) parts.push(notes.topic.trim());
        if (notes.gratitude.trim()) parts.push(notes.gratitude.trim());
        if (notes.struggle.trim()) parts.push(notes.struggle.trim());
        if (notes.experience.trim()) parts.push(notes.experience.trim());
        if (notes.other.trim()) parts.push(notes.other.trim());
        
        return parts.join('\n\n');
      },
    }),
    {
      name: 'share-prep-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ notes: state.notes }),
    }
  )
);


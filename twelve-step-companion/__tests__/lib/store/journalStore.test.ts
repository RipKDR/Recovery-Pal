/**
 * Journal Store Tests
 * Tests for journal CRUD operations and state management
 */

import { useJournalStore } from '../../../lib/store/journalStore';
import * as models from '../../../lib/db/models';

// Mock the database models
jest.mock('../../../lib/db/models', () => ({
  createJournalEntry: jest.fn(),
  getJournalEntries: jest.fn(),
  getJournalEntryById: jest.fn(),
  deleteJournalEntry: jest.fn(),
  decryptJournalContent: jest.fn(),
}));

describe('journalStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useJournalStore.setState({
      entries: [],
      currentEntry: null,
      decryptedContent: null,
      isLoading: false,
      error: null,
      filterType: null,
      searchQuery: '',
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useJournalStore.getState();
      
      expect(state.entries).toEqual([]);
      expect(state.currentEntry).toBeNull();
      expect(state.decryptedContent).toBeNull();
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
      expect(state.filterType).toBeNull();
      expect(state.searchQuery).toBe('');
    });
  });

  describe('loadEntries', () => {
    it('should load entries successfully', async () => {
      const mockEntries = [
        {
          id: '1',
          type: 'freeform',
          content: 'encrypted-content',
          emotionTags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (models.getJournalEntries as jest.Mock).mockResolvedValue(mockEntries);

      await useJournalStore.getState().loadEntries();

      const state = useJournalStore.getState();
      expect(state.entries).toEqual(mockEntries);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });

    it('should handle load error', async () => {
      (models.getJournalEntries as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await useJournalStore.getState().loadEntries();

      const state = useJournalStore.getState();
      expect(state.error).toBe('Failed to load journal entries');
      expect(state.isLoading).toBe(false);
    });

    it('should filter entries by type', async () => {
      const mockEntries = [
        {
          id: '1',
          type: 'step-work',
          content: 'encrypted-content',
          emotionTags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      (models.getJournalEntries as jest.Mock).mockResolvedValue(mockEntries);

      await useJournalStore.getState().loadEntries('step-work');

      expect(models.getJournalEntries).toHaveBeenCalledWith(50, 0, 'step-work');
      
      const state = useJournalStore.getState();
      expect(state.filterType).toBe('step-work');
    });
  });

  describe('loadEntry', () => {
    it('should load a single entry and decrypt content', async () => {
      const mockEntry = {
        id: '1',
        type: 'freeform',
        content: 'encrypted-content',
        emotionTags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (models.getJournalEntryById as jest.Mock).mockResolvedValue(mockEntry);
      (models.decryptJournalContent as jest.Mock).mockResolvedValue(
        'Decrypted journal content'
      );

      await useJournalStore.getState().loadEntry('1');

      const state = useJournalStore.getState();
      expect(state.currentEntry).toEqual(mockEntry);
      expect(state.decryptedContent).toBe('Decrypted journal content');
      expect(state.isLoading).toBe(false);
    });

    it('should handle entry not found', async () => {
      (models.getJournalEntryById as jest.Mock).mockResolvedValue(null);

      await useJournalStore.getState().loadEntry('non-existent');

      const state = useJournalStore.getState();
      expect(state.error).toBe('Entry not found');
      expect(state.currentEntry).toBeNull();
    });
  });

  describe('createEntry', () => {
    it('should create a new entry and add to state', async () => {
      const mockEntry = {
        id: 'new-entry',
        type: 'freeform',
        content: 'encrypted-content',
        emotionTags: ['grateful'],
        moodBefore: 5,
        moodAfter: 7,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (models.createJournalEntry as jest.Mock).mockResolvedValue(mockEntry);

      const result = await useJournalStore.getState().createEntry(
        'freeform',
        'My journal content',
        {
          emotionTags: ['grateful'],
          moodBefore: 5,
          moodAfter: 7,
        }
      );

      expect(result).toEqual(mockEntry);
      expect(models.createJournalEntry).toHaveBeenCalledWith(
        'freeform',
        'My journal content',
        {
          emotionTags: ['grateful'],
          moodBefore: 5,
          moodAfter: 7,
        }
      );

      const state = useJournalStore.getState();
      expect(state.entries).toContainEqual(mockEntry);
    });

    it('should handle create error', async () => {
      (models.createJournalEntry as jest.Mock).mockRejectedValue(
        new Error('Create failed')
      );

      await expect(
        useJournalStore.getState().createEntry('freeform', 'content')
      ).rejects.toThrow();

      const state = useJournalStore.getState();
      expect(state.error).toBe('Failed to create entry');
    });
  });

  describe('deleteEntry', () => {
    it('should delete entry and remove from state', async () => {
      const existingEntry = {
        id: '1',
        type: 'freeform',
        content: 'encrypted-content',
        emotionTags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Set initial state with an entry
      useJournalStore.setState({ entries: [existingEntry] });

      (models.deleteJournalEntry as jest.Mock).mockResolvedValue(undefined);

      await useJournalStore.getState().deleteEntry('1');

      const state = useJournalStore.getState();
      expect(state.entries).toEqual([]);
      expect(models.deleteJournalEntry).toHaveBeenCalledWith('1');
    });
  });

  describe('setFilterType', () => {
    it('should update filter type and reload entries', async () => {
      (models.getJournalEntries as jest.Mock).mockResolvedValue([]);

      useJournalStore.getState().setFilterType('meeting-reflection');

      // Wait for async loadEntries
      await new Promise((resolve) => setTimeout(resolve, 0));

      const state = useJournalStore.getState();
      expect(state.filterType).toBe('meeting-reflection');
      expect(models.getJournalEntries).toHaveBeenCalledWith(
        50,
        0,
        'meeting-reflection'
      );
    });

    it('should clear filter when set to null', async () => {
      (models.getJournalEntries as jest.Mock).mockResolvedValue([]);

      useJournalStore.setState({ filterType: 'freeform' });
      useJournalStore.getState().setFilterType(null);

      // Wait for async loadEntries
      await new Promise((resolve) => setTimeout(resolve, 0));

      const state = useJournalStore.getState();
      expect(state.filterType).toBeNull();
    });
  });

  describe('clearCurrentEntry', () => {
    it('should clear current entry and decrypted content', () => {
      useJournalStore.setState({
        currentEntry: {
          id: '1',
          type: 'freeform',
          content: 'encrypted',
          emotionTags: [],
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        decryptedContent: 'Decrypted content',
      });

      useJournalStore.getState().clearCurrentEntry();

      const state = useJournalStore.getState();
      expect(state.currentEntry).toBeNull();
      expect(state.decryptedContent).toBeNull();
    });
  });
});


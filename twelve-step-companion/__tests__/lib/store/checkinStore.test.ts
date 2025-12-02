/**
 * Check-in Store Tests
 * Tests for daily check-in operations and streak tracking
 */

import { useCheckinStore } from '../../../lib/store/checkinStore';
import * as models from '../../../lib/db/models';

// Mock the database models
jest.mock('../../../lib/db/models', () => ({
  createDailyCheckin: jest.fn(),
  getTodayCheckin: jest.fn(),
  getCheckinHistory: jest.fn(),
}));

describe('checkinStore', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useCheckinStore.setState({
      todayCheckin: null,
      history: [],
      isLoading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useCheckinStore.getState();
      
      expect(state.todayCheckin).toBeNull();
      expect(state.history).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('loadTodayCheckin', () => {
    it('should load today check-in if exists', async () => {
      const mockCheckin = {
        id: '1',
        date: new Date(),
        mood: 7,
        cravingLevel: 2,
        isCheckedIn: true,
        createdAt: new Date(),
      };

      (models.getTodayCheckin as jest.Mock).mockResolvedValue(mockCheckin);

      await useCheckinStore.getState().loadTodayCheckin();

      const state = useCheckinStore.getState();
      expect(state.todayCheckin).toEqual(mockCheckin);
      expect(state.isLoading).toBe(false);
    });

    it('should handle no check-in for today', async () => {
      (models.getTodayCheckin as jest.Mock).mockResolvedValue(null);

      await useCheckinStore.getState().loadTodayCheckin();

      const state = useCheckinStore.getState();
      expect(state.todayCheckin).toBeNull();
    });
  });

  describe('createCheckin', () => {
    it('should create a new check-in', async () => {
      const mockCheckin = {
        id: '1',
        date: new Date(),
        mood: 8,
        cravingLevel: 1,
        gratitude: 'encrypted-gratitude',
        isCheckedIn: true,
        createdAt: new Date(),
      };

      (models.createDailyCheckin as jest.Mock).mockResolvedValue(mockCheckin);

      await useCheckinStore.getState().createCheckin(8, 1, 'I am grateful for my recovery');

      expect(models.createDailyCheckin).toHaveBeenCalledWith(
        8,
        1,
        'I am grateful for my recovery'
      );

      const state = useCheckinStore.getState();
      expect(state.todayCheckin).toEqual(mockCheckin);
    });

    it('should handle create error', async () => {
      (models.createDailyCheckin as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await useCheckinStore.getState().createCheckin(5, 3);

      const state = useCheckinStore.getState();
      expect(state.error).toBe('Failed to save check-in');
    });
  });

  describe('loadHistory', () => {
    it('should load check-in history', async () => {
      const mockHistory = [
        {
          id: '1',
          date: new Date(),
          mood: 7,
          cravingLevel: 2,
          isCheckedIn: true,
          createdAt: new Date(),
        },
        {
          id: '2',
          date: new Date(Date.now() - 86400000), // Yesterday
          mood: 6,
          cravingLevel: 3,
          isCheckedIn: true,
          createdAt: new Date(),
        },
      ];

      (models.getCheckinHistory as jest.Mock).mockResolvedValue(mockHistory);

      await useCheckinStore.getState().loadHistory(30);

      expect(models.getCheckinHistory).toHaveBeenCalledWith(30);

      const state = useCheckinStore.getState();
      expect(state.history).toEqual(mockHistory);
    });
  });

  describe('hasCheckedInToday', () => {
    it('should return true when checked in today', () => {
      useCheckinStore.setState({
        todayCheckin: {
          id: '1',
          date: new Date(),
          mood: 7,
          cravingLevel: 2,
          isCheckedIn: true,
          createdAt: new Date(),
        },
      });

      const result = useCheckinStore.getState().hasCheckedInToday();
      expect(result).toBe(true);
    });

    it('should return false when not checked in', () => {
      useCheckinStore.setState({ todayCheckin: null });

      const result = useCheckinStore.getState().hasCheckedInToday();
      expect(result).toBe(false);
    });
  });

  describe('getCheckinStreak', () => {
    it('should calculate streak from consecutive days', () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const mockHistory = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        mockHistory.push({
          id: `${i}`,
          date,
          mood: 7,
          cravingLevel: 2,
          isCheckedIn: true,
          createdAt: date,
        });
      }

      useCheckinStore.setState({ history: mockHistory });

      const streak = useCheckinStore.getState().getCheckinStreak();
      expect(streak).toBeGreaterThanOrEqual(7);
    });

    it('should return 0 when no history', () => {
      useCheckinStore.setState({ history: [] });

      const streak = useCheckinStore.getState().getCheckinStreak();
      expect(streak).toBe(0);
    });
  });

  describe('getAverageMood', () => {
    it('should calculate average mood from history', () => {
      const mockHistory = [
        { id: '1', date: new Date(), mood: 8, cravingLevel: 2, isCheckedIn: true, createdAt: new Date() },
        { id: '2', date: new Date(), mood: 6, cravingLevel: 3, isCheckedIn: true, createdAt: new Date() },
        { id: '3', date: new Date(), mood: 7, cravingLevel: 1, isCheckedIn: true, createdAt: new Date() },
      ];

      useCheckinStore.setState({ history: mockHistory });

      const average = useCheckinStore.getState().getAverageMood();
      expect(average).toBe(7); // (8 + 6 + 7) / 3 = 7
    });

    it('should return 0 when no history', () => {
      useCheckinStore.setState({ history: [] });

      const average = useCheckinStore.getState().getAverageMood();
      expect(average).toBe(0);
    });
  });
});


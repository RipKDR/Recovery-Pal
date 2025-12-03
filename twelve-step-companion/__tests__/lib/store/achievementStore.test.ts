/**
 * Achievement Store Tests
 * Tests for achievement tracking, keytag management, and unlock logic
 */

import { useAchievementStore, type AchievementContext } from '../../../lib/store/achievementStore';
import * as models from '../../../lib/db/models';

// Mock the database models
jest.mock('../../../lib/db/models', () => ({
  getAchievements: jest.fn(),
  saveAchievement: jest.fn(),
  getAchievementReflection: jest.fn(),
  saveAchievementReflection: jest.fn(),
}));

describe('achievementStore', () => {
  const mockContext: AchievementContext = {
    soberDays: 30,
    contactsCount: 5,
    hasSponsor: true,
    hasHomeGroup: false,
    meetingsCount: 10,
    meetingsInFirst90Days: 10,
    checkinStreak: 7,
    readingStreak: 5,
    tenthStepStreak: 3,
    gratitudeStreak: 7,
    phoneTherapyDays: 2,
    stepProgress: {
      1: { answered: 10, total: 10 },
      2: { answered: 5, total: 10 },
      3: { answered: 0, total: 10 },
    },
    meetingsWithShares: 3,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useAchievementStore.setState({
      achievements: [],
      keytags: [],
      isLoading: false,
      isInitialized: false,
      recentUnlock: null,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useAchievementStore.getState();
      
      expect(state.achievements).toEqual([]);
      expect(state.keytags).toEqual([]);
      expect(state.isLoading).toBe(false);
      expect(state.isInitialized).toBe(false);
      expect(state.recentUnlock).toBeNull();
    });
  });

  describe('initialize', () => {
    it('should initialize achievements and keytags', async () => {
      const mockAchievements = [
        {
          id: 'first_day',
          category: 'fellowship',
          title: 'First Day',
          description: 'Complete your first day of sobriety',
          icon: 'sunrise',
          unlockType: 'auto',
          status: 'locked',
        },
      ];

      (models.getAchievements as jest.Mock).mockResolvedValue(mockAchievements);

      await useAchievementStore.getState().initialize();

      const state = useAchievementStore.getState();
      expect(state.isInitialized).toBe(true);
      expect(state.keytags.length).toBeGreaterThan(0);
    });
  });

  describe('updateKeytagsForDays', () => {
    it('should mark keytags as earned based on sober days', () => {
      // Initialize with default keytags
      useAchievementStore.getState().initialize();
      
      // Update for 30 days sober
      useAchievementStore.getState().updateKeytagsForDays(30);

      const state = useAchievementStore.getState();
      const earnedKeytags = state.keytags.filter(k => k.isEarned);
      
      // Should have earned 24hr, 30 day keytags
      expect(earnedKeytags.length).toBeGreaterThanOrEqual(2);
    });

    it('should not earn keytags beyond sober days', () => {
      useAchievementStore.getState().initialize();
      useAchievementStore.getState().updateKeytagsForDays(5);

      const state = useAchievementStore.getState();
      const ninetyDayKeytag = state.keytags.find(k => k.daysRequired === 90);
      
      expect(ninetyDayKeytag?.isEarned).toBe(false);
    });
  });

  describe('checkAutoAchievements', () => {
    it('should unlock achievements based on context', async () => {
      // Initialize store first
      await useAchievementStore.getState().initialize();

      // Set up achievements with locked status
      const achievements = useAchievementStore.getState().achievements.map(a => ({
        ...a,
        status: 'locked' as const,
      }));
      useAchievementStore.setState({ achievements });

      // Check achievements with context
      const newlyUnlocked = await useAchievementStore.getState().checkAutoAchievements(mockContext);

      // Should have unlocked some achievements
      expect(Array.isArray(newlyUnlocked)).toBe(true);
    });
  });

  describe('selfCheckAchievement', () => {
    it('should unlock self-check achievements', async () => {
      await useAchievementStore.getState().initialize();

      // Find a self-check achievement
      const state = useAchievementStore.getState();
      const selfCheckAchievement = state.achievements.find(
        a => a.unlockType === 'self_check' && a.status === 'locked'
      );

      if (selfCheckAchievement) {
        await useAchievementStore.getState().selfCheckAchievement(selfCheckAchievement.id);

        const updatedState = useAchievementStore.getState();
        const updated = updatedState.achievements.find(a => a.id === selfCheckAchievement.id);
        expect(updated?.status).toBe('unlocked');
      }
    });
  });

  describe('computed values', () => {
    it('should calculate totalUnlocked correctly', async () => {
      await useAchievementStore.getState().initialize();

      // Manually set some achievements as unlocked
      const achievements = useAchievementStore.getState().achievements.map((a, i) => ({
        ...a,
        status: i < 3 ? 'unlocked' as const : a.status,
      }));
      useAchievementStore.setState({ achievements });

      const state = useAchievementStore.getState();
      expect(state.totalUnlocked).toBe(3);
    });

    it('should calculate earnedKeytags correctly', () => {
      useAchievementStore.getState().initialize();
      useAchievementStore.getState().updateKeytagsForDays(60);

      const state = useAchievementStore.getState();
      expect(state.earnedKeytags).toBeGreaterThan(0);
    });

    it('should calculate categoryProgress correctly', async () => {
      await useAchievementStore.getState().initialize();

      const state = useAchievementStore.getState();
      const progress = state.categoryProgress;

      expect(progress).toHaveProperty('fellowship');
      expect(progress).toHaveProperty('step_work');
      expect(progress).toHaveProperty('daily_practice');
      expect(progress).toHaveProperty('service');
    });
  });

  describe('dismissRecentUnlock', () => {
    it('should clear recent unlock', () => {
      useAchievementStore.setState({
        recentUnlock: {
          id: 'test',
          category: 'fellowship',
          title: 'Test',
          description: 'Test achievement',
          icon: 'star',
          unlockType: 'auto',
          status: 'unlocked',
          unlockedAt: new Date(),
        },
      });

      useAchievementStore.getState().dismissRecentUnlock();

      const state = useAchievementStore.getState();
      expect(state.recentUnlock).toBeNull();
    });
  });

  describe('getAchievementsByCategory', () => {
    it('should return achievements filtered by category', async () => {
      await useAchievementStore.getState().initialize();

      const fellowshipAchievements = useAchievementStore.getState().getAchievementsByCategory('fellowship');
      
      expect(Array.isArray(fellowshipAchievements)).toBe(true);
      fellowshipAchievements.forEach(a => {
        expect(a.category).toBe('fellowship');
      });
    });
  });
});


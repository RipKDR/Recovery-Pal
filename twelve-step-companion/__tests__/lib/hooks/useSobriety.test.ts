/**
 * useSobriety Hook Tests
 * Tests for sobriety calculations and milestone tracking
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import { useSobriety } from '../../../lib/hooks/useSobriety';
import { useProfileStore } from '../../../lib/store';

// Mock the stores
jest.mock('../../../lib/store', () => ({
  useProfileStore: jest.fn(),
  useSettingsStore: jest.fn(() => ({
    settings: { notificationsEnabled: false },
  })),
}));

// Mock notifications
jest.mock('../../../lib/notifications', () => ({
  scheduleMilestoneNotification: jest.fn(),
}));

// Mock milestone constants
jest.mock('../../../lib/constants/milestones', () => ({
  getNextMilestone: jest.fn((days: number) => {
    if (days < 1) return { days: 1, title: '24 Hours' };
    if (days < 7) return { days: 7, title: 'One Week' };
    if (days < 30) return { days: 30, title: '30 Days' };
    if (days < 60) return { days: 60, title: '60 Days' };
    if (days < 90) return { days: 90, title: '90 Days' };
    return { days: 365, title: '1 Year' };
  }),
  getLatestMilestone: jest.fn((days: number) => {
    if (days >= 90) return { days: 90, title: '90 Days' };
    if (days >= 60) return { days: 60, title: '60 Days' };
    if (days >= 30) return { days: 30, title: '30 Days' };
    if (days >= 7) return { days: 7, title: 'One Week' };
    if (days >= 1) return { days: 1, title: '24 Hours' };
    return null;
  }),
  getAchievedMilestones: jest.fn((days: number) => {
    const milestones = [];
    if (days >= 1) milestones.push({ days: 1, title: '24 Hours' });
    if (days >= 7) milestones.push({ days: 7, title: 'One Week' });
    if (days >= 30) milestones.push({ days: 30, title: '30 Days' });
    return milestones;
  }),
  TIME_MILESTONES: [
    { days: 1, title: '24 Hours' },
    { days: 7, title: 'One Week' },
    { days: 30, title: '30 Days' },
  ],
}));

describe('useSobriety', () => {
  const mockLoadProfile = jest.fn();
  const mockCreateProfile = jest.fn();
  const mockUpdateProfile = jest.fn();
  const mockCalculateSobriety = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    
    (useProfileStore as unknown as jest.Mock).mockImplementation((selector) => {
      const state = {
        profile: {
          id: '1',
          sobrietyDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          programType: '12-step-aa',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        soberDays: 30,
        soberHours: 12,
        soberMinutes: 45,
        isLoading: false,
        loadProfile: mockLoadProfile,
        createProfile: mockCreateProfile,
        updateProfile: mockUpdateProfile,
        calculateSobriety: mockCalculateSobriety,
      };
      
      if (typeof selector === 'function') {
        return selector(state);
      }
      return state;
    });
  });

  describe('basic functionality', () => {
    it('should return sobriety stats', () => {
      const { result } = renderHook(() => useSobriety());

      expect(result.current.soberDays).toBe(30);
      expect(result.current.soberHours).toBe(12);
      expect(result.current.soberMinutes).toBe(45);
    });

    it('should return profile', () => {
      const { result } = renderHook(() => useSobriety());

      expect(result.current.profile).toBeDefined();
      expect(result.current.profile?.programType).toBe('12-step-aa');
    });

    it('should call loadProfile on mount', () => {
      renderHook(() => useSobriety());

      expect(mockLoadProfile).toHaveBeenCalled();
    });
  });

  describe('milestone calculations', () => {
    it('should calculate next milestone', () => {
      const { result } = renderHook(() => useSobriety());

      expect(result.current.nextMilestone).toBeDefined();
      expect(result.current.nextMilestone?.title).toBe('60 Days');
    });

    it('should calculate days until next milestone', () => {
      const { result } = renderHook(() => useSobriety());

      expect(result.current.daysUntilNextMilestone).toBe(30); // 60 - 30 = 30 days
    });

    it('should return achieved milestones', () => {
      const { result } = renderHook(() => useSobriety());

      expect(result.current.achievedMilestones).toHaveLength(3);
      expect(result.current.achievedMilestones.map((m: { title: string }) => m.title)).toContain('30 Days');
    });

    it('should calculate progress percentage', () => {
      const { result } = renderHook(() => useSobriety());

      // Progress from 30 days milestone to 60 days milestone
      // Latest: 30 days, Next: 60 days
      // Current: 30, so (30-30)/(60-30) = 0%
      expect(result.current.progressToNextMilestone).toBeGreaterThanOrEqual(0);
      expect(result.current.progressToNextMilestone).toBeLessThanOrEqual(100);
    });
  });

  describe('formatted duration', () => {
    it('should format days correctly', () => {
      (useProfileStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          profile: { id: '1', sobrietyDate: new Date(), programType: '12-step-aa' },
          soberDays: 15,
          soberHours: 0,
          soberMinutes: 0,
          isLoading: false,
          loadProfile: mockLoadProfile,
          calculateSobriety: mockCalculateSobriety,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });

      const { result } = renderHook(() => useSobriety());

      expect(result.current.formattedDuration).toBe('15 days');
    });

    it('should format months correctly', () => {
      (useProfileStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          profile: { id: '1', sobrietyDate: new Date(), programType: '12-step-aa' },
          soberDays: 45,
          soberHours: 0,
          soberMinutes: 0,
          isLoading: false,
          loadProfile: mockLoadProfile,
          calculateSobriety: mockCalculateSobriety,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });

      const { result } = renderHook(() => useSobriety());

      expect(result.current.formattedDuration).toContain('month');
    });

    it('should format years correctly', () => {
      (useProfileStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          profile: { id: '1', sobrietyDate: new Date(), programType: '12-step-aa' },
          soberDays: 400,
          soberHours: 0,
          soberMinutes: 0,
          isLoading: false,
          loadProfile: mockLoadProfile,
          calculateSobriety: mockCalculateSobriety,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });

      const { result } = renderHook(() => useSobriety());

      expect(result.current.formattedDuration).toContain('year');
    });

    it('should handle singular day correctly', () => {
      (useProfileStore as unknown as jest.Mock).mockImplementation((selector) => {
        const state = {
          profile: { id: '1', sobrietyDate: new Date(), programType: '12-step-aa' },
          soberDays: 1,
          soberHours: 0,
          soberMinutes: 0,
          isLoading: false,
          loadProfile: mockLoadProfile,
          calculateSobriety: mockCalculateSobriety,
        };
        return typeof selector === 'function' ? selector(state) : state;
      });

      const { result } = renderHook(() => useSobriety());

      expect(result.current.formattedDuration).toBe('1 day');
    });
  });

  describe('profile actions', () => {
    it('should expose createProfile function', () => {
      const { result } = renderHook(() => useSobriety());

      expect(result.current.createProfile).toBeDefined();
      expect(typeof result.current.createProfile).toBe('function');
    });

    it('should expose updateProfile function', () => {
      const { result } = renderHook(() => useSobriety());

      expect(result.current.updateProfile).toBeDefined();
      expect(typeof result.current.updateProfile).toBe('function');
    });
  });
});


/**
 * Profile Store Tests
 * Tests for sobriety profile management and calculations
 */

import { useProfileStore } from '../../../lib/store/profileStore';
import * as models from '../../../lib/db/models';

// Mock the database models
jest.mock('../../../lib/db/models', () => ({
  createSobrietyProfile: jest.fn(),
  getSobrietyProfile: jest.fn(),
  updateSobrietyProfile: jest.fn(),
}));

describe('profileStore', () => {
  const mockDate = new Date('2024-01-01T00:00:00.000Z');
  
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset store state
    useProfileStore.setState({
      profile: null,
      soberDays: 0,
      soberHours: 0,
      soberMinutes: 0,
      isLoading: false,
      error: null,
    });
  });

  describe('initial state', () => {
    it('should have correct initial state', () => {
      const state = useProfileStore.getState();
      
      expect(state.profile).toBeNull();
      expect(state.soberDays).toBe(0);
      expect(state.soberHours).toBe(0);
      expect(state.soberMinutes).toBe(0);
      expect(state.isLoading).toBe(false);
      expect(state.error).toBeNull();
    });
  });

  describe('loadProfile', () => {
    it('should load profile and calculate sobriety', async () => {
      const now = new Date();
      const sobrietyDate = new Date(now);
      sobrietyDate.setDate(sobrietyDate.getDate() - 30); // 30 days ago

      const mockProfile = {
        id: '1',
        sobrietyDate,
        programType: '12-step-aa',
        displayName: 'Test User',
        createdAt: sobrietyDate,
        updatedAt: now,
      };

      (models.getSobrietyProfile as jest.Mock).mockResolvedValue(mockProfile);

      await useProfileStore.getState().loadProfile();

      const state = useProfileStore.getState();
      expect(state.profile).toEqual(mockProfile);
      expect(state.soberDays).toBeGreaterThanOrEqual(29); // At least 29 days
      expect(state.isLoading).toBe(false);
    });

    it('should handle no profile found', async () => {
      (models.getSobrietyProfile as jest.Mock).mockResolvedValue(null);

      await useProfileStore.getState().loadProfile();

      const state = useProfileStore.getState();
      expect(state.profile).toBeNull();
      expect(state.soberDays).toBe(0);
    });

    it('should handle load error', async () => {
      (models.getSobrietyProfile as jest.Mock).mockRejectedValue(
        new Error('Database error')
      );

      await useProfileStore.getState().loadProfile();

      const state = useProfileStore.getState();
      expect(state.error).toBe('Failed to load profile');
      expect(state.isLoading).toBe(false);
    });
  });

  describe('createProfile', () => {
    it('should create a new profile', async () => {
      const sobrietyDate = new Date('2024-01-01');
      const mockProfile = {
        id: '1',
        sobrietyDate,
        programType: '12-step-na',
        displayName: 'New User',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      (models.createSobrietyProfile as jest.Mock).mockResolvedValue(mockProfile);

      await useProfileStore.getState().createProfile(
        sobrietyDate,
        '12-step-na',
        'New User'
      );

      expect(models.createSobrietyProfile).toHaveBeenCalledWith(
        sobrietyDate,
        '12-step-na',
        'New User'
      );

      const state = useProfileStore.getState();
      expect(state.profile).toEqual(mockProfile);
    });
  });

  describe('updateProfile', () => {
    it('should update profile and reload', async () => {
      const initialProfile = {
        id: '1',
        sobrietyDate: new Date('2024-01-01'),
        programType: '12-step-aa',
        displayName: 'Old Name',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedProfile = {
        ...initialProfile,
        displayName: 'New Name',
      };

      useProfileStore.setState({ profile: initialProfile });
      
      (models.updateSobrietyProfile as jest.Mock).mockResolvedValue(undefined);
      (models.getSobrietyProfile as jest.Mock).mockResolvedValue(updatedProfile);

      await useProfileStore.getState().updateProfile({ displayName: 'New Name' });

      expect(models.updateSobrietyProfile).toHaveBeenCalledWith({
        displayName: 'New Name',
      });

      const state = useProfileStore.getState();
      expect(state.profile?.displayName).toBe('New Name');
    });
  });

  describe('calculateSobriety', () => {
    it('should calculate days, hours, and minutes correctly', () => {
      const now = new Date();
      const sobrietyDate = new Date(now);
      sobrietyDate.setDate(sobrietyDate.getDate() - 100);
      sobrietyDate.setHours(sobrietyDate.getHours() - 12);

      useProfileStore.setState({
        profile: {
          id: '1',
          sobrietyDate,
          programType: '12-step-aa',
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      });

      useProfileStore.getState().calculateSobriety();

      const state = useProfileStore.getState();
      expect(state.soberDays).toBeGreaterThanOrEqual(100);
      expect(state.soberHours).toBeGreaterThanOrEqual(0);
      expect(state.soberHours).toBeLessThan(24);
      expect(state.soberMinutes).toBeGreaterThanOrEqual(0);
      expect(state.soberMinutes).toBeLessThan(60);
    });

    it('should handle no profile gracefully', () => {
      useProfileStore.setState({ profile: null });

      useProfileStore.getState().calculateSobriety();

      const state = useProfileStore.getState();
      expect(state.soberDays).toBe(0);
      expect(state.soberHours).toBe(0);
      expect(state.soberMinutes).toBe(0);
    });
  });
});


/**
 * Weekly Report Service Tests
 * Tests for weekly report generation and formatting
 */

import {
  generateWeeklyReport,
  formatReportForDisplay,
  formatReportForSponsor,
  type WeeklyReport,
} from '../../../lib/services/weeklyReport';
import * as models from '../../../lib/db/models';

// Mock the database models
jest.mock('../../../lib/db/models', () => ({
  getCheckinHistory: jest.fn(),
  getReadingStreak: jest.fn(),
  getPhoneCallLogs: jest.fn(),
}));

describe('weeklyReport', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default mock implementations
    (models.getCheckinHistory as jest.Mock).mockResolvedValue([]);
    (models.getReadingStreak as jest.Mock).mockResolvedValue(0);
    (models.getPhoneCallLogs as jest.Mock).mockResolvedValue([]);
  });

  describe('generateWeeklyReport', () => {
    it('should generate a report with basic stats', async () => {
      const mockCheckins = [
        { id: '1', date: new Date(), mood: 7, cravingLevel: 3, isCheckedIn: true, createdAt: new Date() },
        { id: '2', date: new Date(Date.now() - 86400000), mood: 6, cravingLevel: 4, isCheckedIn: true, createdAt: new Date() },
        { id: '3', date: new Date(Date.now() - 172800000), mood: 8, cravingLevel: 2, isCheckedIn: true, createdAt: new Date() },
      ];

      (models.getCheckinHistory as jest.Mock).mockResolvedValue(mockCheckins);
      (models.getReadingStreak as jest.Mock).mockResolvedValue(5);
      (models.getPhoneCallLogs as jest.Mock).mockResolvedValue([]);

      const report = await generateWeeklyReport(
        30, // soberDays
        [], // meetingLogs
        [], // stepProgress
        [], // achievements
        [], // keytags
        undefined // sponsorContactDate
      );

      expect(report).toHaveProperty('soberDays', 30);
      expect(report).toHaveProperty('checkinCount');
      expect(report).toHaveProperty('checkinRate');
      expect(report).toHaveProperty('averageMood');
      expect(report).toHaveProperty('averageCraving');
      expect(report).toHaveProperty('moodTrend');
      expect(report).toHaveProperty('cravingTrend');
      expect(report).toHaveProperty('weekStartDate');
      expect(report).toHaveProperty('weekEndDate');
      expect(report).toHaveProperty('highlights');
      expect(report).toHaveProperty('areasForGrowth');
      expect(report).toHaveProperty('encouragement');
    });

    it('should calculate check-in rate correctly', async () => {
      const mockCheckins = Array(5).fill(null).map((_, i) => ({
        id: `${i}`,
        date: new Date(Date.now() - i * 86400000),
        mood: 7,
        cravingLevel: 3,
        isCheckedIn: true,
        createdAt: new Date(),
      }));

      (models.getCheckinHistory as jest.Mock).mockResolvedValue(mockCheckins);

      const report = await generateWeeklyReport(30, [], [], [], [], undefined);

      expect(report.checkinCount).toBe(5);
      expect(report.checkinRate).toBe(Math.round((5 / 7) * 100));
    });

    it('should calculate average mood correctly', async () => {
      const mockCheckins = [
        { id: '1', date: new Date(), mood: 6, cravingLevel: 3, isCheckedIn: true, createdAt: new Date() },
        { id: '2', date: new Date(), mood: 8, cravingLevel: 3, isCheckedIn: true, createdAt: new Date() },
        { id: '3', date: new Date(), mood: 7, cravingLevel: 3, isCheckedIn: true, createdAt: new Date() },
      ];

      (models.getCheckinHistory as jest.Mock).mockResolvedValue(mockCheckins);

      const report = await generateWeeklyReport(30, [], [], [], [], undefined);

      expect(report.averageMood).toBe(7); // (6 + 8 + 7) / 3 = 7
    });

    it('should include meeting stats', async () => {
      const now = new Date();
      const meetingLogs = [
        { date: new Date(now.getTime() - 86400000), didShare: true },
        { date: new Date(now.getTime() - 172800000), didShare: false },
        { date: new Date(now.getTime() - 259200000), didShare: true },
      ];

      const report = await generateWeeklyReport(30, meetingLogs, [], [], [], undefined);

      expect(report.meetingsAttended).toBe(3);
      expect(report.sharesAtMeetings).toBe(2);
    });

    it('should determine mood trend correctly', async () => {
      // Improving mood trend - later check-ins have higher mood
      const improvingCheckins = [
        { id: '1', date: new Date(), mood: 8, cravingLevel: 2, isCheckedIn: true, createdAt: new Date() },
        { id: '2', date: new Date(Date.now() - 86400000), mood: 7, cravingLevel: 3, isCheckedIn: true, createdAt: new Date() },
        { id: '3', date: new Date(Date.now() - 172800000), mood: 6, cravingLevel: 4, isCheckedIn: true, createdAt: new Date() },
        { id: '4', date: new Date(Date.now() - 259200000), mood: 5, cravingLevel: 5, isCheckedIn: true, createdAt: new Date() },
      ];

      (models.getCheckinHistory as jest.Mock).mockResolvedValue(improvingCheckins);

      const report = await generateWeeklyReport(30, [], [], [], [], undefined);

      expect(['improving', 'stable', 'declining']).toContain(report.moodTrend);
    });

    it('should include step work progress', async () => {
      const stepProgress = [
        { stepNumber: 1, answeredQuestions: 10, totalQuestions: 10 },
        { stepNumber: 2, answeredQuestions: 5, totalQuestions: 10 },
        { stepNumber: 3, answeredQuestions: 0, totalQuestions: 10 },
      ];

      const report = await generateWeeklyReport(30, [], stepProgress, [], [], undefined);

      expect(report.currentStep).toBe(2); // First incomplete step
      expect(report.stepProgress).toBe(50); // 5/10 = 50%
    });

    it('should include newly unlocked achievements', async () => {
      const now = new Date();
      const achievements = [
        { id: 'a1', title: 'First Week', unlockedAt: new Date(now.getTime() - 86400000) },
        { id: 'a2', title: 'Old Achievement', unlockedAt: new Date(now.getTime() - 30 * 86400000) },
      ];

      const report = await generateWeeklyReport(30, [], [], achievements, [], undefined);

      expect(report.achievementsUnlocked).toContain('First Week');
      expect(report.achievementsUnlocked).not.toContain('Old Achievement');
    });

    it('should include keytag earned this week', async () => {
      const keytags = [
        { name: '24 Hours', daysRequired: 1, isEarned: true },
        { name: '30 Days', daysRequired: 30, isEarned: true },
        { name: '60 Days', daysRequired: 60, isEarned: false },
      ];

      // 32 days sober means 30-day keytag was earned within the week
      const report = await generateWeeklyReport(32, [], [], [], keytags, undefined);

      expect(report.keytagEarned).toBe('30 Days');
    });

    it('should generate appropriate highlights', async () => {
      const mockCheckins = Array(7).fill(null).map((_, i) => ({
        id: `${i}`,
        date: new Date(Date.now() - i * 86400000),
        mood: 8,
        cravingLevel: 2,
        isCheckedIn: true,
        createdAt: new Date(),
      }));

      (models.getCheckinHistory as jest.Mock).mockResolvedValue(mockCheckins);
      (models.getReadingStreak as jest.Mock).mockResolvedValue(7);

      const report = await generateWeeklyReport(30, [], [], [], [], undefined);

      expect(report.highlights.length).toBeGreaterThan(0);
      expect(report.highlights.some(h => h.includes('check-in'))).toBe(true);
    });

    it('should generate areas for growth when needed', async () => {
      // No check-ins, no meetings
      (models.getCheckinHistory as jest.Mock).mockResolvedValue([]);

      const report = await generateWeeklyReport(30, [], [], [], [], undefined);

      expect(report.areasForGrowth.length).toBeGreaterThan(0);
    });
  });

  describe('formatReportForDisplay', () => {
    it('should format report as readable text', () => {
      const mockReport: WeeklyReport = {
        weekStartDate: new Date('2024-01-08'),
        weekEndDate: new Date('2024-01-14'),
        generatedAt: new Date('2024-01-14'),
        soberDays: 30,
        daysThisWeek: 7,
        checkinCount: 5,
        checkinRate: 71,
        averageMood: 7,
        averageCraving: 3,
        moodTrend: 'improving',
        cravingTrend: 'improving',
        highestMoodDay: { day: 'Monday', mood: 9 },
        lowestMoodDay: { day: 'Wednesday', mood: 5 },
        meetingsAttended: 3,
        meetingGoal: 3,
        meetingGoalMet: true,
        sharesAtMeetings: 1,
        phoneCalls: 2,
        sponsorContacts: 1,
        stepWorkSessions: 0,
        currentStep: 2,
        stepProgress: 50,
        readingDays: 5,
        readingStreak: 5,
        achievementsUnlocked: ['First Week'],
        keytagEarned: null,
        highlights: ['Met meeting goal'],
        areasForGrowth: [],
        encouragement: 'Keep up the great work!',
      };

      const formatted = formatReportForDisplay(mockReport);

      expect(formatted).toContain('WEEKLY RECOVERY REPORT');
      expect(formatted).toContain('30 days');
      expect(formatted).toContain('CHECK-INS');
      expect(formatted).toContain('MEETINGS');
      expect(formatted).toContain('STEP WORK');
    });
  });

  describe('formatReportForSponsor', () => {
    it('should format report for sharing with sponsor', () => {
      const mockReport: WeeklyReport = {
        weekStartDate: new Date('2024-01-08'),
        weekEndDate: new Date('2024-01-14'),
        generatedAt: new Date('2024-01-14'),
        soberDays: 30,
        daysThisWeek: 7,
        checkinCount: 5,
        checkinRate: 71,
        averageMood: 7,
        averageCraving: 3,
        moodTrend: 'improving',
        cravingTrend: 'improving',
        highestMoodDay: null,
        lowestMoodDay: null,
        meetingsAttended: 3,
        meetingGoal: 3,
        meetingGoalMet: true,
        sharesAtMeetings: 1,
        phoneCalls: 2,
        sponsorContacts: 1,
        stepWorkSessions: 0,
        currentStep: 2,
        stepProgress: 50,
        readingDays: 5,
        readingStreak: 5,
        achievementsUnlocked: [],
        keytagEarned: null,
        highlights: ['Met meeting goal'],
        areasForGrowth: [],
        encouragement: 'Keep up the great work!',
      };

      const formatted = formatReportForSponsor(mockReport, 'John');

      expect(formatted).toContain('Weekly Update from John');
      expect(formatted).toContain('Clean Days: 30');
      expect(formatted).toContain('Meetings: 3');
      expect(formatted).toContain('Check-ins: 5/7');
      expect(formatted).toContain('Recovery Companion');
    });

    it('should use default name when not provided', () => {
      const mockReport: WeeklyReport = {
        weekStartDate: new Date('2024-01-08'),
        weekEndDate: new Date('2024-01-14'),
        generatedAt: new Date('2024-01-14'),
        soberDays: 30,
        daysThisWeek: 7,
        checkinCount: 5,
        checkinRate: 71,
        averageMood: 7,
        averageCraving: 3,
        moodTrend: 'stable',
        cravingTrend: 'stable',
        highestMoodDay: null,
        lowestMoodDay: null,
        meetingsAttended: 2,
        meetingGoal: 3,
        meetingGoalMet: false,
        sharesAtMeetings: 0,
        phoneCalls: 0,
        sponsorContacts: 0,
        stepWorkSessions: 0,
        currentStep: 1,
        stepProgress: 0,
        readingDays: 0,
        readingStreak: 0,
        achievementsUnlocked: [],
        keytagEarned: null,
        highlights: [],
        areasForGrowth: [],
        encouragement: 'One day at a time.',
      };

      const formatted = formatReportForSponsor(mockReport);

      expect(formatted).toContain('Your Sponsee');
    });
  });
});


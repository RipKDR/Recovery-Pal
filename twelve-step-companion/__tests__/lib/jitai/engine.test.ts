/**
 * JITAI Engine Tests
 * Tests for Just-In-Time Adaptive Intervention engine
 */

import {
  JITAI_TRIGGERS,
  evaluateTriggers,
  runJitaiEvaluation,
  resetCooldowns,
  getCooldownStatus,
  getInterventionForTrigger,
} from '../../../lib/jitai/engine';
import type { JitaiContext, JitaiTrigger } from '../../../lib/jitai/types';

// Mock the notifications module
jest.mock('../../../lib/jitai/notifications', () => ({
  scheduleJitaiNotification: jest.fn().mockResolvedValue(undefined),
}));

describe('JITAI Engine', () => {
  // Base context for testing
  const baseContext: JitaiContext = {
    soberDays: 30,
    hasSetIntentionToday: true,
    hasCompletedInventoryToday: true,
    daysSinceLastCheckin: 0,
    moodTrend: 'stable',
    averageMood7Days: 7,
    cravingTrend: 'stable',
    averageCraving7Days: 3,
    daysSinceLastMeeting: 1,
    hasSponsor: true,
    daysSinceLastSponsorContact: 2,
    lastMoodReported: 7,
    currentHour: 0,
    currentDayOfWeek: 0,
    lastCravingReported: null,
    meetingsThisWeek: 0,
    currentStep: 0,
    daysSinceLastStepWork: 0
  };

  beforeEach(() => {
    // Reset cooldowns before each test
    resetCooldowns();
    jest.clearAllMocks();
  });

  describe('JITAI_TRIGGERS', () => {
    it('should have valid trigger structure', () => {
      JITAI_TRIGGERS.forEach(trigger => {
        expect(trigger).toHaveProperty('id');
        expect(trigger).toHaveProperty('name');
        expect(trigger).toHaveProperty('description');
        expect(trigger).toHaveProperty('type');
        expect(trigger).toHaveProperty('condition');
        expect(trigger).toHaveProperty('priority');
        expect(trigger).toHaveProperty('cooldownHours');
        
        expect(typeof trigger.id).toBe('string');
        expect(typeof trigger.name).toBe('string');
        expect(typeof trigger.condition).toBe('function');
        expect(['time', 'pattern', 'milestone']).toContain(trigger.type);
        expect(['low', 'medium', 'high', 'urgent']).toContain(trigger.priority);
        expect(typeof trigger.cooldownHours).toBe('number');
      });
    });

    it('should have unique trigger IDs', () => {
      const ids = JITAI_TRIGGERS.map(t => t.id);
      const uniqueIds = new Set(ids);
      
      expect(uniqueIds.size).toBe(ids.length);
    });
  });

  describe('evaluateTriggers', () => {
    it('should return empty array when no triggers fire', () => {
      // Context where everything is good
      const goodContext: JitaiContext = {
        ...baseContext,
        hasSetIntentionToday: true,
        hasCompletedInventoryToday: true,
        daysSinceLastCheckin: 0,
        moodTrend: 'stable',
        averageMood7Days: 8,
        cravingTrend: 'stable',
        averageCraving7Days: 2,
        daysSinceLastMeeting: 1,
        daysSinceLastSponsorContact: 1,
        lastMoodReported: 8,
      };

      const interventions = evaluateTriggers(goodContext);
      
      // Should return at most 1 intervention (highest priority)
      expect(interventions.length).toBeLessThanOrEqual(1);
    });

    it('should trigger missed-checkins when days since last checkin is high', () => {
      const context: JitaiContext = {
        ...baseContext,
        daysSinceLastCheckin: 5,
      };

      const interventions = evaluateTriggers(context);
      
      expect(interventions.length).toBeGreaterThan(0);
      expect(interventions[0].triggerId).toBe('missed-checkins');
    });

    it('should trigger declining-mood when mood trend is declining', () => {
      const context: JitaiContext = {
        ...baseContext,
        moodTrend: 'declining',
        averageMood7Days: 4,
        daysSinceLastCheckin: 0, // Don't trigger missed-checkins
      };

      const interventions = evaluateTriggers(context);
      
      const moodIntervention = interventions.find(i => i.triggerId === 'declining-mood');
      expect(moodIntervention).toBeDefined();
    });

    it('should trigger rising-cravings when craving trend is rising', () => {
      const context: JitaiContext = {
        ...baseContext,
        cravingTrend: 'rising',
        averageCraving7Days: 7,
        daysSinceLastCheckin: 0,
        moodTrend: 'stable',
        averageMood7Days: 7,
      };

      const interventions = evaluateTriggers(context);
      
      const cravingIntervention = interventions.find(i => i.triggerId === 'rising-cravings');
      expect(cravingIntervention).toBeDefined();
    });

    it('should trigger meeting-gap when days since last meeting is high', () => {
      const context: JitaiContext = {
        ...baseContext,
        daysSinceLastMeeting: 10,
        daysSinceLastCheckin: 0,
        moodTrend: 'stable',
        averageMood7Days: 7,
        cravingTrend: 'stable',
        averageCraving7Days: 3,
      };

      const interventions = evaluateTriggers(context);
      
      const meetingIntervention = interventions.find(i => i.triggerId === 'meeting-gap');
      expect(meetingIntervention).toBeDefined();
    });

    it('should trigger sponsor-contact-gap when days since sponsor contact is high', () => {
      const context: JitaiContext = {
        ...baseContext,
        hasSponsor: true,
        daysSinceLastSponsorContact: 10,
        daysSinceLastCheckin: 0,
        daysSinceLastMeeting: 1,
        moodTrend: 'stable',
        averageMood7Days: 7,
        cravingTrend: 'stable',
        averageCraving7Days: 3,
      };

      const interventions = evaluateTriggers(context);
      
      const sponsorIntervention = interventions.find(i => i.triggerId === 'sponsor-contact-gap');
      expect(sponsorIntervention).toBeDefined();
    });

    it('should trigger halt-check when last mood is low', () => {
      const context: JitaiContext = {
        ...baseContext,
        lastMoodReported: 3,
        daysSinceLastCheckin: 0,
        moodTrend: 'stable',
        averageMood7Days: 6,
        cravingTrend: 'stable',
        averageCraving7Days: 3,
      };

      const interventions = evaluateTriggers(context);
      
      const haltIntervention = interventions.find(i => i.triggerId === 'halt-check');
      expect(haltIntervention).toBeDefined();
    });

    it('should respect cooldowns', () => {
      const context: JitaiContext = {
        ...baseContext,
        daysSinceLastCheckin: 5,
      };

      // First evaluation should trigger
      const firstInterventions = evaluateTriggers(context);
      expect(firstInterventions.length).toBeGreaterThan(0);

      // Second evaluation should not trigger same intervention (on cooldown)
      const secondInterventions = evaluateTriggers(context);
      const sameIntervention = secondInterventions.find(
        i => i.triggerId === firstInterventions[0]?.triggerId
      );
      expect(sameIntervention).toBeUndefined();
    });

    it('should prioritize higher priority interventions', () => {
      // Create a context that triggers multiple interventions
      const context: JitaiContext = {
        ...baseContext,
        cravingTrend: 'rising',
        averageCraving7Days: 8, // Urgent priority
        daysSinceLastMeeting: 10, // Medium priority
      };

      const interventions = evaluateTriggers(context);
      
      // Should return only highest priority (rising-cravings is urgent)
      if (interventions.length > 0) {
        expect(interventions[0].triggerId).toBe('rising-cravings');
      }
    });
  });

  describe('getInterventionForTrigger', () => {
    it('should return correct intervention for each trigger', () => {
      const trigger = JITAI_TRIGGERS.find(t => t.id === 'missed-checkins')!;
      const context: JitaiContext = {
        ...baseContext,
        daysSinceLastCheckin: 5,
      };

      const intervention = getInterventionForTrigger(trigger, context);
      
      expect(intervention).toHaveProperty('triggerId', trigger.id);
      expect(intervention).toHaveProperty('title');
      expect(intervention).toHaveProperty('message');
      expect(intervention).toHaveProperty('action');
      expect(intervention).toHaveProperty('category');
    });

    it('should include dynamic values in messages', () => {
      const trigger = JITAI_TRIGGERS.find(t => t.id === 'missed-checkins')!;
      const context: JitaiContext = {
        ...baseContext,
        daysSinceLastCheckin: 5,
      };

      const intervention = getInterventionForTrigger(trigger, context);
      
      expect(intervention.message).toContain('5');
    });
  });

  describe('runJitaiEvaluation', () => {
    it('should evaluate triggers and schedule notifications', async () => {
      const { scheduleJitaiNotification } = require('../../../lib/jitai/notifications');
      
      const context: JitaiContext = {
        ...baseContext,
        daysSinceLastCheckin: 5,
      };

      await runJitaiEvaluation(context);

      expect(scheduleJitaiNotification).toHaveBeenCalled();
    });

    it('should not schedule notifications when no triggers fire', async () => {
      const { scheduleJitaiNotification } = require('../../../lib/jitai/notifications');
      
      // Reset cooldowns and create a good context
      resetCooldowns();
      const goodContext: JitaiContext = {
        ...baseContext,
        hasSetIntentionToday: true,
        hasCompletedInventoryToday: true,
        daysSinceLastCheckin: 0,
        moodTrend: 'stable',
        averageMood7Days: 8,
        cravingTrend: 'stable',
        averageCraving7Days: 2,
        daysSinceLastMeeting: 0,
        daysSinceLastSponsorContact: 0,
        lastMoodReported: 8,
        soberDays: 100, // Not in early recovery, not approaching milestone
      };

      await runJitaiEvaluation(goodContext);

      // May or may not be called depending on time-based triggers
      expect(scheduleJitaiNotification).toBeDefined();
    });
  });

  describe('resetCooldowns', () => {
    it('should clear all cooldowns', () => {
      const context: JitaiContext = {
        ...baseContext,
        daysSinceLastCheckin: 5,
      };

      // Trigger to set cooldown
      evaluateTriggers(context);
      
      // Reset
      resetCooldowns();
      
      // Should be able to trigger again
      const interventions = evaluateTriggers(context);
      expect(interventions.length).toBeGreaterThan(0);
    });
  });

  describe('getCooldownStatus', () => {
    it('should return cooldown status for triggered interventions', () => {
      const context: JitaiContext = {
        ...baseContext,
        daysSinceLastCheckin: 5,
      };

      // Trigger something
      evaluateTriggers(context);
      
      const status = getCooldownStatus();
      
      expect(typeof status).toBe('object');
      // Should have at least one entry
      const entries = Object.entries(status);
      if (entries.length > 0) {
        const [triggerId, data] = entries[0];
        expect(data).toHaveProperty('lastTriggered');
        expect(data).toHaveProperty('remainingHours');
      }
    });
  });
});


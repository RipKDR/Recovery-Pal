/**
 * Database Models Tests
 * Tests for CRUD operations with encryption
 */

import * as SQLite from 'expo-sqlite';
import * as encryption from '../../../lib/encryption';

// Mock SQLite
const mockDb = {
  runAsync: jest.fn(),
  getFirstAsync: jest.fn(),
  getAllAsync: jest.fn(),
  execAsync: jest.fn(),
};

jest.mock('expo-sqlite', () => ({
  openDatabaseAsync: jest.fn(() => Promise.resolve(mockDb)),
}));

// Mock encryption
jest.mock('../../../lib/encryption', () => ({
  encryptContent: jest.fn((content) => Promise.resolve(`encrypted:${content}`)),
  decryptContent: jest.fn((content) => 
    Promise.resolve(content.replace('encrypted:', ''))
  ),
}));

// Mock uuid
jest.mock('uuid', () => ({
  v4: jest.fn(() => 'test-uuid-123'),
}));

describe('Database Models', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockDb.runAsync.mockResolvedValue({ lastInsertRowId: 1, changes: 1 });
    mockDb.getFirstAsync.mockResolvedValue(null);
    mockDb.getAllAsync.mockResolvedValue([]);
  });

  describe('Journal Entries', () => {
    // Need to require after mocks are set up
    const getModels = () => require('../../../lib/db/models/index');

    it('should encrypt content before storing', async () => {
      const models = getModels();
      
      await models.createJournalEntry('freeform', 'My private journal entry');

      expect(encryption.encryptContent).toHaveBeenCalledWith('My private journal entry');
      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO journal_entries'),
        expect.arrayContaining(['encrypted:My private journal entry'])
      );
    });

    it('should include all optional fields', async () => {
      const models = getModels();
      
      await models.createJournalEntry('step-work', 'Step work content', {
        moodBefore: 5,
        moodAfter: 7,
        cravingLevel: 2,
        emotionTags: ['grateful', 'hopeful'],
        stepNumber: 4,
      });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO journal_entries'),
        expect.arrayContaining([
          'test-uuid-123',
          'step-work',
          'encrypted:Step work content',
          5,  // moodBefore
          7,  // moodAfter
          2,  // cravingLevel
          JSON.stringify(['grateful', 'hopeful']),
          4,  // stepNumber
        ])
      );
    });

    it('should return entries without decrypting', async () => {
      const models = getModels();
      
      mockDb.getAllAsync.mockResolvedValue([
        {
          id: '1',
          type: 'freeform',
          content: 'encrypted-content',
          emotion_tags: '[]',
          created_at: '2024-01-01T00:00:00.000Z',
          updated_at: '2024-01-01T00:00:00.000Z',
        },
      ]);

      const entries = await models.getJournalEntries();

      expect(entries[0].content).toBe('encrypted-content');
      expect(encryption.decryptContent).not.toHaveBeenCalled();
    });

    it('should decrypt content when explicitly requested', async () => {
      const models = getModels();
      
      const entry = {
        id: '1',
        type: 'freeform',
        content: 'encrypted:Private content',
        emotionTags: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const decrypted = await models.decryptJournalContent(entry);

      expect(decrypted).toBe('Private content');
      expect(encryption.decryptContent).toHaveBeenCalledWith('encrypted:Private content');
    });
  });

  describe('Daily Check-ins', () => {
    const getModels = () => require('../../../lib/db/models/index');

    it('should encrypt gratitude field', async () => {
      const models = getModels();
      
      await models.createDailyCheckin(7, 3, 'Grateful for my sobriety');

      expect(encryption.encryptContent).toHaveBeenCalledWith('Grateful for my sobriety');
    });

    it('should not encrypt when gratitude is empty', async () => {
      const models = getModels();
      
      await models.createDailyCheckin(7, 3);

      expect(encryption.encryptContent).not.toHaveBeenCalled();
    });

    it('should use current date for check-in', async () => {
      const models = getModels();
      const today = new Date().toISOString().split('T')[0];
      
      await models.createDailyCheckin(8, 2);

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE INTO daily_checkins'),
        expect.arrayContaining([today])
      );
    });
  });

  describe('Recovery Contacts', () => {
    const getModels = () => require('../../../lib/db/models/index');

    it('should encrypt notes field', async () => {
      const models = getModels();
      
      await models.createRecoveryContact(
        'John Sponsor',
        '555-1234',
        'sponsor',
        'Met at Tuesday meeting'
      );

      expect(encryption.encryptContent).toHaveBeenCalledWith('Met at Tuesday meeting');
    });

    it('should not encrypt when notes is empty', async () => {
      const models = getModels();
      
      await models.createRecoveryContact('Jane Fellow', '555-5678', 'fellowship');

      expect(encryption.encryptContent).not.toHaveBeenCalled();
    });

    it('should get sponsor correctly', async () => {
      const models = getModels();
      
      mockDb.getAllAsync.mockResolvedValue([
        {
          id: '1',
          name: 'John Sponsor',
          phone: '555-1234',
          role: 'sponsor',
          notes: null,
          last_contacted_at: null,
          created_at: '2024-01-01T00:00:00.000Z',
        },
      ]);

      const sponsor = await models.getSponsor();

      expect(sponsor).toBeDefined();
      expect(sponsor?.name).toBe('John Sponsor');
      expect(mockDb.getAllAsync).toHaveBeenCalledWith(
        expect.stringContaining("WHERE role = ?"),
        ['sponsor']
      );
    });
  });

  describe('Milestones', () => {
    const getModels = () => require('../../../lib/db/models/index');

    it('should encrypt reflection field', async () => {
      const models = getModels();
      
      await models.createMilestone('time-based', '30 Days', new Date(), {
        reflection: 'This month has been transformative',
        metadata: { days: 30 },
      });

      expect(encryption.encryptContent).toHaveBeenCalledWith(
        'This month has been transformative'
      );
    });

    it('should store metadata as JSON', async () => {
      const models = getModels();
      
      await models.createMilestone('time-based', '30 Days', new Date(), {
        metadata: { days: 30, celebratedAt: '2024-01-01' },
      });

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT INTO milestones'),
        expect.arrayContaining([
          JSON.stringify({ days: 30, celebratedAt: '2024-01-01' }),
        ])
      );
    });
  });

  describe('Daily Reading Reflections', () => {
    const getModels = () => require('../../../lib/db/models/index');

    it('should encrypt reflection', async () => {
      const models = getModels();
      
      await models.createDailyReadingReflection('01-15', 'Today I learned...');

      expect(encryption.encryptContent).toHaveBeenCalledWith('Today I learned...');
    });

    it('should use INSERT OR REPLACE for same date', async () => {
      const models = getModels();
      
      await models.createDailyReadingReflection('01-15', 'Updated reflection');

      expect(mockDb.runAsync).toHaveBeenCalledWith(
        expect.stringContaining('INSERT OR REPLACE'),
        expect.any(Array)
      );
    });
  });

  describe('Achievement Reflections', () => {
    const getModels = () => require('../../../lib/db/models/index');

    it('should encrypt achievement reflection', async () => {
      const models = getModels();
      
      mockDb.getFirstAsync.mockResolvedValue({
        id: 'keytag-white',
        category: 'keytags',
        title: 'White Keytag',
        status: 'unlocked',
      });

      await models.saveAchievementReflection(
        'keytag-white',
        'Picking up my first keytag meant everything'
      );

      expect(encryption.encryptContent).toHaveBeenCalledWith(
        'Picking up my first keytag meant everything'
      );
    });

    it('should decrypt achievement reflection when retrieved', async () => {
      const models = getModels();
      
      mockDb.getFirstAsync.mockResolvedValue({
        reflection: 'encrypted:My reflection',
      });

      const reflection = await models.getAchievementReflection('keytag-white');

      expect(reflection).toBe('My reflection');
      expect(encryption.decryptContent).toHaveBeenCalledWith('encrypted:My reflection');
    });

    it('should return null when no reflection', async () => {
      const models = getModels();
      
      mockDb.getFirstAsync.mockResolvedValue({ reflection: null });

      const reflection = await models.getAchievementReflection('keytag-white');

      expect(reflection).toBeNull();
    });
  });
});


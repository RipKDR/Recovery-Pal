/**
 * Error Tracking Service Tests
 * Tests for error tracking, logging, and performance monitoring
 */

import {
  initializeErrorTracking,
  captureException,
  captureMessage,
  addBreadcrumb,
  setUserContext,
  clearUserContext,
  setTag,
  startTransaction,
  logNavigation,
  logUserAction,
  logDatabaseOperation,
} from '../../../lib/services/errorTracking';

describe('errorTracking', () => {
  // Spy on console methods
  let consoleLogSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
  });

  afterEach(() => {
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    consoleWarnSpy.mockRestore();
  });

  describe('initializeErrorTracking', () => {
    it('should log when DSN is not configured', () => {
      // No SENTRY_DSN in env
      initializeErrorTracking();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ErrorTracking]')
      );
    });
  });

  describe('captureException', () => {
    it('should log exception with context', () => {
      const error = new Error('Test error');
      const context = {
        component: 'TestComponent',
        action: 'testAction',
      };

      captureException(error, context);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ErrorTracking] Exception:',
        'Test error',
        context
      );
    });

    it('should handle exception without context', () => {
      const error = new Error('Test error');

      captureException(error);

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '[ErrorTracking] Exception:',
        'Test error',
        undefined
      );
    });
  });

  describe('captureMessage', () => {
    it('should log message with level', () => {
      captureMessage('Test message', 'info');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ErrorTracking] INFO: Test message',
        undefined
      );
    });

    it('should default to info level', () => {
      captureMessage('Test message');

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ErrorTracking] INFO: Test message',
        undefined
      );
    });

    it('should include context when provided', () => {
      const context = { component: 'TestComponent' };
      captureMessage('Test message', 'warning', context);

      expect(consoleLogSpy).toHaveBeenCalledWith(
        '[ErrorTracking] WARNING: Test message',
        context
      );
    });
  });

  describe('addBreadcrumb', () => {
    it('should accept breadcrumb data', () => {
      // This is a no-op when Sentry is not installed, but should not throw
      expect(() => {
        addBreadcrumb({
          category: 'test',
          message: 'Test breadcrumb',
          level: 'info',
          data: { key: 'value' },
        });
      }).not.toThrow();
    });
  });

  describe('setUserContext', () => {
    it('should accept user ID', () => {
      expect(() => {
        setUserContext('user-123');
      }).not.toThrow();
    });
  });

  describe('clearUserContext', () => {
    it('should clear user context', () => {
      expect(() => {
        clearUserContext();
      }).not.toThrow();
    });
  });

  describe('setTag', () => {
    it('should accept key-value tag', () => {
      expect(() => {
        setTag('environment', 'test');
      }).not.toThrow();
    });
  });

  describe('startTransaction', () => {
    it('should return transaction with finish method', () => {
      const transaction = startTransaction('testTransaction', 'test.op');

      expect(transaction).toHaveProperty('finish');
      expect(typeof transaction.finish).toBe('function');
    });

    it('should log duration when finished', () => {
      const transaction = startTransaction('testTransaction', 'test.op');
      
      // Wait a tiny bit to ensure measurable duration
      transaction.finish();

      expect(consoleLogSpy).toHaveBeenCalledWith(
        expect.stringContaining('[ErrorTracking] Transaction')
      );
    });
  });

  describe('logNavigation', () => {
    it('should log navigation event', () => {
      expect(() => {
        logNavigation('HomeScreen', { userId: '123' });
      }).not.toThrow();
    });

    it('should handle navigation without params', () => {
      expect(() => {
        logNavigation('SettingsScreen');
      }).not.toThrow();
    });
  });

  describe('logUserAction', () => {
    it('should log user action', () => {
      expect(() => {
        logUserAction('button_press', { buttonId: 'submit' });
      }).not.toThrow();
    });

    it('should handle action without details', () => {
      expect(() => {
        logUserAction('app_opened');
      }).not.toThrow();
    });
  });

  describe('logDatabaseOperation', () => {
    it('should log successful database operation', () => {
      expect(() => {
        logDatabaseOperation('INSERT', 'journal_entries', true);
      }).not.toThrow();
    });

    it('should log failed database operation', () => {
      expect(() => {
        logDatabaseOperation('SELECT', 'meetings', false);
      }).not.toThrow();
    });
  });
});


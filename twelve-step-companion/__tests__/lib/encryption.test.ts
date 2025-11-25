/**
 * Encryption Module Tests
 * Tests for AES-256-GCM encryption and legacy migration
 */

import * as SecureStore from 'expo-secure-store';

// Mock implementations must come before imports
jest.mock('expo-secure-store');
jest.mock('expo-crypto');

describe('Encryption Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('initializeEncryptionKey', () => {
    it('should create a new key if none exists', async () => {
      const { initializeEncryptionKey } = require('../../lib/encryption');
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);
      (SecureStore.setItemAsync as jest.Mock).mockResolvedValue(undefined);

      await initializeEncryptionKey();

      expect(SecureStore.setItemAsync).toHaveBeenCalled();
    });

    it('should not create a new key if one exists', async () => {
      const { initializeEncryptionKey } = require('../../lib/encryption');
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('existing-key');

      await initializeEncryptionKey();

      expect(SecureStore.setItemAsync).not.toHaveBeenCalled();
    });
  });

  describe('isEncryptionReady', () => {
    it('should return true when key exists', async () => {
      const { isEncryptionReady } = require('../../lib/encryption');
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue('test-key');

      const result = await isEncryptionReady();

      expect(result).toBe(true);
    });

    it('should return false when no key exists', async () => {
      const { isEncryptionReady } = require('../../lib/encryption');
      
      (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

      const result = await isEncryptionReady();

      expect(result).toBe(false);
    });
  });

  describe('clearEncryptionKey', () => {
    it('should delete the encryption key', async () => {
      const { clearEncryptionKey } = require('../../lib/encryption');

      await clearEncryptionKey();

      expect(SecureStore.deleteItemAsync).toHaveBeenCalledWith('app_encryption_key');
    });
  });

  describe('getEncryptionVersion', () => {
    it('should return version 2 for AES-GCM', () => {
      const { getEncryptionVersion } = require('../../lib/encryption');

      expect(getEncryptionVersion()).toBe(2);
    });
  });

  describe('needsMigration', () => {
    it('should return true for legacy encrypted content', () => {
      const { needsMigration } = require('../../lib/encryption');
      
      // Legacy content doesn't start with version byte 0x02
      const legacyContent = btoa('abc123somelegacyencryptedcontent');
      
      expect(needsMigration(legacyContent)).toBe(true);
    });

    it('should return false for v2 encrypted content', () => {
      const { needsMigration } = require('../../lib/encryption');
      
      // V2 content starts with version byte 0x02
      const v2Bytes = new Uint8Array([2, ...new Array(28).fill(0)]);
      const v2Content = btoa(String.fromCharCode(...v2Bytes));
      
      expect(needsMigration(v2Content)).toBe(false);
    });
  });
});

describe('Encryption/Decryption Flow', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Setup mock key
    const mockKey = '0'.repeat(64); // 32 bytes in hex
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(mockKey);
  });

  it('should throw error when key is not initialized', async () => {
    const { encryptContent } = require('../../lib/encryption');
    
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    await expect(encryptContent('test')).rejects.toThrow('Encryption key not initialized');
  });

  it('should throw error on decrypt when key is not initialized', async () => {
    const { decryptContent } = require('../../lib/encryption');
    
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(null);

    await expect(decryptContent('dGVzdA==')).rejects.toThrow('Encryption key not initialized');
  });
});


/**
 * Encryption utilities for secure data storage
 * All sensitive journal content is encrypted before storage
 */

import * as Crypto from 'expo-crypto';
import * as SecureStore from 'expo-secure-store';

const ENCRYPTION_KEY_NAME = 'app_encryption_key';

/**
 * Generate a new encryption key if one doesn't exist
 * Key is stored in secure storage with biometric protection
 */
export async function initializeEncryptionKey(): Promise<void> {
  try {
    const existingKey = await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
    if (!existingKey) {
      const randomBytes = await Crypto.getRandomBytesAsync(32);
      const key = Array.from(new Uint8Array(randomBytes))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join('');

      await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key, {
        requireAuthentication: true, // Biometric required to access
      });
    }
  } catch (error) {
    // Fallback: store without biometric requirement for devices that don't support it
    const randomBytes = await Crypto.getRandomBytesAsync(32);
    const key = Array.from(new Uint8Array(randomBytes))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    await SecureStore.setItemAsync(ENCRYPTION_KEY_NAME, key);
  }
}

/**
 * Get the encryption key from secure storage
 */
export async function getEncryptionKey(): Promise<string | null> {
  return await SecureStore.getItemAsync(ENCRYPTION_KEY_NAME);
}

/**
 * Simple XOR-based encryption for demo purposes
 * In production, use a proper AES-256-GCM implementation
 */
function xorEncrypt(text: string, key: string): string {
  let result = '';
  for (let i = 0; i < text.length; i++) {
    const charCode = text.charCodeAt(i) ^ key.charCodeAt(i % key.length);
    result += String.fromCharCode(charCode);
  }
  return result;
}

/**
 * Convert string to base64
 */
function toBase64(str: string): string {
  // Simple base64 encoding using btoa-like approach
  const bytes = new Uint8Array(str.length);
  for (let i = 0; i < str.length; i++) {
    bytes[i] = str.charCodeAt(i);
  }
  return btoa(String.fromCharCode(...bytes));
}

/**
 * Convert base64 to string
 */
function fromBase64(base64: string): string {
  const binaryString = atob(base64);
  return binaryString;
}

/**
 * Encrypt content before storing in database
 * @param plaintext - The text to encrypt
 * @returns Base64 encoded encrypted string
 */
export async function encryptContent(plaintext: string): Promise<string> {
  const key = await getEncryptionKey();
  if (!key) {
    throw new Error('Encryption key not initialized');
  }

  // Add a random salt for each encryption
  const salt = await Crypto.getRandomBytesAsync(16);
  const saltHex = Array.from(new Uint8Array(salt))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');

  const saltedKey = key + saltHex;
  const encrypted = xorEncrypt(plaintext, saltedKey);
  
  // Prepend salt to encrypted content
  return toBase64(saltHex + encrypted);
}

/**
 * Decrypt content retrieved from database
 * @param ciphertext - Base64 encoded encrypted string
 * @returns Decrypted plaintext
 */
export async function decryptContent(ciphertext: string): Promise<string> {
  const key = await getEncryptionKey();
  if (!key) {
    throw new Error('Encryption key not initialized');
  }

  const decoded = fromBase64(ciphertext);
  
  // Extract salt (first 32 chars = 16 bytes in hex)
  const saltHex = decoded.substring(0, 32);
  const encrypted = decoded.substring(32);
  
  const saltedKey = key + saltHex;
  return xorEncrypt(encrypted, saltedKey);
}

/**
 * Check if encryption is properly initialized
 */
export async function isEncryptionReady(): Promise<boolean> {
  const key = await getEncryptionKey();
  return key !== null;
}

/**
 * Clear encryption key (for testing or account reset)
 * WARNING: This will make all encrypted data unrecoverable
 */
export async function clearEncryptionKey(): Promise<void> {
  await SecureStore.deleteItemAsync(ENCRYPTION_KEY_NAME);
}


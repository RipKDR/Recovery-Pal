import { encryptContent, decryptContent } from '../../lib/encryption';
import {
  encodeShareData,
  decodeShareData,
  type SponsorShareData,
} from '../../lib/services/sponsorConnection';
import * as SecureStore from 'expo-secure-store';

describe('encryption + sharing helpers', () => {
  const keyHex = 'a'.repeat(64); // 32 bytes hex

  beforeEach(() => {
    (SecureStore.getItemAsync as jest.Mock).mockResolvedValue(keyHex);
  });

  it('roundtrips encrypt/decrypt content', async () => {
    const plaintext = 'Recovery Companion - secure data';
    const ciphertext = await encryptContent(plaintext);
    expect(typeof ciphertext).toBe('string');
    const decrypted = await decryptContent(ciphertext);
    expect(decrypted).toBe(plaintext);
  });

  it('roundtrips sponsor share encode/decode', async () => {
    const payload: SponsorShareData = {
      displayName: 'Alex',
      soberDays: 42,
      programType: 'NA',
      lastCheckinDate: '2025-01-01',
      checkinStreak: 5,
      currentStep: 4,
      meetingsThisWeek: 3,
      lastMeetingDate: '2025-01-02',
      averageMoodLast7Days: 7.2,
      averageCravingLast7Days: 2.1,
      generatedAt: new Date().toISOString(),
    };

    const encoded = await encodeShareData(payload);
    expect(encoded.startsWith('RCSHARE:')).toBe(true);

    const decoded = decodeShareData(encoded);
    expect(decoded).toEqual(payload);
  });
});


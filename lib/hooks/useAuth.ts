/**
 * Authentication Hook
 * Manages biometric and PIN authentication
 */

import { useCallback, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import { useAuthStore } from '../store';
import { useSettingsStore } from '../store';

export function useAuth() {
  const {
    isAuthenticated,
    isLocked,
    checkBiometricSupport,
    authenticateWithBiometrics,
    authenticateWithPin,
    setPin,
    hasPin,
    lock,
    unlock,
    updateLastActive,
    checkAutoLock,
  } = useAuthStore();

  const { settings } = useSettingsStore();

  // Handle app state changes for auto-lock
  useEffect(() => {
    const handleAppStateChange = (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        // App came to foreground
        if (settings) {
          checkAutoLock(settings.autoLockMinutes);
        }
      } else if (nextAppState === 'background') {
        // App went to background - update last active time
        updateLastActive();
      }
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);

    return () => {
      subscription.remove();
    };
  }, [settings, checkAutoLock, updateLastActive]);

  // Authenticate user
  const authenticate = useCallback(async (): Promise<boolean> => {
    // First try biometrics if supported
    const biometricSupported = await checkBiometricSupport();
    
    if (biometricSupported && settings?.biometricEnabled) {
      const success = await authenticateWithBiometrics();
      if (success) return true;
    }

    // Fall back to PIN
    return false; // Caller should show PIN input
  }, [checkBiometricSupport, authenticateWithBiometrics, settings]);

  return {
    isAuthenticated,
    isLocked,
    authenticate,
    authenticateWithPin,
    setPin,
    hasPin,
    lock,
    unlock,
    checkBiometricSupport,
  };
}


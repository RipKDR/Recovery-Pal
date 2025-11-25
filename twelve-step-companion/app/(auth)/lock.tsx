/**
 * Lock Screen
 * Biometric/PIN gate for app access
 */

import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Vibration,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { useAuth } from '../../lib/hooks/useAuth';

export default function LockScreen() {
  const router = useRouter();
  const {
    authenticate,
    authenticateWithPin,
    hasPin,
    checkBiometricSupport,
  } = useAuth();

  const [showPinInput, setShowPinInput] = useState(false);
  const [pin, setPin] = useState('');
  const [pinError, setPinError] = useState('');
  const [hasPinSet, setHasPinSet] = useState(false);
  const [biometricAvailable, setBiometricAvailable] = useState(false);

  // Animations
  const logoScale = useRef(new Animated.Value(0)).current;
  const contentOpacity = useRef(new Animated.Value(0)).current;
  const shakeAnimation = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Entry animations
    Animated.sequence([
      Animated.spring(logoScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(contentOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();

    // Check capabilities
    checkCapabilities();
  }, []);

  const checkCapabilities = async () => {
    const biometric = await checkBiometricSupport();
    setBiometricAvailable(biometric);
    
    const pinExists = await hasPin();
    setHasPinSet(pinExists);
    
    // Auto-trigger biometrics if available
    if (biometric) {
      handleBiometricAuth();
    } else if (!pinExists) {
      // No security set up, go straight through
      router.replace('/(tabs)');
    } else {
      setShowPinInput(true);
    }
  };

  const handleBiometricAuth = async () => {
    const success = await authenticate();
    if (success) {
      router.replace('/(tabs)');
    } else {
      // Biometric failed, show PIN if available
      if (hasPinSet) {
        setShowPinInput(true);
      }
    }
  };

  const handlePinSubmit = async () => {
    if (pin.length < 4) {
      triggerShake();
      setPinError('PIN must be at least 4 digits');
      return;
    }

    const success = await authenticateWithPin(pin);
    if (success) {
      router.replace('/(tabs)');
    } else {
      triggerShake();
      setPinError('Incorrect PIN');
      setPin('');
      Vibration.vibrate(100);
    }
  };

  const triggerShake = () => {
    Animated.sequence([
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: -10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 10,
        duration: 50,
        useNativeDriver: true,
      }),
      Animated.timing(shakeAnimation, {
        toValue: 0,
        duration: 50,
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handlePinDigit = (digit: string) => {
    if (pin.length < 6) {
      const newPin = pin + digit;
      setPin(newPin);
      setPinError('');
      
      // Auto-submit on 4+ digits
      if (newPin.length >= 4 && newPin.length === 4) {
        // Small delay for visual feedback
        setTimeout(() => {
          authenticateWithPin(newPin).then((success) => {
            if (success) {
              router.replace('/(tabs)');
            }
          });
        }, 100);
      }
    }
  };

  const handleBackspace = () => {
    setPin(pin.slice(0, -1));
    setPinError('');
  };

  return (
    <View className="flex-1 bg-primary-900">
      <SafeAreaView className="flex-1">
        <View className="flex-1 items-center justify-center px-8">
          {/* Logo */}
          <Animated.View
            style={{
              transform: [{ scale: logoScale }],
            }}
            className="mb-8"
          >
            <View className="w-24 h-24 bg-white/10 rounded-3xl items-center justify-center">
              <Text className="text-5xl">🌱</Text>
            </View>
          </Animated.View>

          {/* Title */}
          <Animated.View
            style={{ opacity: contentOpacity }}
            className="items-center"
          >
            <Text className="text-3xl font-bold text-white text-center mb-2">
              Recovery Companion
            </Text>
            <Text className="text-white/70 text-center mb-8">
              Your journey is private and secure
            </Text>
          </Animated.View>

          {/* PIN Input */}
          {showPinInput ? (
            <Animated.View
              style={{
                opacity: contentOpacity,
                transform: [{ translateX: shakeAnimation }],
              }}
              className="w-full items-center"
            >
              {/* PIN Dots */}
              <View className="flex-row gap-4 mb-6">
                {[0, 1, 2, 3, 4, 5].map((i) => (
                  <View
                    key={i}
                    className={`w-4 h-4 rounded-full ${
                      i < pin.length
                        ? 'bg-white'
                        : 'bg-white/20'
                    }`}
                  />
                ))}
              </View>

              {pinError ? (
                <Text className="text-red-400 mb-4">{pinError}</Text>
              ) : (
                <Text className="text-white/60 mb-4">Enter your PIN</Text>
              )}

              {/* Number Pad */}
              <View className="w-full max-w-xs">
                {[[1, 2, 3], [4, 5, 6], [7, 8, 9], ['', 0, '⌫']].map(
                  (row, rowIndex) => (
                    <View key={rowIndex} className="flex-row justify-center mb-4">
                      {row.map((digit, i) => (
                        <TouchableOpacity
                          key={i}
                          onPress={() => {
                            if (digit === '⌫') {
                              handleBackspace();
                            } else if (digit !== '') {
                              handlePinDigit(digit.toString());
                            }
                          }}
                          disabled={digit === ''}
                          className={`w-20 h-20 mx-2 items-center justify-center rounded-full ${
                            digit !== ''
                              ? 'bg-white/10 active:bg-white/20'
                              : ''
                          }`}
                        >
                          <Text className="text-3xl text-white">
                            {digit}
                          </Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  )
                )}
              </View>

              {/* Biometric option */}
              {biometricAvailable && (
                <TouchableOpacity
                  onPress={handleBiometricAuth}
                  className="mt-4"
                >
                  <Text className="text-primary-300 text-base">
                    Use {Platform.OS === 'ios' ? 'Face ID / Touch ID' : 'Biometrics'}
                  </Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          ) : (
            <Animated.View
              style={{ opacity: contentOpacity }}
              className="items-center"
            >
              {/* Unlock Button (Biometric) */}
              <TouchableOpacity
                onPress={handleBiometricAuth}
                className="bg-white/10 rounded-2xl px-8 py-4 flex-row items-center gap-3 mb-4"
              >
                <Text className="text-3xl">
                  {Platform.OS === 'ios' ? '🔐' : '👆'}
                </Text>
                <Text className="text-white text-lg font-semibold">
                  Unlock
                </Text>
              </TouchableOpacity>

              {hasPinSet && (
                <TouchableOpacity
                  onPress={() => setShowPinInput(true)}
                  className="mt-2"
                >
                  <Text className="text-white/60">Use PIN instead</Text>
                </TouchableOpacity>
              )}
            </Animated.View>
          )}
        </View>

        {/* Footer */}
        <View className="px-8 pb-8">
          <Text className="text-white/40 text-center text-xs">
            All your data is encrypted and stored locally on your device
          </Text>
        </View>
      </SafeAreaView>
    </View>
  );
}


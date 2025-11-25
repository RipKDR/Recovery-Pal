/**
 * Onboarding Step 1: Welcome
 * Introduction and privacy commitment
 */

import React, { useRef, useEffect } from 'react';
import { View, Text, Animated, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button } from '../../components/ui';

const { width } = Dimensions.get('window');

export default function WelcomeScreen() {
  const router = useRouter();

  // Animations
  const fadeIn = useRef(new Animated.Value(0)).current;
  const slideUp = useRef(new Animated.Value(50)).current;
  const iconScale = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(iconScale, {
        toValue: 1,
        tension: 40,
        friction: 7,
        useNativeDriver: true,
      }),
      Animated.timing(fadeIn, {
        toValue: 1,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
      Animated.timing(slideUp, {
        toValue: 0,
        duration: 600,
        delay: 200,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
      <View className="flex-1 px-6">
        {/* Progress Indicator */}
        <View className="flex-row justify-center gap-2 mt-4 mb-8">
          {[0, 1, 2, 3].map((step) => (
            <View
              key={step}
              className={`h-2 rounded-full ${
                step === 0
                  ? 'w-8 bg-primary-500'
                  : 'w-2 bg-surface-300 dark:bg-surface-700'
              }`}
            />
          ))}
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-center">
          <Animated.View
            style={{ transform: [{ scale: iconScale }] }}
            className="mb-8"
          >
            <View className="w-32 h-32 bg-primary-100 dark:bg-primary-900/30 rounded-full items-center justify-center">
              <Text className="text-6xl">🌱</Text>
            </View>
          </Animated.View>

          <Animated.View
            style={{
              opacity: fadeIn,
              transform: [{ translateY: slideUp }],
            }}
            className="items-center"
          >
            <Text className="text-3xl font-bold text-surface-900 dark:text-surface-100 text-center mb-4">
              Welcome to Your{'\n'}Recovery Journey
            </Text>

            <Text className="text-lg text-surface-600 dark:text-surface-400 text-center mb-6 px-4">
              A private, secure companion to support your path to wellness.
            </Text>

            {/* Privacy Commitments */}
            <View className="bg-surface-100 dark:bg-surface-800 rounded-2xl p-5 w-full max-w-sm">
              <Text className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
                Our Privacy Promise
              </Text>
              
              {[
                { icon: '🔒', text: 'Your data never leaves your device' },
                { icon: '🚫', text: 'No accounts, no tracking' },
                { icon: '🔐', text: 'Encrypted journal entries' },
                { icon: '💚', text: 'Built with compassion' },
              ].map((item, index) => (
                <View key={index} className="flex-row items-center gap-3 mb-2">
                  <Text className="text-xl">{item.icon}</Text>
                  <Text className="text-surface-700 dark:text-surface-300 flex-1">
                    {item.text}
                  </Text>
                </View>
              ))}
            </View>
          </Animated.View>
        </View>

        {/* Actions */}
        <View className="pb-6">
          <Button
            title="Get Started"
            onPress={() => router.push('/onboarding/date')}
            size="lg"
          />
          <Text className="text-center text-surface-500 text-sm mt-4">
            Takes about 2 minutes to set up
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}


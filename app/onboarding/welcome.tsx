/**
 * Onboarding Step 1: Welcome
 * Introduction and privacy commitment
 * BMAD Upgrade: Reanimated + Glass Card + Premium Polished
 */

import React from 'react';
import { View, Text } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Button, Card } from '../../components/ui';
import Animated, { FadeInDown, ZoomIn } from 'react-native-reanimated';

export default function WelcomeScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-navy-950">
      {/* Background Gradients */}
      <View className="absolute top-0 left-0 right-0 h-full overflow-hidden pointer-events-none">
        <View className="absolute top-[-20%] left-[-20%] w-[80%] h-[50%] bg-primary-900/20 rounded-full blur-3xl" />
        <View className="absolute bottom-[-20%] right-[-20%] w-[80%] h-[50%] bg-secondary-900/10 rounded-full blur-3xl" />
      </View>

      <View className="flex-1 px-6">
        {/* Progress Indicator */}
        <View className="flex-row justify-center gap-2 mt-6 mb-12">
          {[0, 1, 2, 3].map((step) => (
            <View
              key={step}
              className={`h-1.5 rounded-full ${step === 0
                  ? 'w-8 bg-primary-500'
                  : 'w-2 bg-surface-700'
                }`}
            />
          ))}
        </View>

        {/* Content */}
        <View className="flex-1 justify-center items-center">
          <Animated.View
            entering={ZoomIn.duration(800).springify()}
            className="mb-10"
          >
            <View className="w-32 h-32 bg-primary-500/10 rounded-full items-center justify-center border border-primary-500/20 shadow-2xl shadow-primary-500/20">
              <Text className="text-6xl">🌱</Text>
            </View>
          </Animated.View>

          <Animated.View
            entering={FadeInDown.delay(200).springify()}
            className="items-center w-full"
          >
            <Text className="text-4xl font-bold text-white text-center mb-4 tracking-tight leading-tight">
              Welcome to Your{'\n'}Recovery Journey
            </Text>

            <Text className="text-lg text-surface-400 text-center mb-10 px-4 leading-relaxed">
              A private, secure companion to support your path to wellness.
            </Text>

            {/* Privacy Commitments */}
            <Card variant="glass" className="w-full max-w-sm mb-4">
              <Text className="text-lg font-semibold text-white mb-4 text-center">
                Our Privacy Promise
              </Text>

              <View className="gap-4">
                {[
                  { icon: '🔒', text: 'On-device storage only' },
                  { icon: '🚫', text: 'No accounts, no tracking' },
                  { icon: '🔐', text: 'Zero knowledge encryption' },
                  { icon: '💚', text: 'Free forever' },
                ].map((item, index) => (
                  <View key={index} className="flex-row items-center gap-4">
                    <View className="w-10 h-10 rounded-full bg-white/5 items-center justify-center">
                      <Text className="text-xl">{item.icon}</Text>
                    </View>
                    <Text className="text-surface-300 flex-1 font-medium">
                      {item.text}
                    </Text>
                  </View>
                ))}
              </View>
            </Card>
          </Animated.View>
        </View>

        {/* Actions */}
        <Animated.View
          entering={FadeInDown.delay(400).springify()}
          className="pb-8"
        >
          <Button
            title="Get Started"
            onPress={() => router.push('/onboarding/date')}
            size="lg"
            className="shadow-lg shadow-primary-500/30"
          />
          <Text className="text-center text-surface-600 text-sm mt-5">
            Takes about 2 minutes to set up
          </Text>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}


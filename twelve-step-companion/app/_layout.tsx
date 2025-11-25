/**
 * Root Layout
 * App initialization and global providers
 * Phase 4: Added ErrorBoundary and performance optimizations
 */

import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Stack, useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, Text, ActivityIndicator, TouchableOpacity } from 'react-native';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import * as Notifications from 'expo-notifications';
import * as SplashScreen from 'expo-splash-screen';
import { initializeDatabase } from '../lib/db';
import { initializeEncryptionKey } from '../lib/encryption';
import { useSettingsStore } from '../lib/store';
import {
  initializeNotifications,
  addNotificationResponseListener,
  addNotificationReceivedListener,
} from '../lib/notifications';
import { CrisisButton, ErrorBoundary } from '../components/common';
import '../global.css';

// Keep splash screen visible while we initialize
SplashScreen.preventAutoHideAsync().catch(() => {
  // Splash screen may have already been hidden
});

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      retry: 2,
    },
  },
});

function AppInitializer({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isRetrying, setIsRetrying] = useState(false);
  const { loadSettings, settings } = useSettingsStore();
  const router = useRouter();
  
  // Notification listeners - using EventSubscription type
  const notificationListener = useRef<Notifications.EventSubscription | null>(null);
  const responseListener = useRef<Notifications.EventSubscription | null>(null);

  const initialize = useCallback(async () => {
    try {
      setIsRetrying(true);
      setError(null);
      
      // Initialize database
      await initializeDatabase();
      
      // Initialize encryption
      await initializeEncryptionKey();
      
      // Load settings
      await loadSettings();
      
      setIsReady(true);
    } catch (err) {
      console.error('Initialization error:', err);
      setError('Failed to initialize app. Please try again.');
    } finally {
      setIsRetrying(false);
      // Hide splash screen after initialization (success or fail)
      await SplashScreen.hideAsync().catch(() => {});
    }
  }, [loadSettings]);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Initialize notifications after settings are loaded
  useEffect(() => {
    if (isReady && settings) {
      initializeNotifications(
        settings.notificationsEnabled,
        settings.checkInTime
      );
    }
  }, [isReady, settings?.notificationsEnabled, settings?.checkInTime]);

  // Set up notification listeners
  useEffect(() => {
    // Listener for notifications received while app is foregrounded
    notificationListener.current = addNotificationReceivedListener(
      (notification) => {
        console.log('Notification received in foreground:', notification);
      }
    );

    // Listener for when user taps on notification
    responseListener.current = addNotificationResponseListener((response) => {
      const data = response.notification.request.content.data;
      
      // Navigate based on notification data
      if (data?.screen === 'checkin') {
        router.push('/checkin');
      } else if (data?.screen === 'progress') {
        router.push('/(tabs)/progress');
      }
    });

    return () => {
      // Remove notification subscriptions using the remove() method
      notificationListener.current?.remove();
      responseListener.current?.remove();
    };
  }, [router]);

  if (error) {
    return (
      <View className="flex-1 items-center justify-center bg-surface-50 dark:bg-surface-900 p-6">
        <View className="w-20 h-20 rounded-full bg-amber-100 dark:bg-amber-900/30 items-center justify-center mb-6">
          <Text className="text-4xl">⚠️</Text>
        </View>
        <Text className="text-xl font-bold text-surface-900 dark:text-surface-100 text-center mb-2">
          Unable to Start
        </Text>
        <Text className="text-surface-600 dark:text-surface-400 text-center mb-6 px-4">
          {error}
        </Text>
        <TouchableOpacity
          onPress={initialize}
          disabled={isRetrying}
          className="bg-primary-600 rounded-xl px-8 py-4 mb-4"
          accessibilityRole="button"
          accessibilityLabel="Retry initialization"
        >
          {isRetrying ? (
            <ActivityIndicator color="#fff" size="small" />
          ) : (
            <Text className="text-white font-semibold text-lg">Try Again</Text>
          )}
        </TouchableOpacity>
        <View className="mt-8 p-4 border border-red-200 dark:border-red-800 rounded-xl">
          <Text className="text-red-600 dark:text-red-400 text-center font-semibold">
            🆘 Need Help? Call 988
          </Text>
          <Text className="text-surface-500 text-center text-sm mt-1">
            Suicide & Crisis Lifeline (US)
          </Text>
        </View>
      </View>
    );
  }

  if (!isReady) {
    return (
      <View className="flex-1 items-center justify-center bg-primary-900">
        <ActivityIndicator size="large" color="#60a5fa" />
        <Text className="text-white mt-4 text-lg">Loading...</Text>
      </View>
    );
  }

  return (
    <>
      {children}
      <CrisisButton />
    </>
  );
}

export default function RootLayout() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <AppInitializer>
          <StatusBar style="auto" />
          <Stack
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: 'transparent' },
            }}
          >
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="onboarding" options={{ headerShown: false }} />
            <Stack.Screen name="checkin" options={{ headerShown: false, presentation: 'modal' }} />
            <Stack.Screen name="journal" options={{ headerShown: false }} />
            <Stack.Screen name="meetings" options={{ headerShown: false }} />
            <Stack.Screen name="capsule" options={{ headerShown: false }} />
            <Stack.Screen name="settings" options={{ headerShown: false }} />
            <Stack.Screen
              name="modal"
              options={{
                presentation: 'modal',
                headerShown: true,
                headerTitle: '',
              }}
            />
          </Stack>
        </AppInitializer>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

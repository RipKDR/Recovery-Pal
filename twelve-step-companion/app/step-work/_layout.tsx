/**
 * Step Work Layout
 * Wraps all step work screens
 */

import { Stack } from 'expo-router';

export default function StepWorkLayout() {
  return (
    <Stack
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="[step]" />
      <Stack.Screen name="4/inventory" />
      <Stack.Screen name="8-9" />
      <Stack.Screen name="10" />
      <Stack.Screen name="11" />
    </Stack>
  );
}


/**
 * Tab Layout
 * Main tab navigation for the app with accessibility and theme support
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, useColorScheme } from 'react-native';

// Tab bar icons with accessibility labels
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    index: '🏠',
    journal: '📝',
    progress: '📊',
    tools: '🧰',
  };

  const labels: Record<string, string> = {
    index: 'Home',
    journal: 'Journal',
    progress: 'Progress',
    tools: 'Tools',
  };

  return (
    <View className="items-center justify-center py-1">
      <Text className="text-xl" accessibilityElementsHidden>{icons[name] || '•'}</Text>
      <Text
        className={`text-xs mt-0.5 ${
          focused
            ? 'text-primary-600 font-semibold'
            : 'text-surface-500'
        }`}
        accessibilityElementsHidden
      >
        {labels[name] || name}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: isDark ? '#1f2937' : '#ffffff',
          borderTopColor: isDark ? '#374151' : '#e4e4e7',
          height: 70,
          paddingBottom: 8,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ focused }) => <TabIcon name="index" focused={focused} />,
          tabBarAccessibilityLabel: 'Home tab. View your dashboard and sobriety counter',
        }}
      />
      <Tabs.Screen
        name="journal"
        options={{
          title: 'Journal',
          tabBarIcon: ({ focused }) => <TabIcon name="journal" focused={focused} />,
          tabBarAccessibilityLabel: 'Journal tab. View and create journal entries',
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: 'Progress',
          tabBarIcon: ({ focused }) => <TabIcon name="progress" focused={focused} />,
          tabBarAccessibilityLabel: 'Progress tab. View your milestones and achievements',
        }}
      />
      <Tabs.Screen
        name="tools"
        options={{
          title: 'Tools',
          tabBarIcon: ({ focused }) => <TabIcon name="tools" focused={focused} />,
          tabBarAccessibilityLabel: 'Tools tab. Access recovery resources and exercises',
        }}
      />
    </Tabs>
  );
}

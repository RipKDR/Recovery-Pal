/**
 * Tab Layout
 * 6-tab navigation matching reference site design
 * Home | Steps | Journal | Insights | Emergency | More
 */

import React from 'react';
import { Tabs } from 'expo-router';
import { View, Text, Platform } from 'react-native';
import { Feather } from '@expo/vector-icons';

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

// Tab configuration with icons
const TAB_CONFIG: Record<string, { icon: FeatherIconName; label: string }> = {
  index: { icon: 'home', label: 'Home' },
  steps: { icon: 'book-open', label: 'Steps' },
  journal: { icon: 'edit-3', label: 'Journal' },
  insights: { icon: 'bar-chart-2', label: 'Insights' },
  emergency: { icon: 'alert-circle', label: 'Emergency' },
  more: { icon: 'more-horizontal', label: 'More' },
};

// Tab bar icon component
function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const config = TAB_CONFIG[name] || { icon: 'circle', label: name };
  const activeColor = '#3b82f6'; // primary blue
  const inactiveColor = '#64748b'; // muted gray
  
  return (
    <View className="items-center justify-center py-1">
      <View
        className={`p-2 rounded-xl ${focused ? 'bg-primary-500/20' : 'bg-transparent'}`}
      >
        <Feather
          name={config.icon}
          size={22}
          color={focused ? activeColor : inactiveColor}
        />
      </View>
      <Text
        className={`text-xs mt-1 ${
          focused
            ? 'text-primary-500 font-semibold'
            : 'text-surface-500'
        }`}
        style={{ fontSize: 10 }}
      >
        {config.label}
      </Text>
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0f172a', // Dark navy
          borderTopColor: 'rgba(51, 65, 85, 0.5)',
          borderTopWidth: 1,
          height: Platform.OS === 'ios' ? 88 : 70,
          paddingBottom: Platform.OS === 'ios' ? 28 : 8,
          paddingTop: 8,
        },
        tabBarShowLabel: false,
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#64748b',
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
        name="steps"
        options={{
          title: 'Steps',
          tabBarIcon: ({ focused }) => <TabIcon name="steps" focused={focused} />,
          tabBarAccessibilityLabel: 'Steps tab. Work through the 12 steps',
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
        name="insights"
        options={{
          title: 'Insights',
          tabBarIcon: ({ focused }) => <TabIcon name="insights" focused={focused} />,
          tabBarAccessibilityLabel: 'Insights tab. View mood analytics and patterns',
        }}
      />
      <Tabs.Screen
        name="emergency"
        options={{
          title: 'Emergency',
          tabBarIcon: ({ focused }) => <TabIcon name="emergency" focused={focused} />,
          tabBarAccessibilityLabel: 'Emergency tab. Access crisis resources and support',
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ focused }) => <TabIcon name="more" focused={focused} />,
          tabBarAccessibilityLabel: 'More tab. Additional tools and settings',
        }}
      />
    </Tabs>
  );
}

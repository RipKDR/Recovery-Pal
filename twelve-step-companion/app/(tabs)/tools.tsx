/**
 * Tools Screen
 * Recovery tools and resources with accessibility support
 * Phase 3: Added collapsible sections for cleaner UX
 */

import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card } from '../../components/ui';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface ToolItem {
  id: string;
  title: string;
  description: string;
  emoji: string;
  route?: string;
  comingSoon?: boolean;
  priority?: 'primary' | 'secondary' | 'advanced';
}

// Reorganized tools with priority tiers (per Phase 0 assessment)
const tools: ToolItem[] = [
  // Tier 1: Primary - Crisis & Daily (always visible first)
  {
    id: 'emergency',
    title: 'Emergency Resources',
    description: 'Crisis hotlines and immediate help',
    emoji: '🆘',
    route: '/emergency',
    priority: 'primary',
  },
  {
    id: 'motivation-vault',
    title: 'Motivation Vault',
    description: 'Your personal reasons for recovery',
    emoji: '🔐',
    route: '/vault',
    priority: 'primary',
  },
  {
    id: 'breathing',
    title: 'Breathing Exercises',
    description: 'Calm your mind with guided breathing',
    emoji: '🧘',
    route: '/breathing',
    priority: 'primary',
  },
  // Tier 2: Secondary - Regular Recovery
  {
    id: 'step-work',
    title: 'Step Work Guide',
    description: 'Guided prompts for working the 12 steps',
    emoji: '📖',
    route: '/step-work',
    priority: 'secondary',
  },
  {
    id: 'meeting-tracker',
    title: 'Meeting Tracker',
    description: 'Log and track your meeting attendance',
    emoji: '📍',
    route: '/meetings',
    priority: 'secondary',
  },
  {
    id: 'daily-affirmations',
    title: 'Daily Affirmations',
    description: 'Positive affirmations for your journey',
    emoji: '💬',
    route: '/affirmations',
    priority: 'secondary',
  },
  // Tier 3: Advanced - Power User
  {
    id: 'trigger-scenarios',
    title: 'Trigger Scenarios',
    description: 'Practice coping with common triggers',
    emoji: '🎯',
    route: '/scenarios',
    priority: 'advanced',
  },
  {
    id: 'time-capsule',
    title: 'Time Capsule',
    description: 'Write letters to your future self',
    emoji: '💌',
    route: '/capsule',
    priority: 'advanced',
  },
];

// Literature & Resources tools (Phase 5)
const literatureTools: ToolItem[] = [
  {
    id: 'prayers',
    title: 'Prayer Library',
    description: 'Recovery prayers for every situation',
    emoji: '🙏',
    route: '/prayers',
    priority: 'secondary',
  },
  {
    id: 'readings',
    title: 'Readings Library',
    description: 'Common recovery readings',
    emoji: '📖',
    route: '/readings',
    priority: 'secondary',
  },
  {
    id: 'slogans',
    title: 'Slogans',
    description: 'Recovery slogans explained',
    emoji: '💬',
    route: '/slogans',
    priority: 'secondary',
  },
  {
    id: 'promises',
    title: 'The Promises',
    description: 'Track your spiritual growth',
    emoji: '✨',
    route: '/promises',
    priority: 'secondary',
  },
  {
    id: 'literature',
    title: 'Literature Progress',
    description: 'Track your reading journey',
    emoji: '📚',
    route: '/literature',
    priority: 'secondary',
  },
];

function ToolCard({ tool, onPress }: { tool: ToolItem; onPress: () => void }) {
  const isPrimary = tool.priority === 'primary';
  
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={tool.comingSoon}
      activeOpacity={0.7}
      className="w-[48%] mb-3"
      accessibilityRole="button"
      accessibilityLabel={tool.title}
      accessibilityHint={tool.comingSoon ? 'Coming soon' : tool.description}
      accessibilityState={{ disabled: tool.comingSoon }}
    >
      <Card
        variant={isPrimary ? 'elevated' : tool.comingSoon ? 'outlined' : 'default'}
        className={`${tool.comingSoon ? 'opacity-60' : ''} ${isPrimary ? 'border-2 border-primary-200 dark:border-primary-800' : ''}`}
      >
        <View className="items-center py-2">
          <Text className="text-3xl mb-2" accessibilityElementsHidden>{tool.emoji}</Text>
          <Text className="text-base font-semibold text-surface-900 dark:text-surface-100 text-center">
            {tool.title}
          </Text>
          <Text className="text-xs text-surface-500 text-center mt-1">
            {tool.comingSoon ? 'Coming Soon' : tool.description}
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

// Collapsible section component
function CollapsibleSection({
  title,
  emoji,
  isExpanded,
  onToggle,
  children,
  itemCount,
}: {
  title: string;
  emoji: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
  itemCount: number;
}) {
  return (
    <View className="mb-4">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between py-2 mb-2"
        accessibilityRole="button"
        accessibilityLabel={`${title} section, ${itemCount} tools, ${isExpanded ? 'expanded' : 'collapsed'}`}
        accessibilityHint="Double tap to expand or collapse this section"
        accessibilityState={{ expanded: isExpanded }}
      >
        <View className="flex-row items-center gap-2">
          <Text className="text-lg" accessibilityElementsHidden>{emoji}</Text>
          <Text className="text-sm font-semibold text-surface-600 dark:text-surface-400 uppercase">
            {title}
          </Text>
          <View className="bg-surface-200 dark:bg-surface-700 rounded-full px-2 py-0.5">
            <Text className="text-xs text-surface-500">{itemCount}</Text>
          </View>
        </View>
        <Text 
          className="text-surface-400 text-lg"
          accessibilityElementsHidden
        >
          {isExpanded ? '▼' : '▶'}
        </Text>
      </TouchableOpacity>
      {isExpanded && children}
    </View>
  );
}

export default function ToolsScreen() {
  const router = useRouter();
  
  // Collapsible section states - Primary always expanded, others collapsed by default
  const [secondaryExpanded, setSecondaryExpanded] = useState(false);
  const [literatureExpanded, setLiteratureExpanded] = useState(false);
  const [advancedExpanded, setAdvancedExpanded] = useState(false);

  const handleToolPress = (tool: ToolItem) => {
    if (tool.route && !tool.comingSoon) {
      router.push(tool.route as any);
    }
  };

  const toggleSection = (section: 'secondary' | 'literature' | 'advanced') => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    if (section === 'secondary') {
      setSecondaryExpanded(!secondaryExpanded);
    } else if (section === 'literature') {
      setLiteratureExpanded(!literatureExpanded);
    } else {
      setAdvancedExpanded(!advancedExpanded);
    }
  };

  // Get tools by tier
  const primaryTools = tools.filter(t => t.priority === 'primary');
  const secondaryTools = tools.filter(t => t.priority === 'secondary');
  const advancedTools = tools.filter(t => t.priority === 'advanced');

  return (
    <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <Text 
          className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2"
          accessibilityRole="header"
        >
          Recovery Tools
        </Text>
        <Text className="text-surface-500 mb-6">
          Resources to support your journey
        </Text>

        {/* Quick Access Card - Emergency */}
        <TouchableOpacity
          onPress={() => router.push('/emergency')}
          activeOpacity={0.8}
          accessibilityRole="button"
          accessibilityLabel="Emergency resources and crisis support"
          accessibilityHint="Tap for immediate access to crisis hotlines and help"
        >
          <Card variant="elevated" className="mb-6 bg-red-50 dark:bg-red-900/30 border-2 border-red-200 dark:border-red-800">
            <View className="flex-row items-center gap-3">
              <View className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-800 items-center justify-center">
                <Text className="text-2xl" accessibilityElementsHidden>🆘</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-semibold text-red-900 dark:text-red-100">
                  Need Help Now?
                </Text>
                <Text className="text-sm text-red-700 dark:text-red-300">
                  Tap for crisis resources and hotlines →
                </Text>
              </View>
            </View>
          </Card>
        </TouchableOpacity>

        {/* Primary Tools Section - Always visible */}
        <View className="mb-4">
          <View className="flex-row items-center gap-2 mb-3">
            <Text className="text-lg" accessibilityElementsHidden>⭐</Text>
            <Text 
              className="text-sm font-semibold text-surface-600 dark:text-surface-400 uppercase"
              accessibilityRole="header"
            >
              Essential Tools
            </Text>
          </View>
          <View className="flex-row flex-wrap justify-between">
            {primaryTools.filter(t => t.id !== 'emergency').map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onPress={() => handleToolPress(tool)}
              />
            ))}
          </View>
        </View>

        {/* Secondary Tools Section - Collapsible */}
        <CollapsibleSection
          title="Recovery Work"
          emoji="📖"
          isExpanded={secondaryExpanded}
          onToggle={() => toggleSection('secondary')}
          itemCount={secondaryTools.length}
        >
          <View className="flex-row flex-wrap justify-between">
            {secondaryTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onPress={() => handleToolPress(tool)}
              />
            ))}
          </View>
        </CollapsibleSection>

        {/* Literature & Resources Section - Collapsible */}
        <CollapsibleSection
          title="Literature & Resources"
          emoji="📚"
          isExpanded={literatureExpanded}
          onToggle={() => toggleSection('literature')}
          itemCount={literatureTools.length}
        >
          <View className="flex-row flex-wrap justify-between">
            {literatureTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onPress={() => handleToolPress(tool)}
              />
            ))}
          </View>
        </CollapsibleSection>

        {/* Advanced Tools Section - Collapsible */}
        <CollapsibleSection
          title="Advanced Tools"
          emoji="🎯"
          isExpanded={advancedExpanded}
          onToggle={() => toggleSection('advanced')}
          itemCount={advancedTools.length}
        >
          <View className="flex-row flex-wrap justify-between">
            {advancedTools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                onPress={() => handleToolPress(tool)}
              />
            ))}
          </View>
        </CollapsibleSection>

        {/* Helpful tip */}
        <Card variant="default" className="mb-4 bg-primary-50 dark:bg-primary-900/20">
          <View className="flex-row items-start gap-3">
            <Text className="text-xl" accessibilityElementsHidden>💡</Text>
            <Text className="flex-1 text-sm text-primary-800 dark:text-primary-200">
              Start with the essential tools. As you progress in your recovery, explore the Recovery Work and Advanced sections for deeper practice.
            </Text>
          </View>
        </Card>

        {/* Serenity Prayer Card */}
        <Card 
          variant="outlined" 
          className="mt-4 mb-6"
          accessibilityLabel="Serenity Prayer: God, grant me the serenity to accept the things I cannot change, courage to change the things I can, and wisdom to know the difference."
        >
          <Text className="text-center text-surface-600 dark:text-surface-400 italic leading-6">
            "God, grant me the serenity to accept the things I cannot change,{'\n'}
            courage to change the things I can,{'\n'}
            and wisdom to know the difference."
          </Text>
          <Text className="text-center text-surface-400 text-sm mt-2">
            — Serenity Prayer
          </Text>
        </Card>

        {/* Bottom spacing */}
        <View className="h-6" />
      </ScrollView>
    </SafeAreaView>
  );
}

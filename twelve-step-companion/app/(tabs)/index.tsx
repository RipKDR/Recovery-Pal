/**
 * Home/Dashboard Screen
 * Main recovery dashboard - matches reference site design
 */

import React, { useCallback, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, LayoutAnimation, Platform, UIManager } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { SobrietyCounter } from '../../components/progress';
import { Card, Button } from '../../components/ui';
import { useSobriety } from '../../lib/hooks/useSobriety';
import { useCheckin } from '../../lib/hooks/useCheckin';
import { useJournalStore } from '../../lib/store';
import { STEP_PROMPTS } from '../../lib/constants/stepPrompts';

// Enable LayoutAnimation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

type FeatherIconName = React.ComponentProps<typeof Feather>['name'];

// Shortcut card component
function ShortcutCard({
  icon,
  title,
  description,
  onPress,
  color = 'primary',
}: {
  icon: FeatherIconName;
  title: string;
  description: string;
  onPress: () => void;
  color?: 'primary' | 'success' | 'danger' | 'warning';
}) {
  const colorMap = {
    primary: { bg: 'bg-primary-500/20', icon: '#60a5fa' },
    success: { bg: 'bg-success-500/20', icon: '#4ade80' },
    danger: { bg: 'bg-danger-500/20', icon: '#f87171' },
    warning: { bg: 'bg-accent-500/20', icon: '#fb923c' },
  };
  
  return (
    <TouchableOpacity
      onPress={onPress}
      className="flex-1 bg-navy-800/40 rounded-2xl p-4 border border-surface-700/30"
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityHint={description}
    >
      <View className={`w-10 h-10 rounded-xl items-center justify-center mb-3 ${colorMap[color].bg}`}>
        <Feather name={icon} size={20} color={colorMap[color].icon} />
      </View>
      <Text className="text-white font-semibold">{title}</Text>
      <Text className="text-surface-400 text-sm mt-1" numberOfLines={2}>{description}</Text>
    </TouchableOpacity>
  );
}

// Collapsible section component
function CollapsibleSection({
  icon,
  title,
  isExpanded,
  onToggle,
  children,
}: {
  icon: FeatherIconName;
  title: string;
  isExpanded: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <View className="bg-navy-800/40 rounded-2xl border border-surface-700/30 mb-4">
      <TouchableOpacity
        onPress={onToggle}
        className="flex-row items-center justify-between p-4"
        accessibilityRole="button"
        accessibilityLabel={`${title}, ${isExpanded ? 'expanded' : 'collapsed'}`}
      >
        <View className="flex-row items-center gap-2">
          <Feather name={icon} size={18} color="#60a5fa" />
          <Text className="text-white font-semibold">{title}</Text>
        </View>
        <Feather 
          name={isExpanded ? 'chevron-up' : 'chevron-down'} 
          size={20} 
          color="#64748b" 
        />
      </TouchableOpacity>
      {isExpanded && (
        <View className="px-4 pb-4 border-t border-surface-700/30 pt-4">
          {children}
        </View>
      )}
    </View>
  );
}

// Intention selector component
function IntentionSelector({ onSelect }: { onSelect: (intention: string) => void }) {
  const intentions = ['Stay Clean', 'Stay Connected', 'Be Gentle with Myself'];
  const [selected, setSelected] = useState<string | null>(null);
  
  return (
    <View>
      <Text className="text-surface-400 text-sm mb-3">
        Pick one intention for today (or create your own)
      </Text>
      <View className="flex-row flex-wrap gap-2 mb-3">
        {intentions.map((intention) => (
          <TouchableOpacity
            key={intention}
            onPress={() => {
              setSelected(intention);
              onSelect(intention);
            }}
            className={`px-3 py-2 rounded-lg border ${
              selected === intention 
                ? 'bg-primary-500/20 border-primary-500' 
                : 'border-surface-600/50'
            }`}
          >
            <Text className={selected === intention ? 'text-primary-400' : 'text-surface-300'}>
              {intention}
            </Text>
          </TouchableOpacity>
        ))}
        <TouchableOpacity className="px-3 py-2 rounded-lg border border-surface-600/50">
          <Text className="text-surface-400">Custom</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// Mood slider component
function MoodSlider({ label, value, onChange, leftLabel, rightLabel }: {
  label: string;
  value: number;
  onChange: (val: number) => void;
  leftLabel: string;
  rightLabel: string;
}) {
  return (
    <View className="mb-4">
      <View className="flex-row justify-between mb-2">
        <Text className="text-surface-300">{label}</Text>
        <Text className="text-primary-400">{value <= 3 ? leftLabel : value >= 7 ? rightLabel : 'Okay'}</Text>
      </View>
      <View className="h-2 bg-surface-700/50 rounded-full">
        <View 
          className="h-2 bg-primary-500 rounded-full" 
          style={{ width: `${value * 10}%` }} 
        />
      </View>
      <View className="flex-row justify-between mt-1">
        <Text className="text-surface-500 text-xs">{leftLabel}</Text>
        <Text className="text-surface-500 text-xs">{rightLabel}</Text>
      </View>
    </View>
  );
}

export default function DashboardScreen() {
  const router = useRouter();
  const {
    profile,
    soberDays,
    soberHours,
    soberMinutes,
    isLoading: sobrietyLoading,
  } = useSobriety();

  const { hasCheckedInToday } = useCheckin();
  const { entries } = useJournalStore();
  
  // Section expansion states
  const [rhythmExpanded, setRhythmExpanded] = useState(true);
  const [setToneExpanded, setSetToneExpanded] = useState(true);
  const [pulseExpanded, setPulseExpanded] = useState(true);
  const [inventoryExpanded, setInventoryExpanded] = useState(true);
  const [checkinExpanded, setCheckinExpanded] = useState(false);
  
  // Check-in form state
  const [mood, setMood] = useState(7);
  const [craving, setCraving] = useState(2);

  // Calculate current step (first incomplete)
  const getCurrentStep = () => {
    for (const step of STEP_PROMPTS) {
      const stepEntries = entries.filter(e => e.type === 'step-work' && e.stepNumber === step.step);
      if (stepEntries.length < 3) return step.step;
    }
    return 12;
  };
  const currentStep = getCurrentStep();
  const completedSteps = STEP_PROMPTS.filter(s => {
    const stepEntries = entries.filter(e => e.type === 'step-work' && e.stepNumber === s.step);
    return stepEntries.length >= 3;
  }).length;

  const toggleSection = (setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setter(prev => !prev);
  };

  // Navigation handlers
  const navigateTo = useCallback((route: string) => {
    router.push(route as Href);
  }, [router]);

  // If no profile, show onboarding prompt
  if (!sobrietyLoading && !profile) {
    return (
      <SafeAreaView className="flex-1 bg-navy-950">
        <View className="flex-1 items-center justify-center p-6">
          <View className="bg-primary-500/20 p-6 rounded-full mb-6">
            <Feather name="sun" size={48} color="#60a5fa" />
          </View>
          <Text className="text-2xl font-bold text-white text-center">
            Welcome to Recovery Companion
          </Text>
          <Text className="text-surface-400 text-center mt-2 mb-8 px-4">
            Your private, secure companion for your recovery journey.
          </Text>
          <Button
            title="Get Started"
            onPress={() => navigateTo('/onboarding/welcome')}
            size="lg"
            icon="arrow-right"
            iconPosition="right"
          />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-navy-950">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Welcome Header */}
        <View className="px-4 pt-4 pb-4 flex-row items-center gap-3">
          <View className="bg-primary-500/20 p-2 rounded-xl">
            <Feather name="sun" size={24} color="#60a5fa" />
          </View>
          <View className="flex-1">
            <Text className="text-xl font-bold text-white">Welcome back</Text>
            <Text className="text-surface-400 text-sm">
              This space keeps the next right moves visible, not overwhelming.
            </Text>
          </View>
        </View>

        <View className="px-4">
          {/* Clean Time Section */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">Your Clean Time</Text>
            <SobrietyCounter
              days={soberDays}
              hours={soberHours}
              minutes={soberMinutes}
              showDetailed={soberDays >= 30}
            />
          </View>

          {/* Step Progress Section */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-3">Step Progress</Text>
            <View className="flex-row gap-3">
              {/* Current Step */}
              <View className="flex-1 bg-navy-800/40 rounded-2xl p-4 border border-surface-700/30">
                <View className="flex-row items-center gap-2 mb-2">
                  <Feather name="bookmark" size={14} color="#60a5fa" />
                  <Text className="text-primary-400 text-xs uppercase tracking-wider">Current Step</Text>
                </View>
                <View className="flex-row items-baseline">
                  <Text className="text-white text-3xl font-bold">{currentStep}</Text>
                  <Text className="text-surface-500 text-sm ml-1">/12</Text>
                </View>
                <Text className="text-surface-400 text-xs mt-2">
                  Tap from nav to pick up where you stopped.
                </Text>
              </View>
              
              {/* Steps Done */}
              <View className="flex-1 bg-navy-800/40 rounded-2xl p-4 border border-surface-700/30">
                <View className="flex-row items-center gap-2 mb-2">
                  <Feather name="check-circle" size={14} color="#4ade80" />
                  <Text className="text-success-400 text-xs uppercase tracking-wider">Steps Done</Text>
                </View>
                <Text className="text-white text-3xl font-bold">{completedSteps}</Text>
                <Text className="text-surface-400 text-xs mt-2">
                  Marked complete with your sponsor.
                </Text>
              </View>
            </View>
          </View>

          {/* Today Shortcuts Section */}
          <View className="mb-6">
            <Text className="text-white text-lg font-semibold mb-1">Today Shortcuts</Text>
            <Text className="text-surface-500 text-sm mb-3">Curated from your routine</Text>
            
            <View className="gap-3">
              <View className="flex-row gap-3">
                <ShortcutCard
                  icon="book-open"
                  title="Step Work"
                  description={`Continue Step ${currentStep}`}
                  onPress={() => navigateTo('/step-work')}
                  color="primary"
                />
                <ShortcutCard
                  icon="edit-3"
                  title="Journal"
                  description="Capture what actually happened today"
                  onPress={() => navigateTo('/journal/new')}
                  color="primary"
                />
              </View>
              <View className="flex-row gap-3">
                <ShortcutCard
                  icon="alert-circle"
                  title="Emergency"
                  description="Open your support plan instantly"
                  onPress={() => navigateTo('/(tabs)/emergency')}
                  color="danger"
                />
                <ShortcutCard
                  icon="bar-chart-2"
                  title="Insights"
                  description="Patterns, triggers, and progress view"
                  onPress={() => navigateTo('/(tabs)/insights')}
                  color="warning"
                />
              </View>
            </View>
          </View>

          {/* Recovery Rhythm Section */}
          <CollapsibleSection
            icon="activity"
            title="Recovery Rhythm"
            isExpanded={rhythmExpanded}
            onToggle={() => toggleSection(setRhythmExpanded)}
          >
            <Text className="text-surface-400 text-sm mb-4">
              Three quick check-ins to build your daily recovery habit
            </Text>
            
            {/* Set the Tone */}
            <View className="bg-navy-900/40 rounded-xl mb-3 border border-surface-700/20">
              <TouchableOpacity
                onPress={() => toggleSection(setSetToneExpanded)}
                className="flex-row items-center justify-between p-3"
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="sun" size={16} color="#fbbf24" />
                  <Text className="text-white font-medium">Set the Tone</Text>
                </View>
                <Feather name={setToneExpanded ? 'minus' : 'plus'} size={18} color="#64748b" />
              </TouchableOpacity>
              {setToneExpanded && (
                <View className="px-3 pb-3">
                  <IntentionSelector onSelect={() => {}} />
                  <Button
                    title="Set Intention"
                    onPress={() => {}}
                    variant="outline"
                    icon="check"
                    disabled
                  />
                </View>
              )}
            </View>

            {/* Pulse Check */}
            <View className="bg-navy-900/40 rounded-xl mb-3 border border-surface-700/20">
              <TouchableOpacity
                onPress={() => toggleSection(setPulseExpanded)}
                className="flex-row items-center justify-between p-3"
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="activity" size={16} color="#60a5fa" />
                  <Text className="text-white font-medium">Pulse Check</Text>
                </View>
                <Feather name={pulseExpanded ? 'minus' : 'plus'} size={18} color="#64748b" />
              </TouchableOpacity>
              {pulseExpanded && (
                <View className="px-3 pb-3">
                  <MoodSlider
                    label="How's your mood?"
                    value={mood}
                    onChange={setMood}
                    leftLabel="Low"
                    rightLabel="Great"
                  />
                  <MoodSlider
                    label="Craving intensity?"
                    value={craving}
                    onChange={setCraving}
                    leftLabel="None"
                    rightLabel="Intense"
                  />
                  
                  <Text className="text-surface-400 text-sm mb-2">Context (optional)</Text>
                  <View className="flex-row flex-wrap gap-2 mb-4">
                    {['Alone', 'With people', 'Bored', 'Stressed', 'Hungry'].map((ctx) => (
                      <TouchableOpacity
                        key={ctx}
                        className="px-3 py-2 rounded-lg border border-surface-600/50"
                      >
                        <Text className="text-surface-300 text-sm">{ctx}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <Button
                    title="Save Check-In"
                    onPress={() => navigateTo('/checkin')}
                    icon="check"
                  />
                </View>
              )}
            </View>

            {/* Tiny Inventory */}
            <View className="bg-navy-900/40 rounded-xl border border-surface-700/20">
              <TouchableOpacity
                onPress={() => toggleSection(setInventoryExpanded)}
                className="flex-row items-center justify-between p-3"
              >
                <View className="flex-row items-center gap-2">
                  <Feather name="moon" size={16} color="#a78bfa" />
                  <Text className="text-white font-medium">Tiny Inventory</Text>
                </View>
                <Feather name={inventoryExpanded ? 'minus' : 'plus'} size={18} color="#64748b" />
              </TouchableOpacity>
              {inventoryExpanded && (
                <View className="px-3 pb-3">
                  <Text className="text-surface-400 text-sm mb-3">Did I stay clean today?</Text>
                  <View className="flex-row gap-3 mb-4">
                    {['Yes', 'No', 'Close call'].map((option) => (
                      <TouchableOpacity
                        key={option}
                        className="flex-row items-center gap-2"
                      >
                        <View className="w-5 h-5 rounded-full border border-surface-500" />
                        <Text className="text-surface-300">{option}</Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  
                  <Text className="text-surface-400 text-sm mb-2">Did I stay connected?</Text>
                  <View className="gap-2 mb-4">
                    {['Meetings', 'Sponsor', 'Recovery Friends'].map((item) => (
                      <View key={item} className="flex-row items-center justify-between">
                        <Text className="text-surface-300">{item}</Text>
                        <View className="w-10 h-6 bg-surface-700/50 rounded-full" />
                      </View>
                    ))}
                  </View>
                  
                  <Button
                    title="Reflect on Today"
                    onPress={() => navigateTo('/journal/new')}
                    variant="outline"
                    icon="edit-3"
                  />
                </View>
              )}
            </View>
          </CollapsibleSection>

          {/* Today's Check-in */}
          <CollapsibleSection
            icon="check-circle"
            title="Today's Check-in"
            isExpanded={checkinExpanded}
            onToggle={() => toggleSection(setCheckinExpanded)}
          >
            {hasCheckedInToday ? (
              <View className="items-center py-4">
                <Feather name="check-circle" size={32} color="#4ade80" />
                <Text className="text-success-400 font-medium mt-2">You've checked in today!</Text>
              </View>
            ) : (
              <View>
                <Text className="text-surface-400 mb-4">
                  Take a moment to check in with yourself.
                </Text>
                <Button
                  title="Start Check-in"
                  onPress={() => navigateTo('/checkin')}
                  icon="arrow-right"
                  iconPosition="right"
                />
              </View>
            )}
          </CollapsibleSection>
        </View>

        {/* Bottom spacing */}
        <View className="h-24" />
      </ScrollView>

      {/* Floating "I'm in a scene" button */}
      <TouchableOpacity
        onPress={() => navigateTo('/scenarios')}
        className="absolute bottom-24 left-4 bg-accent-500 py-3 px-5 rounded-full flex-row items-center"
        style={{ elevation: 8, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 }}
        accessibilityRole="button"
        accessibilityLabel="I'm in a scene - get immediate help"
      >
        <Feather name="zap" size={18} color="#fff" />
        <Text className="text-white font-semibold ml-2">I'm in a scene</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

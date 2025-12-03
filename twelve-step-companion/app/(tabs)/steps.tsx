/**
 * Steps Tab Screen
 * Work through the 12 steps - matches reference site design
 */

import React, { useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, Href } from 'expo-router';
import { Feather } from '@expo/vector-icons';
import { Card } from '../../components/ui';
import { STEP_PROMPTS } from '../../lib/constants/stepPrompts';
import { useJournalStore } from '../../lib/store';

// Get progress indicator based on journal entries
function getStepProgress(step: number, entries: { type: string; stepNumber?: number }[]): 'none' | 'started' | 'completed' {
  const stepEntries = entries.filter(
    (e) => e.type === 'step-work' && e.stepNumber === step
  );
  if (stepEntries.length === 0) return 'none';
  if (stepEntries.length >= 3) return 'completed';
  return 'started';
}

function StepCard({
  step,
  isCurrent,
  progress,
  onPress,
}: {
  step: typeof STEP_PROMPTS[0];
  isCurrent: boolean;
  progress: 'none' | 'started' | 'completed';
  onPress: () => void;
}) {
  const isLocked = progress === 'none' && !isCurrent;
  
  return (
    <TouchableOpacity 
      onPress={onPress} 
      activeOpacity={0.7}
      disabled={isLocked}
      accessibilityRole="button"
      accessibilityLabel={`Step ${step.step}: ${step.title}`}
      accessibilityHint={isLocked ? 'Locked step' : 'Tap to view step details'}
    >
      <View
        className={`flex-row items-center p-4 rounded-2xl mb-3 ${
          isCurrent 
            ? 'bg-navy-800/80 border border-primary-500/50' 
            : 'bg-navy-800/40 border border-surface-700/30'
        }`}
      >
        {/* Step Number / Icon */}
        <View
          className={`w-12 h-12 rounded-full items-center justify-center mr-4 ${
            isCurrent 
              ? 'bg-primary-500' 
              : progress === 'completed'
              ? 'bg-success-500'
              : 'bg-surface-700/50'
          }`}
        >
          {isCurrent ? (
            <Text className="text-white font-bold text-lg">{step.step}</Text>
          ) : isLocked ? (
            <Feather name="lock" size={18} color="#64748b" />
          ) : (
            <Feather 
              name={progress === 'completed' ? 'check' : 'unlock'} 
              size={18} 
              color={progress === 'completed' ? '#fff' : '#94a3b8'} 
            />
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <View className="flex-row items-center gap-2">
            <Text className={`font-semibold ${isLocked ? 'text-surface-500' : 'text-white'}`}>
              Step {step.step}
            </Text>
            {isCurrent && (
              <View className="bg-primary-500/20 px-2 py-0.5 rounded-full">
                <Text className="text-primary-400 text-xs font-medium">Current</Text>
              </View>
            )}
          </View>
          <Text 
            className={`text-sm mt-0.5 ${isLocked ? 'text-surface-600' : 'text-surface-400'}`}
            numberOfLines={1}
          >
            {step.description}
          </Text>
        </View>

        {/* Arrow */}
        {!isLocked && (
          <Feather name="chevron-right" size={20} color="#64748b" />
        )}
      </View>
    </TouchableOpacity>
  );
}

export default function StepsScreen() {
  const router = useRouter();
  const { entries } = useJournalStore();
  
  // Determine current step (first incomplete step)
  const getCurrentStep = () => {
    for (const step of STEP_PROMPTS) {
      const progress = getStepProgress(step.step, entries);
      if (progress !== 'completed') return step.step;
    }
    return 12; // All complete
  };
  
  const currentStep = getCurrentStep();
  const currentStepData = STEP_PROMPTS.find(s => s.step === currentStep);
  
  // Count completed steps
  const completedSteps = STEP_PROMPTS.filter(
    s => getStepProgress(s.step, entries) === 'completed'
  ).length;

  return (
    <SafeAreaView className="flex-1 bg-navy-950">
      <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View className="px-4 pt-4 pb-6">
          <View className="flex-row items-center gap-3 mb-2">
            <View className="bg-primary-500/20 p-2 rounded-xl">
              <Feather name="book-open" size={24} color="#3b82f6" />
            </View>
            <View>
              <Text className="text-2xl font-bold text-white">Step Work</Text>
            </View>
          </View>
          <Text className="text-surface-400 ml-12">
            Work through the 12 steps at your own pace with your sponsor.
          </Text>
        </View>

        {/* Currently Working On Card */}
        {currentStepData && (
          <View className="px-4 mb-6">
            <View className="bg-navy-800/60 rounded-2xl p-4 border border-surface-700/30">
              <View className="flex-row justify-between items-center mb-3">
                <Text className="text-surface-400 text-xs uppercase tracking-wider">
                  Currently Working On
                </Text>
                <View className="bg-primary-500/20 px-3 py-1 rounded-full">
                  <Text className="text-primary-400 text-xs font-medium">In Progress</Text>
                </View>
              </View>
              
              <Text className="text-white text-2xl font-bold mb-1">
                Step {currentStep}
              </Text>
              <Text className="text-surface-400 mb-4">
                {currentStepData.description}
              </Text>
              
              <TouchableOpacity
                onPress={() => router.push(`/step-work/${currentStep}` as Href)}
                className="bg-primary-500 py-3 px-6 rounded-xl flex-row items-center justify-center"
                accessibilityRole="button"
                accessibilityLabel={`Continue working on Step ${currentStep}`}
              >
                <Text className="text-white font-semibold mr-2">Continue Working</Text>
                <Feather name="arrow-right" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* All Steps Section */}
        <View className="px-4 pb-8">
          <Text className="text-white text-lg font-semibold mb-4">All Steps</Text>
          
          {STEP_PROMPTS.map((step) => {
            const progress = getStepProgress(step.step, entries);
            const isCurrent = step.step === currentStep;
            
            return (
              <StepCard
                key={step.step}
                step={step}
                isCurrent={isCurrent}
                progress={progress}
                onPress={() => router.push(`/step-work/${step.step}` as Href)}
              />
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}


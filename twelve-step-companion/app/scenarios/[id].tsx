/**
 * Individual Scenario Practice Screen
 * Interactive choose-your-own-adventure style scenario
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { Card, Button } from '../../components/ui';
import { useScenarioStore } from '../../lib/store';
import {
  getScenarioById,
  SCENARIO_CATEGORIES,
} from '../../lib/constants/triggerScenarios';

type Stage = 'scenario' | 'choice' | 'outcome' | 'reflection';

export default function ScenarioPracticeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { addPractice } = useScenarioStore();

  const scenario = id ? getScenarioById(id) : null;
  const categoryInfo = scenario
    ? SCENARIO_CATEGORIES.find((c) => c.id === scenario.category)
    : null;

  const [stage, setStage] = useState<Stage>('scenario');
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  if (!scenario) {
    return (
      <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900 items-center justify-center">
        <Text className="text-surface-500">Scenario not found</Text>
        <Button title="Go Back" onPress={() => router.back()} className="mt-4" />
      </SafeAreaView>
    );
  }

  const selectedOption = selectedOptionIndex !== null ? scenario.options[selectedOptionIndex] : null;

  const handleSelectOption = (index: number) => {
    setSelectedOptionIndex(index);
    setStage('outcome');
  };

  const handleContinueToReflection = () => {
    setStage('reflection');
  };

  const handleComplete = async () => {
    if (selectedOptionIndex === null) return;

    setIsSaving(true);
    try {
      await addPractice({
        scenarioId: scenario.id,
        selectedOptionIndex,
        reflection: reflection.trim() || undefined,
      });

      if (selectedOption?.isHealthy) {
        Alert.alert(
          '💪 Great Choice!',
          'You practiced a healthy response. Keep building these habits!',
          [{ text: 'Continue', onPress: () => router.back() }]
        );
      } else {
        Alert.alert(
          '📚 Learning Experience',
          "No judgment—this is practice. You now know a healthier option for next time.",
          [{ text: 'Continue', onPress: () => router.back() }]
        );
      }
    } catch (error) {
      console.error('Failed to save practice:', error);
      Alert.alert('Error', 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleTryAgain = () => {
    setSelectedOptionIndex(null);
    setReflection('');
    setStage('scenario');
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-3">
            <Text className="text-primary-600">← Exit</Text>
          </TouchableOpacity>
          <View className="flex-row items-center gap-2 flex-1">
            <Text className="text-xl">{categoryInfo?.emoji}</Text>
            <Text className="text-base text-surface-500">{categoryInfo?.label}</Text>
          </View>
        </View>

        {/* Progress */}
        <View className="flex-row gap-2 mb-6">
          {['scenario', 'choice', 'outcome', 'reflection'].map((s, i) => (
            <View
              key={s}
              className={`flex-1 h-1 rounded-full ${
                ['scenario', 'choice', 'outcome', 'reflection'].indexOf(stage) >= i
                  ? 'bg-primary-500'
                  : 'bg-surface-200 dark:bg-surface-700'
              }`}
            />
          ))}
        </View>

        {/* Scenario Stage */}
        {(stage === 'scenario' || stage === 'choice') && (
          <>
            <Text className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-4">
              {scenario.title}
            </Text>

            <Card variant="elevated" className="mb-6 bg-surface-100 dark:bg-surface-800">
              <Text className="text-base text-surface-700 dark:text-surface-300 leading-7">
                {scenario.description}
              </Text>
            </Card>

            {stage === 'scenario' && (
              <Button
                title="What do you do?"
                onPress={() => setStage('choice')}
                className="mb-6"
              />
            )}

            {stage === 'choice' && (
              <>
                <Text className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-4">
                  Choose your response:
                </Text>
                {scenario.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    onPress={() => handleSelectOption(index)}
                    activeOpacity={0.7}
                    className="mb-3"
                  >
                    <Card variant="outlined">
                      <View className="flex-row items-start gap-3">
                        <View className="w-8 h-8 rounded-full bg-surface-100 dark:bg-surface-700 items-center justify-center">
                          <Text className="font-semibold text-surface-600 dark:text-surface-400">
                            {String.fromCharCode(65 + index)}
                          </Text>
                        </View>
                        <Text className="flex-1 text-surface-800 dark:text-surface-200">
                          {option.text}
                        </Text>
                      </View>
                    </Card>
                  </TouchableOpacity>
                ))}
              </>
            )}
          </>
        )}

        {/* Outcome Stage */}
        {stage === 'outcome' && selectedOption && (
          <>
            <View className="items-center mb-6">
              <View
                className={`w-20 h-20 rounded-full items-center justify-center mb-4 ${
                  selectedOption.isHealthy
                    ? 'bg-green-100 dark:bg-green-900/30'
                    : 'bg-amber-100 dark:bg-amber-900/30'
                }`}
              >
                <Text className="text-4xl">
                  {selectedOption.isHealthy ? '✓' : '💭'}
                </Text>
              </View>
              <Text
                className={`text-xl font-bold ${
                  selectedOption.isHealthy
                    ? 'text-green-600 dark:text-green-400'
                    : 'text-amber-600 dark:text-amber-400'
                }`}
              >
                {selectedOption.isHealthy ? 'Healthy Choice!' : 'Let\'s Learn'}
              </Text>
            </View>

            {/* Your choice */}
            <Card variant="outlined" className="mb-4">
              <Text className="text-sm text-surface-500 mb-1">You chose:</Text>
              <Text className="text-surface-800 dark:text-surface-200">
                {selectedOption.text}
              </Text>
            </Card>

            {/* Outcome */}
            <Card
              variant="elevated"
              className={`mb-4 ${
                selectedOption.isHealthy
                  ? 'bg-green-50 dark:bg-green-900/20'
                  : 'bg-amber-50 dark:bg-amber-900/20'
              }`}
            >
              <Text className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-2">
                What happens:
              </Text>
              <Text className="text-surface-800 dark:text-surface-200 leading-6">
                {selectedOption.outcome}
              </Text>
            </Card>

            {/* Coping tip */}
            {selectedOption.copingTip && (
              <Card variant="default" className="mb-6 bg-primary-50 dark:bg-primary-900/20">
                <View className="flex-row items-start gap-2">
                  <Text>💡</Text>
                  <View className="flex-1">
                    <Text className="text-sm font-medium text-primary-800 dark:text-primary-200 mb-1">
                      Recovery Insight
                    </Text>
                    <Text className="text-sm text-primary-600 dark:text-primary-400">
                      {selectedOption.copingTip}
                    </Text>
                  </View>
                </View>
              </Card>
            )}

            {/* Better option hint */}
            {!selectedOption.isHealthy && (
              <Card variant="outlined" className="mb-6">
                <Text className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-2">
                  A healthier option would be:
                </Text>
                <Text className="text-surface-800 dark:text-surface-200">
                  {scenario.options[scenario.bestOptionIndex].text}
                </Text>
              </Card>
            )}

            <Button
              title="Continue to Reflection"
              onPress={handleContinueToReflection}
              className="mb-4"
            />

            <TouchableOpacity onPress={handleTryAgain} className="py-3">
              <Text className="text-center text-primary-600">Try Different Choice</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Reflection Stage */}
        {stage === 'reflection' && (
          <>
            <Text className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-4">
              Reflect on This
            </Text>

            <Card variant="elevated" className="mb-6">
              <Text className="text-surface-600 dark:text-surface-400 mb-4">
                Take a moment to think about this scenario. Have you faced something similar?
                How did you handle it?
              </Text>
              <TextInput
                value={reflection}
                onChangeText={setReflection}
                placeholder="Write your thoughts... (optional)"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={5}
                className="bg-surface-100 dark:bg-surface-800 rounded-xl px-4 py-3 text-surface-900 dark:text-surface-100 min-h-[100px]"
                textAlignVertical="top"
              />
            </Card>

            {/* Key Questions */}
            <Card variant="outlined" className="mb-6">
              <Text className="text-sm font-medium text-surface-700 dark:text-surface-300 mb-3">
                Questions to consider:
              </Text>
              <View className="gap-2">
                <Text className="text-sm text-surface-500">
                  • What would make this situation easier to handle?
                </Text>
                <Text className="text-sm text-surface-500">
                  • Who could you call for support in this moment?
                </Text>
                <Text className="text-sm text-surface-500">
                  • What healthy coping tool would help here?
                </Text>
              </View>
            </Card>

            <Button
              title={isSaving ? 'Saving...' : 'Complete Practice'}
              onPress={handleComplete}
              disabled={isSaving}
              size="lg"
            />
          </>
        )}

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}


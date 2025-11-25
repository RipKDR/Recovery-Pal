/**
 * New Meeting Screen
 * Log a meeting with mood, takeaways, and topics
 */

import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Button, Slider } from '../../components/ui';
import { useMeetings } from '../../lib/hooks/useMeetings';
import { MEETING_TOPICS } from '../../lib/constants/meetingTopics';
import type { MeetingType } from '../../lib/types';

export default function NewMeetingScreen() {
  const router = useRouter();
  const { createMeeting } = useMeetings();

  // Form state
  const [meetingName, setMeetingName] = useState('');
  const [location, setLocation] = useState('');
  const [meetingType, setMeetingType] = useState<MeetingType>('in-person');
  const [moodBefore, setMoodBefore] = useState(5);
  const [moodAfter, setMoodAfter] = useState(5);
  const [keyTakeaways, setKeyTakeaways] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Current step in the flow
  const [step, setStep] = useState(1);
  const totalSteps = 4;

  const getMoodEmoji = (mood: number) => {
    if (mood <= 2) return '😢';
    if (mood <= 4) return '😔';
    if (mood <= 6) return '😐';
    if (mood <= 8) return '🙂';
    return '😊';
  };

  const toggleTopic = (topic: string) => {
    setSelectedTopics((prev) =>
      prev.includes(topic)
        ? prev.filter((t) => t !== topic)
        : [...prev, topic]
    );
  };

  const handleNext = () => {
    if (step < totalSteps) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await createMeeting({
        name: meetingName || undefined,
        location: location || undefined,
        type: meetingType,
        moodBefore,
        moodAfter,
        keyTakeaways,
        topicTags: selectedTopics,
      });

      Alert.alert(
        '🎉 Meeting Logged!',
        'Your meeting has been recorded. Keep it up!',
        [{ text: 'OK', onPress: () => router.back() }]
      );
    } catch (error) {
      console.error('Failed to log meeting:', error);
      Alert.alert('Error', 'Failed to save meeting. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView
          className="flex-1 px-4 py-6"
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View className="flex-row items-center justify-between mb-4">
            <TouchableOpacity onPress={handleBack}>
              <Text className="text-primary-600">
                {step > 1 ? '← Back' : '← Cancel'}
              </Text>
            </TouchableOpacity>
            <Text className="text-surface-500">
              Step {step} of {totalSteps}
            </Text>
          </View>

          {/* Progress Bar */}
          <View className="h-2 bg-surface-200 dark:bg-surface-700 rounded-full mb-8">
            <View
              className="h-2 bg-primary-500 rounded-full"
              style={{ width: `${(step / totalSteps) * 100}%` }}
            />
          </View>

          {/* Step 1: Meeting Type & Details */}
          {step === 1 && (
            <View>
              <Text className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">
                Meeting Details
              </Text>
              <Text className="text-surface-500 mb-6">
                What meeting did you attend?
              </Text>

              {/* Meeting Type */}
              <Text className="text-base font-medium text-surface-700 dark:text-surface-300 mb-3">
                Meeting Type
              </Text>
              <View className="flex-row gap-3 mb-6">
                <TouchableOpacity
                  onPress={() => setMeetingType('in-person')}
                  className={`flex-1 p-4 rounded-xl border-2 ${
                    meetingType === 'in-person'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-surface-200 dark:border-surface-700'
                  }`}
                >
                  <Text className="text-3xl text-center mb-2">📍</Text>
                  <Text
                    className={`text-center font-medium ${
                      meetingType === 'in-person'
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-surface-600 dark:text-surface-400'
                    }`}
                  >
                    In Person
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => setMeetingType('online')}
                  className={`flex-1 p-4 rounded-xl border-2 ${
                    meetingType === 'online'
                      ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/30'
                      : 'border-surface-200 dark:border-surface-700'
                  }`}
                >
                  <Text className="text-3xl text-center mb-2">💻</Text>
                  <Text
                    className={`text-center font-medium ${
                      meetingType === 'online'
                        ? 'text-primary-700 dark:text-primary-300'
                        : 'text-surface-600 dark:text-surface-400'
                    }`}
                  >
                    Online
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Meeting Name (optional) */}
              <Text className="text-base font-medium text-surface-700 dark:text-surface-300 mb-2">
                Meeting Name (optional)
              </Text>
              <TextInput
                value={meetingName}
                onChangeText={setMeetingName}
                placeholder="e.g., Friday Night Group"
                placeholderTextColor="#9ca3af"
                className="bg-surface-100 dark:bg-surface-800 rounded-xl px-4 py-3 text-surface-900 dark:text-surface-100 mb-4"
              />

              {/* Location (optional) */}
              <Text className="text-base font-medium text-surface-700 dark:text-surface-300 mb-2">
                Location (optional)
              </Text>
              <TextInput
                value={location}
                onChangeText={setLocation}
                placeholder={
                  meetingType === 'in-person'
                    ? 'e.g., Community Center'
                    : 'e.g., Zoom'
                }
                placeholderTextColor="#9ca3af"
                className="bg-surface-100 dark:bg-surface-800 rounded-xl px-4 py-3 text-surface-900 dark:text-surface-100"
              />
            </View>
          )}

          {/* Step 2: Mood Before */}
          {step === 2 && (
            <View>
              <Text className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">
                Before the Meeting
              </Text>
              <Text className="text-surface-500 mb-8">
                How were you feeling before attending?
              </Text>

              <View className="items-center mb-8">
                <Text className="text-8xl mb-4">{getMoodEmoji(moodBefore)}</Text>
                <Text className="text-4xl font-bold text-surface-900 dark:text-surface-100">
                  {moodBefore}/10
                </Text>
              </View>

              <Slider
                value={moodBefore}
                onValueChange={setMoodBefore}
                min={1}
                max={10}
                step={1}
              />

              <View className="flex-row justify-between mt-4">
                <Text className="text-sm text-surface-400">Struggling</Text>
                <Text className="text-sm text-surface-400">Great</Text>
              </View>
            </View>
          )}

          {/* Step 3: Mood After & Takeaways */}
          {step === 3 && (
            <View>
              <Text className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">
                After the Meeting
              </Text>
              <Text className="text-surface-500 mb-6">
                How do you feel now?
              </Text>

              <View className="items-center mb-6">
                <Text className="text-6xl mb-2">{getMoodEmoji(moodAfter)}</Text>
                <Text className="text-3xl font-bold text-surface-900 dark:text-surface-100">
                  {moodAfter}/10
                </Text>
              </View>

              <Slider
                value={moodAfter}
                onValueChange={setMoodAfter}
                min={1}
                max={10}
                step={1}
              />

              {/* Mood change indicator */}
              {moodAfter !== moodBefore && (
                <Card
                  variant="default"
                  className={`mt-4 ${
                    moodAfter > moodBefore
                      ? 'bg-green-50 dark:bg-green-900/30'
                      : 'bg-amber-50 dark:bg-amber-900/30'
                  }`}
                >
                  <View className="flex-row items-center justify-center gap-2">
                    <Text>
                      {moodAfter > moodBefore ? '📈' : '📉'}
                    </Text>
                    <Text
                      className={
                        moodAfter > moodBefore
                          ? 'text-green-700 dark:text-green-300'
                          : 'text-amber-700 dark:text-amber-300'
                      }
                    >
                      Mood {moodAfter > moodBefore ? 'improved' : 'changed'} by{' '}
                      {Math.abs(moodAfter - moodBefore)} points
                    </Text>
                  </View>
                </Card>
              )}

              {/* Key Takeaways */}
              <Text className="text-base font-medium text-surface-700 dark:text-surface-300 mt-6 mb-2">
                Key Takeaways
              </Text>
              <TextInput
                value={keyTakeaways}
                onChangeText={setKeyTakeaways}
                placeholder="What resonated with you today?"
                placeholderTextColor="#9ca3af"
                multiline
                numberOfLines={4}
                className="bg-surface-100 dark:bg-surface-800 rounded-xl px-4 py-3 text-surface-900 dark:text-surface-100 min-h-[100px]"
                textAlignVertical="top"
              />
            </View>
          )}

          {/* Step 4: Topics */}
          {step === 4 && (
            <View>
              <Text className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-2">
                Topics Discussed
              </Text>
              <Text className="text-surface-500 mb-6">
                What was the meeting about? (Select all that apply)
              </Text>

              <View className="flex-row flex-wrap gap-2 mb-6">
                {MEETING_TOPICS.map((topic) => (
                  <TouchableOpacity
                    key={topic.name}
                    onPress={() => toggleTopic(topic.name)}
                    className={`px-4 py-2 rounded-full border ${
                      selectedTopics.includes(topic.name)
                        ? 'bg-primary-500 border-primary-500'
                        : 'border-surface-300 dark:border-surface-600'
                    }`}
                  >
                    <Text
                      className={`${
                        selectedTopics.includes(topic.name)
                          ? 'text-white'
                          : 'text-surface-700 dark:text-surface-300'
                      }`}
                    >
                      {topic.emoji} {topic.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Summary */}
              <Card variant="outlined" className="mb-4">
                <Text className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
                  Meeting Summary
                </Text>
                <View className="flex-row justify-between mb-2">
                  <Text className="text-surface-500">Type</Text>
                  <Text className="text-surface-900 dark:text-surface-100">
                    {meetingType === 'in-person' ? '📍 In Person' : '💻 Online'}
                  </Text>
                </View>
                {meetingName && (
                  <View className="flex-row justify-between mb-2">
                    <Text className="text-surface-500">Name</Text>
                    <Text className="text-surface-900 dark:text-surface-100">
                      {meetingName}
                    </Text>
                  </View>
                )}
                <View className="flex-row justify-between mb-2">
                  <Text className="text-surface-500">Mood Change</Text>
                  <Text
                    className={
                      moodAfter > moodBefore
                        ? 'text-green-600 font-medium'
                        : moodAfter < moodBefore
                        ? 'text-red-600 font-medium'
                        : 'text-surface-900 dark:text-surface-100'
                    }
                  >
                    {moodBefore} → {moodAfter}{' '}
                    {moodAfter > moodBefore && '📈'}
                    {moodAfter < moodBefore && '📉'}
                  </Text>
                </View>
                <View className="flex-row justify-between">
                  <Text className="text-surface-500">Topics</Text>
                  <Text className="text-surface-900 dark:text-surface-100">
                    {selectedTopics.length || 'None'}
                  </Text>
                </View>
              </Card>
            </View>
          )}
        </ScrollView>

        {/* Actions */}
        <View className="px-4 py-4 border-t border-surface-200 dark:border-surface-700">
          {step < totalSteps ? (
            <Button title="Continue" onPress={handleNext} size="lg" />
          ) : (
            <Button
              title={isSubmitting ? 'Saving...' : 'Log Meeting'}
              onPress={handleSubmit}
              disabled={isSubmitting}
              size="lg"
            />
          )}
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}


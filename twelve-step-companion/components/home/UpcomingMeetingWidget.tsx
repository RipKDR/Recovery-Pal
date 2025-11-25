/**
 * UpcomingMeetingWidget Component
 * Shows the next scheduled meeting on the home page
 */

import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Card } from '../ui';
import { useRegularMeetings } from '../../lib/hooks/useRegularMeetings';

interface UpcomingMeetingWidgetProps {
  className?: string;
}

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const SHORT_DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function formatTime(time: string): string {
  const [hours, minutes] = time.split(':').map(Number);
  const period = hours >= 12 ? 'PM' : 'AM';
  const hour12 = hours % 12 || 12;
  return `${hour12}:${String(minutes).padStart(2, '0')} ${period}`;
}

export function UpcomingMeetingWidget({ className = '' }: UpcomingMeetingWidgetProps) {
  const router = useRouter();
  const {
    nextMeeting,
    todayMeetings,
    meetings,
    isLoading,
    loadMeetings,
    getDaysUntil,
  } = useRegularMeetings();

  useEffect(() => {
    if (meetings.length === 0 && !isLoading) {
      loadMeetings();
    }
  }, []);

  // Don't render if no meetings
  if (meetings.length === 0) {
    return null;
  }

  const handleViewAll = () => {
    router.push('/my-meetings');
  };

  const handlePrepareShare = () => {
    router.push('/share-prep');
  };

  // Show today's meetings if any
  if (todayMeetings.length > 0) {
    const nextTodayMeeting = todayMeetings[0];
    
    return (
      <Card
        variant="default"
        className={`bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 ${className}`}
      >
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Text className="text-lg mr-2">📅</Text>
            <Text className="text-base font-semibold text-green-800 dark:text-green-200">
              Meeting Today!
            </Text>
          </View>
          <TouchableOpacity onPress={handleViewAll}>
            <Text className="text-sm text-green-600 dark:text-green-400">
              All Meetings →
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white dark:bg-surface-800 rounded-lg p-3 mb-3">
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="font-semibold text-surface-900 dark:text-surface-100">
                  {nextTodayMeeting.name}
                </Text>
                {nextTodayMeeting.isHomeGroup && (
                  <Text className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
                    🏠 Home
                  </Text>
                )}
              </View>
              <Text className="text-sm text-surface-500 mt-0.5">
                {formatTime(nextTodayMeeting.time)}
                {nextTodayMeeting.location ? ` • ${nextTodayMeeting.location}` : ''}
              </Text>
            </View>
            <View className="bg-green-100 dark:bg-green-900/30 px-3 py-1.5 rounded-full">
              <Text className="text-sm font-medium text-green-700 dark:text-green-300">
                Today
              </Text>
            </View>
          </View>
        </View>

        {/* More meetings today */}
        {todayMeetings.length > 1 && (
          <Text className="text-sm text-green-600 dark:text-green-400 mb-3">
            + {todayMeetings.length - 1} more meeting{todayMeetings.length > 2 ? 's' : ''} today
          </Text>
        )}

        {/* Quick Actions */}
        <View className="flex-row gap-2">
          <TouchableOpacity
            onPress={handlePrepareShare}
            className="flex-1 bg-green-600 dark:bg-green-700 py-2.5 rounded-lg"
          >
            <Text className="text-white font-medium text-center text-sm">
              ✍️ Prepare to Share
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/meetings/new')}
            className="flex-1 bg-white dark:bg-surface-700 border border-green-300 dark:border-green-700 py-2.5 rounded-lg"
          >
            <Text className="text-green-700 dark:text-green-300 font-medium text-center text-sm">
              Log Attendance
            </Text>
          </TouchableOpacity>
        </View>
      </Card>
    );
  }

  // Show next upcoming meeting
  if (nextMeeting) {
    const daysUntil = getDaysUntil(nextMeeting);
    
    return (
      <Card variant="default" className={className}>
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center">
            <Text className="text-lg mr-2">📅</Text>
            <Text className="text-base font-semibold text-surface-900 dark:text-surface-100">
              Next Meeting
            </Text>
          </View>
          <TouchableOpacity onPress={handleViewAll}>
            <Text className="text-sm text-primary-600 dark:text-primary-400">
              All Meetings →
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          onPress={() => router.push(`/my-meetings/${nextMeeting.id}`)}
          className="bg-surface-50 dark:bg-surface-800 rounded-lg p-3"
          activeOpacity={0.7}
        >
          <View className="flex-row items-center justify-between">
            <View className="flex-1">
              <View className="flex-row items-center gap-2">
                <Text className="font-semibold text-surface-900 dark:text-surface-100">
                  {nextMeeting.name}
                </Text>
                {nextMeeting.isHomeGroup && (
                  <Text className="text-xs bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 px-1.5 py-0.5 rounded">
                    🏠
                  </Text>
                )}
              </View>
              <Text className="text-sm text-surface-500 mt-0.5">
                {DAY_NAMES[nextMeeting.dayOfWeek]} at {formatTime(nextMeeting.time)}
              </Text>
            </View>
            <View className="bg-primary-100 dark:bg-primary-900/30 px-3 py-1.5 rounded-full">
              <Text className="text-sm font-medium text-primary-700 dark:text-primary-300">
                {daysUntil === 1 ? 'Tomorrow' : `In ${daysUntil} days`}
              </Text>
            </View>
          </View>
        </TouchableOpacity>
      </Card>
    );
  }

  return null;
}


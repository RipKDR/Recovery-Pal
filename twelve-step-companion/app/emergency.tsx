/**
 * Emergency Resources Screen
 * Crisis hotlines and immediate help resources
 */

import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Button } from '../components/ui';

interface HotlineResource {
  id: string;
  name: string;
  phone: string;
  description: string;
  available: string;
  color: string;
}

const HOTLINES: HotlineResource[] = [
  {
    id: 'emergency',
    name: 'Emergency Services',
    phone: '000',
    description: 'Life-threatening emergency - Police, Fire, Ambulance',
    available: '24/7',
    color: '#ef4444',
  },
  {
    id: 'lifeline',
    name: 'Lifeline Australia',
    phone: '13 11 14',
    description: 'Free, confidential 24/7 crisis support and suicide prevention',
    available: '24/7',
    color: '#3b82f6',
  },
  {
    id: 'suicide-callback',
    name: 'Suicide Call Back Service',
    phone: '1300 659 467',
    description: 'Free professional 24/7 telephone and online counselling',
    available: '24/7',
    color: '#dc2626',
  },
  {
    id: 'beyond-blue',
    name: 'Beyond Blue',
    phone: '1300 22 4636',
    description: 'Mental health support and information',
    available: '24/7',
    color: '#22c55e',
  },
  {
    id: 'directline',
    name: 'DirectLine',
    phone: '1800 888 236',
    description: 'Alcohol and drug counselling and support (Victoria)',
    available: '24/7',
    color: '#6366f1',
  },
  {
    id: 'aa',
    name: 'Alcoholics Anonymous',
    phone: '1300 222 222',
    description: 'AA Australia - Find meetings and support',
    available: '24/7',
    color: '#8b5cf6',
  },
  {
    id: 'na',
    name: 'Narcotics Anonymous',
    phone: '1800 652 820',
    description: 'NA Australia - Find meetings and support',
    available: '24/7',
    color: '#a855f7',
  },
];

const COPING_STRATEGIES = [
  {
    title: 'Call Your Sponsor',
    description: 'Reach out to your sponsor or a trusted person in recovery',
    icon: '📞',
  },
  {
    title: 'Attend a Meeting',
    description: 'Find an in-person or online meeting right now',
    icon: '👥',
  },
  {
    title: 'HALT Check',
    description: 'Are you Hungry, Angry, Lonely, or Tired?',
    icon: '🛑',
  },
  {
    title: 'Play the Tape Forward',
    description: 'Think through where using would lead',
    icon: '⏩',
  },
  {
    title: 'Change Your Environment',
    description: 'Leave the situation. Go somewhere safe.',
    icon: '🚶',
  },
  {
    title: 'Breathe',
    description: 'Try the breathing exercises in this app',
    icon: '🧘',
  },
];

function HotlineCard({
  hotline,
  onCall,
}: {
  hotline: HotlineResource;
  onCall: () => void;
}) {
  return (
    <TouchableOpacity onPress={onCall} activeOpacity={0.8}>
      <Card variant="elevated" className="mb-3">
        <View className="flex-row items-center">
          <View
            style={{ backgroundColor: hotline.color }}
            className="w-12 h-12 rounded-full items-center justify-center mr-4"
          >
            <Text className="text-white text-xl">📞</Text>
          </View>
          <View className="flex-1">
            <Text className="text-lg font-semibold text-surface-900 dark:text-surface-100">
              {hotline.name}
            </Text>
            <Text className="text-primary-600 font-bold">{hotline.phone}</Text>
            <Text className="text-sm text-surface-500" numberOfLines={1}>
              {hotline.description}
            </Text>
          </View>
          <View className="bg-green-100 dark:bg-green-900/30 px-2 py-1 rounded">
            <Text className="text-green-700 dark:text-green-300 text-xs">
              {hotline.available}
            </Text>
          </View>
        </View>
      </Card>
    </TouchableOpacity>
  );
}

export default function EmergencyScreen() {
  const router = useRouter();

  const handleCall = (hotline: HotlineResource) => {
    const phoneNumber = hotline.phone.replace(/\D/g, '');
    
    // Special handling for emergency 000
    if (hotline.id === 'emergency') {
      Alert.alert(
        'Call Emergency Services (000)?',
        'This will connect you to Police, Fire, or Ambulance for life-threatening emergencies only.',
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Call 000',
            style: 'destructive',
            onPress: () => Linking.openURL('tel:000'),
          },
        ]
      );
      return;
    }
    
    Alert.alert(
      `Call ${hotline.name}?`,
      `You will be connected to ${hotline.phone}`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Call Now',
          onPress: () => Linking.openURL(`tel:${phoneNumber}`),
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
      <ScrollView className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="flex-row items-center mb-6">
          <TouchableOpacity onPress={() => router.back()} className="mr-4">
            <Text className="text-primary-600 text-base">← Back</Text>
          </TouchableOpacity>
        </View>

        {/* Emergency Banner */}
        <Card
          variant="elevated"
          className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800"
        >
          <View className="items-center py-2">
            <Text className="text-4xl mb-2">🆘</Text>
            <Text className="text-xl font-bold text-red-700 dark:text-red-300 text-center">
              You Are Not Alone
            </Text>
            <Text className="text-red-600 dark:text-red-400 text-center mt-1">
              Help is available right now. Reaching out is a sign of strength.
            </Text>
          </View>
        </Card>

        {/* Crisis Hotlines */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
            Crisis Hotlines
          </Text>
          {HOTLINES.map((hotline) => (
            <HotlineCard
              key={hotline.id}
              hotline={hotline}
              onCall={() => handleCall(hotline)}
            />
          ))}
        </View>

        {/* Coping Strategies */}
        <View className="mb-6">
          <Text className="text-lg font-semibold text-surface-900 dark:text-surface-100 mb-3">
            Coping Strategies
          </Text>
          <Card variant="default">
            {COPING_STRATEGIES.map((strategy, index) => (
              <View
                key={strategy.title}
                className={`flex-row items-center py-3 ${
                  index < COPING_STRATEGIES.length - 1
                    ? 'border-b border-surface-100 dark:border-surface-800'
                    : ''
                }`}
              >
                <Text className="text-2xl mr-3">{strategy.icon}</Text>
                <View className="flex-1">
                  <Text className="font-medium text-surface-900 dark:text-surface-100">
                    {strategy.title}
                  </Text>
                  <Text className="text-sm text-surface-500">
                    {strategy.description}
                  </Text>
                </View>
              </View>
            ))}
          </Card>
        </View>

        {/* Quick Actions */}
        <View className="flex-row gap-3 mb-6">
          <TouchableOpacity
            onPress={() => router.push('/breathing')}
            className="flex-1 bg-secondary-100 dark:bg-secondary-900/30 rounded-2xl p-4 items-center"
          >
            <Text className="text-3xl mb-2">🧘</Text>
            <Text className="text-secondary-700 dark:text-secondary-300 font-medium">
              Breathing Exercise
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => router.push('/journal/new')}
            className="flex-1 bg-primary-100 dark:bg-primary-900/30 rounded-2xl p-4 items-center"
          >
            <Text className="text-3xl mb-2">📝</Text>
            <Text className="text-primary-700 dark:text-primary-300 font-medium">
              Write It Out
            </Text>
          </TouchableOpacity>
        </View>

        {/* Affirmation */}
        <Card variant="outlined" className="mb-8">
          <Text className="text-surface-700 dark:text-surface-300 text-center text-lg italic">
            "This craving will pass. It always does. You don't have to act on it."
          </Text>
        </Card>

        {/* Serenity Prayer */}
        <Card variant="default" className="bg-primary-50 dark:bg-primary-900/20 mb-6">
          <Text className="text-center text-primary-800 dark:text-primary-200 leading-relaxed">
            God, grant me the serenity to accept the things I cannot change,{'\n'}
            courage to change the things I can,{'\n'}
            and wisdom to know the difference.
          </Text>
        </Card>

        <View className="h-8" />
      </ScrollView>
    </SafeAreaView>
  );
}


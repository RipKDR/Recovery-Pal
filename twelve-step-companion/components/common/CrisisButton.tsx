/**
 * Crisis Quick Access Button (FAB)
 * Provides instant access to emergency resources from any screen
 * Target: < 5 seconds to reach help
 */

import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  Linking, 
  Modal,
  Pressable,
  useColorScheme 
} from 'react-native';
import { useRouter, useSegments } from 'expo-router';

// Emergency resources for quick modal (Australia/Melbourne)
const quickResources = [
  {
    id: 'lifeline',
    title: 'Lifeline',
    subtitle: '13 11 14 - 24/7 Crisis Support',
    action: () => Linking.openURL('tel:131114'),
    emoji: '📞',
    color: 'bg-red-600',
  },
  {
    id: 'suicide-callback',
    title: 'Suicide Call Back Service',
    subtitle: '1300 659 467 - 24/7 Support',
    action: () => Linking.openURL('tel:1300659467'),
    emoji: '💬',
    color: 'bg-orange-600',
  },
  {
    id: 'emergency',
    title: 'Emergency Services',
    subtitle: '000 - Life-threatening emergency',
    action: () => Linking.openURL('tel:000'),
    emoji: '🆘',
    color: 'bg-blue-600',
  },
];

export function CrisisButton() {
  const [showQuickHelp, setShowQuickHelp] = useState(false);
  const router = useRouter();
  const segments = useSegments();
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  // Hide on certain screens
  const currentPath = segments.join('/');
  const hiddenPaths = [
    'onboarding',
    'emergency',
    '(auth)',
    'lock',
  ];
  
  const shouldHide = hiddenPaths.some(path => currentPath.includes(path));
  
  if (shouldHide) return null;

  const handlePress = () => {
    setShowQuickHelp(true);
  };

  const handleGoToResources = () => {
    setShowQuickHelp(false);
    router.push('/emergency');
  };

  return (
    <>
      {/* Floating Action Button */}
      <TouchableOpacity
        onPress={handlePress}
        activeOpacity={0.8}
        className="absolute bottom-24 right-4 z-50"
        accessibilityRole="button"
        accessibilityLabel="Need help? Tap for crisis resources"
        accessibilityHint="Opens quick access to emergency hotlines and resources"
        style={{
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.3,
          shadowRadius: 8,
          elevation: 8,
        }}
      >
        <View className="bg-red-600 rounded-full w-14 h-14 items-center justify-center border-2 border-red-400">
          <Text className="text-2xl" accessibilityElementsHidden>🆘</Text>
        </View>
        {/* Pulse animation indicator */}
        <View 
          className="absolute -top-1 -right-1 bg-white rounded-full w-4 h-4 items-center justify-center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 1 },
            shadowOpacity: 0.2,
            shadowRadius: 2,
            elevation: 2,
          }}
        >
          <View className="bg-red-500 rounded-full w-2 h-2" />
        </View>
      </TouchableOpacity>

      {/* Quick Help Modal */}
      <Modal
        visible={showQuickHelp}
        transparent
        animationType="fade"
        onRequestClose={() => setShowQuickHelp(false)}
      >
        <Pressable
          className="flex-1 bg-black/60 justify-end"
          onPress={() => setShowQuickHelp(false)}
        >
          <Pressable 
            onPress={(e) => e.stopPropagation()}
            className={`${isDark ? 'bg-surface-800' : 'bg-white'} rounded-t-3xl p-6 pb-8`}
          >
            {/* Header */}
            <View className="items-center mb-6">
              <View className="w-12 h-1 bg-surface-300 dark:bg-surface-600 rounded-full mb-4" />
              <Text className="text-xl font-bold text-surface-900 dark:text-surface-100">
                Need Help Right Now?
              </Text>
              <Text className="text-surface-500 text-center mt-1">
                You're not alone. Reach out immediately.
              </Text>
            </View>

            {/* Quick Actions */}
            <View className="gap-3">
              {quickResources.map((resource) => (
                <TouchableOpacity
                  key={resource.id}
                  onPress={() => {
                    setShowQuickHelp(false);
                    resource.action();
                  }}
                  className={`${resource.color} rounded-xl p-4 flex-row items-center gap-4`}
                  accessibilityRole="button"
                  accessibilityLabel={`${resource.title}: ${resource.subtitle}`}
                >
                  <Text className="text-2xl">{resource.emoji}</Text>
                  <View className="flex-1">
                    <Text className="text-white font-bold text-lg">
                      {resource.title}
                    </Text>
                    <Text className="text-white/80">
                      {resource.subtitle}
                    </Text>
                  </View>
                  <Text className="text-white text-xl">→</Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* More Resources Link */}
            <TouchableOpacity
              onPress={handleGoToResources}
              className="mt-4 py-3 items-center"
              accessibilityRole="button"
              accessibilityLabel="View all emergency resources"
            >
              <Text className="text-primary-600 dark:text-primary-400 font-medium">
                View All Resources →
              </Text>
            </TouchableOpacity>

            {/* Close Button */}
            <TouchableOpacity
              onPress={() => setShowQuickHelp(false)}
              className="mt-2 py-3 items-center"
              accessibilityRole="button"
              accessibilityLabel="Close this menu"
            >
              <Text className="text-surface-500">
                Close
              </Text>
            </TouchableOpacity>

            {/* Safe messaging */}
            <View className="mt-4 p-3 bg-surface-100 dark:bg-surface-700 rounded-lg">
              <Text className="text-xs text-surface-500 dark:text-surface-400 text-center">
                💚 It takes courage to reach out. Whatever you're going through, help is available 24/7.
              </Text>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

export default CrisisButton;


/**
 * Journal Hub Screen
 * List and manage journal entries with search
 * Phase 4: Optimized with React.memo and useCallback
 */

import React, { useMemo, useState, useCallback, memo } from 'react';
import { View, Text, ScrollView, TouchableOpacity, FlatList, TextInput } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Card, Button } from '../../components/ui';
import { useJournal } from '../../lib/hooks/useJournal';
import type { JournalEntry, JournalType } from '../../lib/types';

// Memoized journal entry card for optimal FlatList performance
const JournalEntryCard = memo(function JournalEntryCard({
  entry,
  onPress,
  getTypeLabel,
}: {
  entry: JournalEntry;
  onPress: () => void;
  getTypeLabel: (type: JournalType) => string;
}) {
  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getMoodEmoji = (mood?: number) => {
    if (!mood) return null;
    if (mood <= 3) return '😔';
    if (mood <= 5) return '😐';
    if (mood <= 7) return '🙂';
    return '😊';
  };

  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.7}>
      <Card variant="default" className="mb-3">
        <View className="flex-row justify-between items-start mb-2">
          <View className="flex-row items-center gap-2">
            <View className="bg-primary-100 dark:bg-primary-900/30 rounded-lg px-2 py-1">
              <Text className="text-xs font-medium text-primary-700 dark:text-primary-300">
                {getTypeLabel(entry.type)}
              </Text>
            </View>
            {entry.stepNumber && (
              <View className="bg-secondary-100 dark:bg-secondary-900/30 rounded-lg px-2 py-1">
                <Text className="text-xs font-medium text-secondary-700 dark:text-secondary-300">
                  Step {entry.stepNumber}
                </Text>
              </View>
            )}
          </View>
          <Text className="text-xs text-surface-400">
            {formatDate(entry.createdAt)}
          </Text>
        </View>

        {/* Mood indicators */}
        {(entry.moodBefore || entry.moodAfter || entry.cravingLevel) && (
          <View className="flex-row gap-3 mb-2">
            {entry.moodBefore !== undefined && (
              <View className="flex-row items-center gap-1">
                <Text className="text-sm">{getMoodEmoji(entry.moodBefore)}</Text>
                <Text className="text-xs text-surface-500">
                  Mood: {entry.moodBefore}/10
                </Text>
              </View>
            )}
            {entry.cravingLevel !== undefined && (
              <View className="flex-row items-center gap-1">
                <Text className="text-xs text-surface-500">
                  Craving: {entry.cravingLevel}/10
                </Text>
              </View>
            )}
          </View>
        )}

        {/* Emotion tags */}
        {entry.emotionTags.length > 0 && (
          <View className="flex-row flex-wrap gap-1">
            {entry.emotionTags.slice(0, 3).map((tag, index) => (
              <View
                key={index}
                className="bg-surface-100 dark:bg-surface-700 rounded-full px-2 py-0.5"
              >
                <Text className="text-xs text-surface-600 dark:text-surface-300">
                  {tag}
                </Text>
              </View>
            ))}
            {entry.emotionTags.length > 3 && (
              <Text className="text-xs text-surface-400 self-center">
                +{entry.emotionTags.length - 3} more
              </Text>
            )}
          </View>
        )}

        {/* Preview text indicator */}
        <View className="flex-row items-center mt-2">
          <Text className="text-sm text-surface-400 italic">
            🔒 Encrypted content
          </Text>
        </View>
      </Card>
    </TouchableOpacity>
  );
});

// Search bar component (memoized)
const SearchBar = memo(function SearchBar({
  value,
  onChangeText,
  onClear,
}: {
  value: string;
  onChangeText: (text: string) => void;
  onClear: () => void;
}) {
  return (
    <View className="mb-4">
      <View className="flex-row items-center bg-surface-100 dark:bg-surface-800 rounded-xl px-4 py-2">
        <Text className="text-surface-400 mr-2">🔍</Text>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          placeholder="Search by emotion or keyword..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-surface-900 dark:text-surface-100 text-base"
          accessibilityLabel="Search journal entries"
          accessibilityHint="Type to search by emotion tags or entry type"
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
        />
        {value.length > 0 && (
          <TouchableOpacity 
            onPress={onClear}
            accessibilityLabel="Clear search"
            className="p-1"
          >
            <Text className="text-surface-400 text-lg">✕</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
});

// Filter tabs (memoized)
const FilterTabs = memo(function FilterTabs({
  selected,
  onSelect,
}: {
  selected: JournalType | null;
  onSelect: (type: JournalType | null) => void;
}) {
  const tabs: { label: string; value: JournalType | null }[] = [
    { label: 'All', value: null },
    { label: 'Freeform', value: 'freeform' },
    { label: 'Voice', value: 'voice' },
    { label: 'Step Work', value: 'step-work' },
    { label: 'Reflections', value: 'meeting-reflection' },
  ];

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mb-4"
    >
      <View className="flex-row gap-2 px-1">
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.label}
            onPress={() => onSelect(tab.value)}
            className={`px-4 py-2 rounded-full ${
              selected === tab.value
                ? 'bg-primary-600'
                : 'bg-surface-100 dark:bg-surface-700'
            }`}
            accessibilityRole="button"
            accessibilityState={{ selected: selected === tab.value }}
            accessibilityLabel={`Filter by ${tab.label}`}
          >
            <Text
              className={`text-sm font-medium ${
                selected === tab.value
                  ? 'text-white'
                  : 'text-surface-600 dark:text-surface-300'
              }`}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
});

export default function JournalScreen() {
  const router = useRouter();
  const {
    entries,
    isLoading,
    filterType,
    setFilterType,
    getTypeLabel,
  } = useJournal();

  // Search state with debouncing
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');

  // Debounce search input (300ms)
  React.useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(searchQuery);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery]);

  // Filter entries by search query (emotion tags, type, step number)
  const filteredEntries = useMemo(() => {
    if (!debouncedQuery.trim()) return entries;
    
    const query = debouncedQuery.toLowerCase().trim();
    return entries.filter((entry) => {
      // Search emotion tags
      const matchesEmotions = entry.emotionTags.some(tag => 
        tag.toLowerCase().includes(query)
      );
      
      // Search type
      const matchesType = getTypeLabel(entry.type).toLowerCase().includes(query);
      
      // Search step number
      const matchesStep = entry.stepNumber?.toString() === query || 
        (entry.stepNumber && `step ${entry.stepNumber}`.includes(query));
      
      return matchesEmotions || matchesType || matchesStep;
    });
  }, [entries, debouncedQuery, getTypeLabel]);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setDebouncedQuery('');
  }, []);

  // Memoized FlatList callbacks for performance
  const keyExtractor = useCallback((item: JournalEntry) => item.id, []);
  
  const renderItem = useCallback(({ item }: { item: JournalEntry }) => (
    <JournalEntryCard
      entry={item}
      onPress={() => router.push(`/journal/${item.id}`)}
      getTypeLabel={getTypeLabel}
    />
  ), [router, getTypeLabel]);

  // Empty state (no entries at all)
  if (!isLoading && entries.length === 0) {
    return (
      <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
        <View className="flex-1 px-4 py-6">
          <Text className="text-2xl font-bold text-surface-900 dark:text-surface-100 mb-6">
            Journal
          </Text>
          <FilterTabs selected={filterType} onSelect={setFilterType} />
          
          <View className="flex-1 items-center justify-center">
            <Text className="text-4xl mb-4">📝</Text>
            <Text className="text-xl font-semibold text-surface-900 dark:text-surface-100 text-center">
              Start Your Journal
            </Text>
            <Text className="text-surface-500 text-center mt-2 mb-6 px-8">
              Writing about your recovery journey can be a powerful tool for healing and growth.
            </Text>
            <Button
              title="Write First Entry"
              onPress={() => router.push('/journal/new')}
            />
          </View>
        </View>
      </SafeAreaView>
    );
  }

  // No search results state
  const showNoResults = !isLoading && filteredEntries.length === 0 && debouncedQuery.trim();

  return (
    <SafeAreaView className="flex-1 bg-surface-50 dark:bg-surface-900">
      <View className="flex-1 px-4 py-6">
        {/* Header */}
        <View className="flex-row justify-between items-center mb-4">
          <Text 
            className="text-2xl font-bold text-surface-900 dark:text-surface-100"
            accessibilityRole="header"
          >
            Journal
          </Text>
          <View className="flex-row gap-2">
            <TouchableOpacity
              onPress={() => router.push('/journal/voice')}
              className="bg-red-500 rounded-full w-10 h-10 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Record voice journal"
            >
              <Text className="text-white text-lg">🎙️</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => router.push('/journal/new')}
              className="bg-primary-600 rounded-full w-10 h-10 items-center justify-center"
              accessibilityRole="button"
              accessibilityLabel="Create new journal entry"
            >
              <Text className="text-white text-2xl">+</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Search bar */}
        <SearchBar 
          value={searchQuery}
          onChangeText={setSearchQuery}
          onClear={handleClearSearch}
        />

        {/* Filter tabs */}
        <FilterTabs selected={filterType} onSelect={setFilterType} />

        {/* No search results */}
        {showNoResults ? (
          <View className="flex-1 items-center justify-center">
            <Text className="text-4xl mb-4">🔍</Text>
            <Text className="text-lg font-medium text-surface-700 dark:text-surface-300 text-center">
              No entries found
            </Text>
            <Text className="text-surface-500 text-center mt-2 px-8">
              Try searching for an emotion like "anxious" or "grateful"
            </Text>
            <TouchableOpacity 
              onPress={handleClearSearch}
              className="mt-4 px-4 py-2 bg-primary-100 dark:bg-primary-900/30 rounded-lg"
            >
              <Text className="text-primary-700 dark:text-primary-300 font-medium">
                Clear Search
              </Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Entry list with optimized rendering */
          <FlatList
            data={filteredEntries}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListHeaderComponent={
              debouncedQuery.trim() ? (
                <Text className="text-sm text-surface-500 mb-3">
                  {filteredEntries.length} {filteredEntries.length === 1 ? 'result' : 'results'} for "{debouncedQuery}"
                </Text>
              ) : null
            }
            // Performance optimizations
            removeClippedSubviews={true}
            maxToRenderPerBatch={10}
            windowSize={5}
            initialNumToRender={10}
          />
        )}
      </View>
    </SafeAreaView>
  );
}


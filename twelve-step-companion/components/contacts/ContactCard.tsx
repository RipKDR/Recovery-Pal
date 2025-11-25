/**
 * ContactCard Component
 * Displays a recovery contact with quick actions
 */

import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import { Card } from '../ui';
import { QuickCall } from './QuickCall';
import type { RecoveryContact, ContactRole } from '../../lib/types';

interface ContactCardProps {
  contact: RecoveryContact;
  onCall: () => void;
  onText: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  showActions?: boolean;
}

const ROLE_ICONS: Record<ContactRole, string> = {
  sponsor: '⭐',
  emergency: '🆘',
  sponsee: '🌱',
  home_group: '🏠',
  fellowship: '🤝',
};

export function ContactCard({
  contact,
  onCall,
  onText,
  onEdit,
  onDelete,
  showActions = true,
}: ContactCardProps) {
  const [showMenu, setShowMenu] = useState(false);

  const getDaysSinceContact = (): string => {
    if (!contact.lastContactedAt) {
      return 'Not contacted yet';
    }

    const now = new Date();
    const lastContact = new Date(contact.lastContactedAt);
    const diffTime = now.getTime() - lastContact.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 0) return 'Contacted today';
    if (diffDays === 1) return 'Contacted yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 14) return '1 week ago';
    return `${Math.floor(diffDays / 7)} weeks ago`;
  };

  const handleLongPress = () => {
    if (onEdit || onDelete) {
      Alert.alert(
        contact.name,
        'What would you like to do?',
        [
          onEdit ? { text: 'Edit', onPress: onEdit } : null,
          onDelete
            ? { text: 'Delete', onPress: onDelete, style: 'destructive' }
            : null,
          { text: 'Cancel', style: 'cancel' },
        ].filter(Boolean) as any[]
      );
    }
  };

  const lastContactColor = () => {
    if (!contact.lastContactedAt) return 'text-surface-400';
    
    const now = new Date();
    const lastContact = new Date(contact.lastContactedAt);
    const diffDays = Math.floor(
      (now.getTime() - lastContact.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (diffDays <= 7) return 'text-green-600 dark:text-green-400';
    if (diffDays <= 14) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  return (
    <TouchableOpacity
      onLongPress={handleLongPress}
      activeOpacity={0.9}
      delayLongPress={500}
    >
      <Card variant="default">
        <View className="flex-row items-center">
          {/* Avatar/Icon */}
          <View className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 items-center justify-center mr-3">
            <Text className="text-xl">{ROLE_ICONS[contact.role]}</Text>
          </View>

          {/* Contact Info */}
          <View className="flex-1 mr-3">
            <Text className="text-base font-semibold text-surface-900 dark:text-surface-100">
              {contact.name}
            </Text>
            <Text className="text-sm text-surface-500">{contact.phone}</Text>
            <Text className={`text-xs mt-0.5 ${lastContactColor()}`}>
              {getDaysSinceContact()}
            </Text>
          </View>

          {/* Quick Actions */}
          {showActions && (
            <View className="flex-row gap-2">
              <QuickCall
                icon="💬"
                onPress={onText}
                accessibilityLabel={`Text ${contact.name}`}
                variant="secondary"
              />
              <QuickCall
                icon="📞"
                onPress={onCall}
                accessibilityLabel={`Call ${contact.name}`}
              />
            </View>
          )}
        </View>
      </Card>
    </TouchableOpacity>
  );
}


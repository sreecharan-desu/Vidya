/**
 * PermissionDeniedView — inline empty-state shown when a permission is
 * denied or blocked and the feature cannot render its normal content.
 *
 * This is NOT a modal; it replaces the feature's content area so the user
 * knows exactly why nothing is showing and has a clear path to fix it.
 */

import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { PERMISSION_MESSAGES } from '../../services/permissions';
import type { PermissionKey, PermissionStatus } from '../../services/permissions';

interface PermissionDeniedViewProps {
  permissionKey: PermissionKey;
  status: PermissionStatus;
  /** Called when the user taps "Try Again" (re-request). */
  onRetry?: () => void;
  /** Called when the user taps "Open Settings". */
  onOpenSettings?: () => void;
}

export const PermissionDeniedView: React.FC<PermissionDeniedViewProps> = ({
  permissionKey,
  status,
  onRetry,
  onOpenSettings,
}) => {
  const msg = PERMISSION_MESSAGES[permissionKey];
  const isBlocked = status === 'blocked';
  const isUnavailable = status === 'unavailable';

  return (
    <View
      className="flex-1 items-center justify-center px-8 py-12"
      accessibilityRole="alert"
    >
      {/* Icon */}
      <View
        className="w-20 h-20 rounded-3xl items-center justify-center mb-5"
        style={{ backgroundColor: Colors.palePeach }}
      >
        <MaterialIcons
          name={isUnavailable ? 'block' : msg.icon}
          size={40}
          color={Colors.primary}
        />
      </View>

      {/* Title */}
      <Text
        className="font-manrope-extrabold text-lg text-textPrimary text-center tracking-tight mb-2"
        accessibilityRole="header"
      >
        {isUnavailable
          ? `${msg.title} Unavailable`
          : `${msg.title} Not Allowed`}
      </Text>

      {/* Message */}
      <Text className="font-manrope-medium text-sm text-textSecondary text-center leading-5 mb-6 px-4">
        {isUnavailable
          ? `Your device does not support ${msg.title.toLowerCase()}. This feature is not available.`
          : msg.deniedMessage}
      </Text>

      {/* Actions */}
      {!isUnavailable && (
        <View className="w-full gap-3 max-w-[280px]">
          {isBlocked && onOpenSettings ? (
            <TouchableOpacity
              className="flex-row items-center justify-center py-3.5 rounded-2xl border border-primary/30"
              style={{ backgroundColor: Colors.palePeach }}
              onPress={onOpenSettings}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={msg.settingsHint}
            >
              <MaterialIcons name="settings" size={16} color={Colors.primary} />
              <Text className="font-manrope-bold text-sm text-primary ml-2">
                Open Settings
              </Text>
            </TouchableOpacity>
          ) : null}

          {!isBlocked && onRetry ? (
            <TouchableOpacity
              className="flex-row items-center justify-center py-3.5 rounded-2xl shadow-sm"
              style={{ backgroundColor: Colors.primary }}
              onPress={onRetry}
              activeOpacity={0.85}
              accessibilityRole="button"
              accessibilityLabel={`Allow ${msg.title}`}
            >
              <MaterialIcons name={msg.icon} size={16} color="#ffffff" />
              <Text className="font-manrope-bold text-sm text-white ml-2">
                Allow {msg.title}
              </Text>
            </TouchableOpacity>
          ) : null}
        </View>
      )}
    </View>
  );
};

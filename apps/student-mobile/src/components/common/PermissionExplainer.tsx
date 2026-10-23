/**
 * PermissionExplainer — a bottom-sheet modal that explains WHY a permission
 * is needed before the OS prompt is shown.
 *
 * Best practice: show this before calling `request()` so the user understands
 * the purpose.  After they tap "Allow", the OS prompt fires.
 *
 * Props:
 *  • `permissionKey`  – which permission to explain
 *  • `visible`        – controlled modal visibility
 *  • `onAllow`        – called when user taps "Allow …"
 *  • `onDismiss`      – called when user taps "Not Now"
 *  • `onOpenSettings` – (optional) called when the permission is blocked
 *  • `isBlocked`      – when true, shows a "Go to Settings" CTA instead
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import Colors from '../../constants/colors';
import { PERMISSION_MESSAGES } from '../../services/permissions';
import type { PermissionKey } from '../../services/permissions';

interface PermissionExplainerProps {
  permissionKey: PermissionKey;
  visible: boolean;
  onAllow: () => void;
  onDismiss: () => void;
  onOpenSettings?: () => void;
  isBlocked?: boolean;
  loading?: boolean;
}

export const PermissionExplainer: React.FC<PermissionExplainerProps> = ({
  permissionKey,
  visible,
  onAllow,
  onDismiss,
  onOpenSettings,
  isBlocked = false,
  loading = false,
}) => {
  const msg = PERMISSION_MESSAGES[permissionKey];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onDismiss}
    >
      <View
        className="flex-1 justify-end bg-black/50"
        accessibilityViewIsModal
      >
        <View className="bg-white rounded-t-[28px] px-6 pt-7 pb-8 border-t border-border shadow-2xl">
          {/* Icon + Title */}
          <View className="items-center mb-4">
            <View
              className="w-16 h-16 rounded-2xl items-center justify-center mb-3"
              style={{ backgroundColor: Colors.palePeach }}
            >
              <MaterialIcons
                name={msg.icon}
                size={32}
                color={Colors.primary}
              />
            </View>
            <Text
              className="font-manrope-extrabold text-xl text-textPrimary text-center tracking-tight"
              accessibilityRole="header"
            >
              {msg.title}
            </Text>
          </View>

          {/* Explanation */}
          <Text className="font-manrope-medium text-sm text-textSecondary text-center leading-5 mb-6 px-2">
            {isBlocked ? msg.deniedMessage : msg.reason}
          </Text>

          {/* Actions */}
          <View className="gap-3">
            {isBlocked ? (
              /* Blocked — "Open Settings" CTA */
              <TouchableOpacity
                className="flex-row items-center justify-center py-4 rounded-2xl border border-primary/30"
                style={{ backgroundColor: Colors.palePeach }}
                onPress={onOpenSettings || onDismiss}
                activeOpacity={0.85}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={msg.settingsHint}
              >
                {loading ? (
                  <ActivityIndicator size="small" color={Colors.primary} />
                ) : (
                  <>
                    <MaterialIcons
                      name="settings"
                      size={18}
                      color={Colors.primary}
                    />
                    <Text className="font-manrope-bold text-sm text-primary ml-2">
                      {msg.settingsHint}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              /* Not blocked — "Allow" CTA */
              <TouchableOpacity
                className="flex-row items-center justify-center py-4 rounded-2xl shadow-sm"
                style={{ backgroundColor: Colors.primary }}
                onPress={onAllow}
                activeOpacity={0.85}
                disabled={loading}
                accessibilityRole="button"
                accessibilityLabel={`Allow ${msg.title}`}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <>
                    <MaterialIcons
                      name={msg.icon}
                      size={18}
                      color="#ffffff"
                    />
                    <Text className="font-manrope-bold text-sm text-white ml-2">
                      Allow {msg.title}
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            )}

            {/* Dismiss / "Not Now" */}
            <TouchableOpacity
              className="py-3 rounded-2xl items-center justify-center bg-gray-100"
              onPress={onDismiss}
              activeOpacity={0.8}
              accessibilityRole="button"
              accessibilityLabel="Not Now"
            >
              <Text className="font-manrope-bold text-xs text-textSecondary">
                Not Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

/**
 * Human-readable permission messages for each protected feature.
 *
 * Each entry carries:
 *  • `title`         – short heading shown in the explainer modal
 *  • `reason`        – why the app needs this access
 *  • `deniedMessage` – message when the user previously denied access
 *  • `settingsHint`  – CTA text guiding the user to the Settings screen
 *  • `icon`          – MaterialIcons glyph name for the explainer card
 */

import { PermissionKey } from './permissionTypes';
import { MaterialIcons } from '@expo/vector-icons';

export interface PermissionMessageSet {
  title: string;
  reason: string;
  deniedMessage: string;
  blockedMessage: string;
  settingsHint: string;
  icon: keyof typeof MaterialIcons.glyphMap;
}

export const PERMISSION_MESSAGES: Record<PermissionKey, PermissionMessageSet> = {
  camera: {
    title: 'Camera Access',
    reason:
      'Vidya needs camera access so you can take a photo for your student profile picture.',
    deniedMessage:
      'Camera access is required to take a profile photo. Please grant permission.',
    blockedMessage:
      'Camera access is blocked in device settings. Please enable camera permission to take a profile photo.',
    settingsHint: 'Open Settings to allow camera access',
    icon: 'photo-camera',
  },
  photoLibrary: {
    title: 'Photo Library',
    reason:
      'Vidya needs photo library access so you can choose a profile picture from your device.',
    deniedMessage:
      'Photo library access is required to choose a profile picture. Please grant permission.',
    blockedMessage:
      'Photo library access is blocked in device settings. Please enable photo access to select a profile photo.',
    settingsHint: 'Open Settings to allow photo access',
    icon: 'photo-library',
  },
  notifications: {
    title: 'Notifications',
    reason:
      'Vidya would like to send you study reminders, exam schedule alerts, and achievement updates to help you stay on track.',
    deniedMessage:
      'Notification access is disabled. Enable it to receive study reminders and exam alerts.',
    blockedMessage:
      'Notification access is blocked in device settings. Please enable notifications to receive study reminders.',
    settingsHint: 'Open Settings to allow notifications',
    icon: 'notifications-active',
  },
};

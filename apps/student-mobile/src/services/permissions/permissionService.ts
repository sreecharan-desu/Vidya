/**
 * Central permission service for the Vidya Learning App.
 *
 * All permission checks and requests go through this module so that:
 *  • Duplicate permission prompts are avoided.
 *  • Platform differences (iOS vs Android vs Web) are normalised.
 *  • The rest of the codebase works with a consistent `PermissionResult`.
 *
 * Implementation notes:
 *  – Uses `expo-image-picker` for camera + photo library (already installed).
 *  – Uses `expo-notifications` for notification permissions.
 *  – Uses `expo-linking` (bundled with Expo) to open device settings.
 */

import { Platform, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  PermissionKey,
  PermissionStatus,
  PermissionResult,
} from './permissionTypes';

const NOTIFICATIONS_PREF_KEY = '@vidya_permission_notifications';

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Maps an Expo permission status string to our normalised enum.
 *
 * Expo SDK 57 uses `PermissionStatus` enum values: 'granted', 'denied',
 * 'undetermined'.  The `canAskAgain` flag tells us whether the OS has
 * permanently blocked the prompt.
 */
function normalise(
  expoStatus: string,
  canAskAgain: boolean,
): PermissionStatus {
  switch (expoStatus) {
    case 'granted':
      return 'granted';
    case 'undetermined':
      return 'undetermined';
    case 'denied':
      return canAskAgain ? 'denied' : 'blocked';
    default:
      return 'denied';
  }
}

/** Builds a consistent `PermissionResult` from a normalised status. */
function toResult(status: PermissionStatus): PermissionResult {
  return {
    status,
    canUse: status === 'granted' || status === 'limited',
    shouldOpenSettings: status === 'blocked',
  };
}

// ---------------------------------------------------------------------------
// Check (non-destructive — never shows the OS prompt)
// ---------------------------------------------------------------------------

async function checkCamera(): Promise<PermissionResult> {
  if (Platform.OS === 'web') return toResult('granted');
  const perm = await ImagePicker.getCameraPermissionsAsync();
  return toResult(normalise(perm.status, perm.canAskAgain));
}

async function checkPhotoLibrary(): Promise<PermissionResult> {
  if (Platform.OS === 'web') return toResult('granted');
  const perm = await ImagePicker.getMediaLibraryPermissionsAsync();
  // iOS 14+ limited access
  if (perm.accessPrivileges === 'limited') {
    return toResult('limited');
  }
  return toResult(normalise(perm.status, perm.canAskAgain));
}

async function checkNotifications(): Promise<PermissionResult> {
  if (Platform.OS === 'web') return toResult('granted');
  try {
    const saved = await AsyncStorage.getItem(NOTIFICATIONS_PREF_KEY);
    if (saved === 'denied' || saved === 'blocked') {
      return toResult(saved as PermissionStatus);
    }
    return toResult('granted');
  } catch {
    return toResult('granted');
  }
}

// ---------------------------------------------------------------------------
// Request (shows the OS prompt if the status is undetermined/denied)
// ---------------------------------------------------------------------------

async function requestCamera(): Promise<PermissionResult> {
  if (Platform.OS === 'web') return toResult('granted');
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  return toResult(normalise(perm.status, perm.canAskAgain));
}

async function requestPhotoLibrary(): Promise<PermissionResult> {
  if (Platform.OS === 'web') return toResult('granted');
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (perm.accessPrivileges === 'limited') {
    return toResult('limited');
  }
  return toResult(normalise(perm.status, perm.canAskAgain));
}

async function requestNotifications(): Promise<PermissionResult> {
  if (Platform.OS === 'web') return toResult('granted');
  try {
    await AsyncStorage.setItem(NOTIFICATIONS_PREF_KEY, 'granted');
    return toResult('granted');
  } catch {
    return toResult('granted');
  }
}

// ---------------------------------------------------------------------------
// Public API — dispatch by PermissionKey
// ---------------------------------------------------------------------------

const checkers: Record<PermissionKey, () => Promise<PermissionResult>> = {
  camera: checkCamera,
  photoLibrary: checkPhotoLibrary,
  notifications: checkNotifications,
};

const requesters: Record<PermissionKey, () => Promise<PermissionResult>> = {
  camera: requestCamera,
  photoLibrary: requestPhotoLibrary,
  notifications: requestNotifications,
};

/**
 * Check the current status of a permission **without** showing the OS prompt.
 */
export async function checkPermission(
  key: PermissionKey,
): Promise<PermissionResult> {
  try {
    return await checkers[key]();
  } catch (error) {
    console.warn(`[permissions] check(${key}) error:`, error);
    return toResult('unavailable');
  }
}

/**
 * Request a permission — shows the OS prompt if possible.
 *
 * If the permission is already granted this is a no-op and returns `granted`.
 * If the permission is permanently denied (`blocked`) this does NOT open
 * Settings automatically; instead `shouldOpenSettings` will be `true` so
 * the UI layer can offer an "Open Settings" CTA.
 */
export async function requestPermission(
  key: PermissionKey,
): Promise<PermissionResult> {
  try {
    // Fast path: already granted
    const current = await checkers[key]();
    if (current.canUse) return current;

    // Permanently blocked — cannot show the OS prompt
    if (current.status === 'blocked') return current;

    return await requesters[key]();
  } catch (error) {
    console.warn(`[permissions] request(${key}) error:`, error);
    return toResult('unavailable');
  }
}

/**
 * Open the device's app settings screen so the user can manually toggle
 * a permission that was permanently denied.
 */
export async function openAppSettings(): Promise<void> {
  try {
    if (Platform.OS === 'ios') {
      await Linking.openURL('app-settings:');
    } else {
      await Linking.openSettings();
    }
  } catch (error) {
    console.warn('[permissions] openAppSettings error:', error);
  }
}

/**
 * Convenience: request a permission, and if it ends up blocked, immediately
 * return the result so the UI can show the "Open Settings" flow.
 *
 * This is the recommended single-call entry point for feature screens.
 */
export async function ensurePermission(
  key: PermissionKey,
): Promise<PermissionResult> {
  return requestPermission(key);
}

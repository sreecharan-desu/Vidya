/**
 * React hook that wraps the permission service for use in components.
 *
 * Usage:
 * ```tsx
 * const { status, canUse, check, request, openSettings, loading } =
 *   useAppPermission('camera');
 *
 * // Check on mount
 * useEffect(() => { check(); }, []);
 *
 * // Request when user taps a button
 * <TouchableOpacity onPress={request}>
 *   <Text>Allow Camera</Text>
 * </TouchableOpacity>
 * ```
 */

import { useState, useCallback, useRef, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';
import {
  PermissionKey,
  PermissionStatus,
  PermissionResult,
  checkPermission,
  requestPermission,
  openAppSettings,
  PERMISSION_MESSAGES,
} from '../services/permissions';
import type { PermissionMessageSet } from '../services/permissions';

export interface UseAppPermissionReturn {
  /** Current normalised status. `null` until the first check runs. */
  status: PermissionStatus | null;
  /** `true` when the app can use the protected feature. */
  canUse: boolean;
  /** `true` when the user should be directed to device Settings. */
  shouldOpenSettings: boolean;
  /** `true` while a check or request is in flight. */
  loading: boolean;
  /** Human-readable messages for this permission. */
  messages: PermissionMessageSet;
  /** Check the current status without showing the OS prompt. */
  check: () => Promise<PermissionResult>;
  /** Request the permission (shows the OS prompt if possible). */
  request: () => Promise<PermissionResult>;
  /** Open the device Settings screen. */
  openSettings: () => Promise<void>;
}

export function useAppPermission(
  key: PermissionKey,
  /** When true, automatically checks the permission on mount. */
  autoCheck = false,
): UseAppPermissionReturn {
  const [status, setStatus] = useState<PermissionStatus | null>(null);
  const [canUse, setCanUse] = useState(false);
  const [shouldOpenSettings, setShouldOpenSettings] = useState(false);
  const [loading, setLoading] = useState(false);
  const messages = PERMISSION_MESSAGES[key];

  const applyResult = useCallback((result: PermissionResult) => {
    setStatus(result.status);
    setCanUse(result.canUse);
    setShouldOpenSettings(result.shouldOpenSettings);
  }, []);

  const check = useCallback(async (): Promise<PermissionResult> => {
    setLoading(true);
    try {
      const result = await checkPermission(key);
      applyResult(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, [key, applyResult]);

  const request = useCallback(async (): Promise<PermissionResult> => {
    setLoading(true);
    try {
      const result = await requestPermission(key);
      applyResult(result);
      return result;
    } finally {
      setLoading(false);
    }
  }, [key, applyResult]);

  const openSettingsAction = useCallback(async () => {
    await openAppSettings();
  }, []);

  // Auto-check on mount when requested
  useEffect(() => {
    if (autoCheck) {
      check();
    }
  }, [autoCheck, check]);

  // Re-check when the app returns from Settings (user may have toggled
  // the permission in the device Settings screen).
  const wasInBackground = useRef(false);
  useEffect(() => {
    const handleAppStateChange = (nextState: AppStateStatus) => {
      if (nextState === 'active' && wasInBackground.current) {
        // User returned from background / Settings
        check();
      }
      wasInBackground.current = nextState !== 'active';
    };

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    return () => subscription.remove();
  }, [check]);

  return {
    status,
    canUse,
    shouldOpenSettings,
    loading,
    messages,
    check,
    request,
    openSettings: openSettingsAction,
  };
}

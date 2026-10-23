/**
 * Core types for the Vidya permission system.
 *
 * All permission-related code (service, hooks, UI) shares these types so that
 * permission results are consistent and type-safe across the entire app.
 */

// ---------------------------------------------------------------------------
// Permission identifiers — one entry per protected feature the app uses today
// ---------------------------------------------------------------------------

export type PermissionKey =
  | 'camera'
  | 'photoLibrary'
  | 'notifications';

// ---------------------------------------------------------------------------
// Normalised status — platform-specific values are mapped to one of these
// ---------------------------------------------------------------------------

export type PermissionStatus =
  /** User has granted access. */
  | 'granted'
  /** User has not yet been asked (first launch / fresh install). */
  | 'undetermined'
  /** User denied the request but the OS *may* allow asking again. */
  | 'denied'
  /** User denied the request *and* the OS will NOT show the prompt again.
   *  The only recovery path is opening the device Settings screen. */
  | 'blocked'
  /** The device does not support this feature at all (e.g. no camera). */
  | 'unavailable'
  /** iOS-specific: user granted partial / limited access (e.g. limited photos). */
  | 'limited';

// ---------------------------------------------------------------------------
// Result object returned by every check / request call
// ---------------------------------------------------------------------------

export interface PermissionResult {
  /** Normalised status after the operation. */
  status: PermissionStatus;
  /** `true` when the app can proceed with the protected feature. */
  canUse: boolean;
  /** When `true` the app should offer a "Go to Settings" CTA. */
  shouldOpenSettings: boolean;
}

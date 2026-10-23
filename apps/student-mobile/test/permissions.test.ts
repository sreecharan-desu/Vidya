import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { PERMISSION_MESSAGES } from '../src/services/permissions/permissionMessages';
import type { PermissionKey } from '../src/services/permissions/permissionTypes';

describe('Permissions System', () => {
  const REQUIRED_KEYS: PermissionKey[] = ['camera', 'photoLibrary', 'notifications'];

  it('provides complete messaging sets for all permission keys', () => {
    for (const key of REQUIRED_KEYS) {
      const message = PERMISSION_MESSAGES[key];
      assert.ok(message, `Missing message set for ${key}`);
      assert.ok(message.title.length > 0, `${key} missing title`);
      assert.ok(message.reason.length > 0, `${key} missing reason`);
      assert.ok(message.deniedMessage.length > 0, `${key} missing deniedMessage`);
      assert.ok(message.blockedMessage.length > 0, `${key} missing blockedMessage`);
      assert.ok(message.settingsHint.length > 0, `${key} missing settingsHint`);
      assert.ok(message.icon.length > 0, `${key} missing icon`);
    }
  });

  it('contains clear student-friendly reason explanations', () => {
    assert.match(
      PERMISSION_MESSAGES.camera.reason,
      /camera/i,
      'Camera reason should mention camera'
    );
    assert.match(
      PERMISSION_MESSAGES.photoLibrary.reason,
      /photo/i,
      'Photo library reason should mention photos'
    );
    assert.match(
      PERMISSION_MESSAGES.notifications.reason,
      /reminder|exam/i,
      'Notifications reason should explain study reminders or exams'
    );
  });
});

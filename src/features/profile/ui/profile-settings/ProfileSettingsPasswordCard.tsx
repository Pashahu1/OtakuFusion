'use client';

import { KeyRound } from 'lucide-react';

import { cn } from '@/lib/utils';

import { PasswordField } from './PasswordField';
import type { useProfilePasswordChange } from './useProfilePasswordChange';

type PasswordState = ReturnType<typeof useProfilePasswordChange>;

export function ProfileSettingsPasswordCard(props: PasswordState) {
  const {
    userEmail,
    oldPassword,
    setOldPassword,
    newPassword,
    setNewPassword,
    confirmPassword,
    setConfirmPassword,
    showOld,
    setShowOld,
    showNew,
    setShowNew,
    showConfirm,
    setShowConfirm,
    isSaving,
    passwordRules,
    hasPasswordChanges,
    passwordsMatch,
    canSavePassword,
    handlePasswordSubmit,
    handleDiscardPassword,
  } = props;

  return (
    <form
      className="profile-settings__card profile-panel"
      onSubmit={handlePasswordSubmit}
      aria-busy={isSaving}
    >
      <div className="profile-settings__card-head">
        <span className="profile-settings__card-icon" aria-hidden>
          <KeyRound size={18} />
        </span>
        <div>
          <h3 className="profile-settings__card-title">Change password</h3>
          <p className="profile-settings__card-desc">Signed in as {userEmail}</p>
        </div>
      </div>

      <PasswordField
        id="current-password"
        label="Current password"
        value={oldPassword}
        visible={showOld}
        onToggle={() => setShowOld((v) => !v)}
        onChange={setOldPassword}
        autoComplete="current-password"
        disabled={isSaving}
      />

      <PasswordField
        id="new-password"
        label="New password"
        value={newPassword}
        visible={showNew}
        onToggle={() => setShowNew((v) => !v)}
        onChange={setNewPassword}
        autoComplete="new-password"
        disabled={isSaving}
      />

      <PasswordField
        id="confirm-password"
        label="Confirm new password"
        value={confirmPassword}
        visible={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        disabled={isSaving}
        mismatch={confirmPassword.length > 0 && newPassword !== confirmPassword}
      />

      <ul className="profile-settings__rules" aria-label="Password requirements">
        {passwordRules.map((rule) => (
          <li
            key={rule.id}
            className={cn(
              'profile-settings__rule',
              rule.met && 'profile-settings__rule--met',
            )}
          >
            {rule.label}
          </li>
        ))}
        <li
          className={cn(
            'profile-settings__rule',
            passwordsMatch && newPassword.length > 0 && 'profile-settings__rule--met',
          )}
        >
          Passwords match
        </li>
      </ul>

      <div
        className={cn(
          'profile-settings__actions',
          hasPasswordChanges && 'profile-settings__actions--visible',
        )}
      >
        <button
          type="button"
          className="profile-settings__btn profile-settings__btn--ghost"
          onClick={handleDiscardPassword}
          disabled={isSaving || !hasPasswordChanges}
        >
          Discard
        </button>
        <button
          type="submit"
          className="profile-settings__btn profile-settings__btn--primary"
          disabled={isSaving || !canSavePassword}
        >
          {isSaving ? 'Saving…' : 'Update password'}
        </button>
      </div>
    </form>
  );
}

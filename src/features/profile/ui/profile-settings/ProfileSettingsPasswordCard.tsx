'use client';

import { KeyRound } from 'lucide-react';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation('common');

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
          <h3 className="profile-settings__card-title">{t('settings.changePassword')}</h3>
          <p className="profile-settings__card-desc">
            {t('settings.signedInAs', { email: userEmail })}
          </p>
        </div>
      </div>

      <PasswordField
        id="current-password"
        label={t('settings.currentPassword')}
        value={oldPassword}
        visible={showOld}
        onToggle={() => setShowOld((v) => !v)}
        onChange={setOldPassword}
        autoComplete="current-password"
        disabled={isSaving}
      />

      <PasswordField
        id="new-password"
        label={t('settings.newPassword')}
        value={newPassword}
        visible={showNew}
        onToggle={() => setShowNew((v) => !v)}
        onChange={setNewPassword}
        autoComplete="new-password"
        disabled={isSaving}
      />

      <PasswordField
        id="confirm-password"
        label={t('settings.confirmNewPassword')}
        value={confirmPassword}
        visible={showConfirm}
        onToggle={() => setShowConfirm((v) => !v)}
        onChange={setConfirmPassword}
        autoComplete="new-password"
        disabled={isSaving}
        mismatch={confirmPassword.length > 0 && newPassword !== confirmPassword}
      />

      <ul className="profile-settings__rules" aria-label={t('settings.passwordRequirements')}>
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
          {t('settings.passwordsMatch')}
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
          {t('actions.discard')}
        </button>
        <button
          type="submit"
          className="profile-settings__btn profile-settings__btn--primary"
          disabled={isSaving || !canSavePassword}
        >
          {isSaving ? t('actions.saving') : t('settings.updatePassword')}
        </button>
      </div>
    </form>
  );
}

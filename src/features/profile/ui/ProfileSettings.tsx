'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { KeyRound, Pencil, Shield } from 'lucide-react';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

import { PasswordField } from './profile-settings/PasswordField';
import { buildPasswordRules } from './profile-settings/profilePasswordRules';
import { ProfileSettingsDangerZone } from './profile-settings/ProfileSettingsDangerZone';
import '../profile-settings.scss';

export function ProfileSettings() {
  const { user, logout } = useAuth();

  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showOld, setShowOld] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const passwordRules = useMemo(() => buildPasswordRules(newPassword), [newPassword]);

  const hasPasswordChanges =
    oldPassword.length > 0 || newPassword.length > 0 || confirmPassword.length > 0;

  const allRulesMet = passwordRules.every((rule) => rule.met);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const canSavePassword =
    hasPasswordChanges &&
    oldPassword.length > 0 &&
    allRulesMet &&
    passwordsMatch &&
    newPassword !== oldPassword;

  async function handlePasswordSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (!canSavePassword) return;

    setIsSaving(true);
    try {
      const res = await fetch('/api/user/change-password', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      });

      const data = (await res.json()) as { message?: string };
      if (!res.ok) {
        toast.error(data.message || 'Could not update password.');
        return;
      }

      toast.success('Password updated successfully.');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch {
      toast.error('Something went wrong. Try again.');
    } finally {
      setIsSaving(false);
    }
  }

  function handleDiscardPassword() {
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setShowOld(false);
    setShowNew(false);
    setShowConfirm(false);
  }

  async function handleDeleteAccount() {
    const res = await fetch('/api/user/delete-account', {
      method: 'DELETE',
      credentials: 'include',
    });

    if (!res.ok) {
      toast.error('Could not delete account.');
      throw new Error('delete_failed');
    }

    localStorage.clear();
    await logout();
    window.location.href = '/';
  }

  if (!user) return null;

  return (
    <div className="profile-settings">
      <div className="profile-settings__intro">
        <h2 className="profile-settings__title">Settings</h2>
        <p className="profile-settings__subtitle">
          Manage your password and account security.
        </p>
      </div>

      <div className="profile-settings__grid">
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
              <p className="profile-settings__card-desc">Signed in as {user.email}</p>
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

        <aside className="profile-settings__card profile-panel profile-settings__aside">
          <div className="profile-settings__card-head">
            <span className="profile-settings__card-icon" aria-hidden>
              <Shield size={18} />
            </span>
            <div>
              <h3 className="profile-settings__card-title">Security tips</h3>
              <p className="profile-settings__card-desc">
                Keep your OtakuFusion account safe.
              </p>
            </div>
          </div>

          <ul className="profile-settings__tips">
            <li>Use a password you do not reuse on other sites.</li>
            <li>Change your password if you sign in on a shared device.</li>
            <li>Verify your email so you can recover access later.</li>
          </ul>

          <Link href="/profile/manage" className="profile-settings__link-row">
            <Pencil aria-hidden size={16} />
            <span>Edit profile & avatar</span>
          </Link>
        </aside>
      </div>

      <ProfileSettingsDangerZone onDeleteAccount={handleDeleteAccount} />
    </div>
  );
}

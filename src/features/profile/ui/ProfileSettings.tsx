'use client';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';

import { ProfileSettingsDangerZone } from './profile-settings/ProfileSettingsDangerZone';
import { ProfileSettingsPasswordCard } from './profile-settings/ProfileSettingsPasswordCard';
import { ProfileSettingsSecurityAside } from './profile-settings/ProfileSettingsSecurityAside';
import { useProfilePasswordChange } from './profile-settings/useProfilePasswordChange';
import '../profile-settings.scss';

export function ProfileSettings() {
  const { user, logout } = useAuth();
  const password = useProfilePasswordChange(user?.email);

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
        <ProfileSettingsPasswordCard {...password} />
        <ProfileSettingsSecurityAside />
      </div>

      <ProfileSettingsDangerZone onDeleteAccount={handleDeleteAccount} />
    </div>
  );
}

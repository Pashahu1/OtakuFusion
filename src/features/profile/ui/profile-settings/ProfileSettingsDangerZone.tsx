'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { toast } from '@/lib/toast';

interface ProfileSettingsDangerZoneProps {
  onDeleteAccount: () => Promise<void>;
}

export function ProfileSettingsDangerZone({ onDeleteAccount }: ProfileSettingsDangerZoneProps) {
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm'>('idle');
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      await onDeleteAccount();
    } catch {
      toast.error('Something went wrong.');
    } finally {
      setIsDeleting(false);
    }
  }

  return (
    <section
      className="profile-settings__danger profile-panel"
      aria-labelledby="profile-danger-heading"
    >
      <div className="profile-settings__danger-head">
        <AlertTriangle aria-hidden size={20} className="profile-settings__danger-icon" />
        <div>
          <h3 id="profile-danger-heading" className="profile-settings__danger-title">
            Danger zone
          </h3>
          <p className="profile-settings__danger-desc">
            Permanently delete your account, favorites, and local watch data linked to this
            profile.
          </p>
        </div>
      </div>

      {deleteStep === 'idle' ? (
        <button
          type="button"
          className="profile-settings__danger-trigger"
          onClick={() => setDeleteStep('confirm')}
        >
          Delete my account
        </button>
      ) : (
        <div className="profile-settings__danger-confirm" role="region" aria-live="polite">
          <p className="profile-settings__danger-question">This cannot be undone. Are you sure?</p>
          <div className="profile-settings__danger-actions">
            <button
              type="button"
              className="profile-settings__btn profile-settings__btn--ghost"
              onClick={() => setDeleteStep('idle')}
              disabled={isDeleting}
            >
              Cancel
            </button>
            <button
              type="button"
              className="profile-settings__btn profile-settings__btn--danger"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? 'Deleting…' : 'Yes, delete account'}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

'use client';

import { useState } from 'react';
import { AlertTriangle } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { toast } from '@/lib/toast';

interface ProfileSettingsDangerZoneProps {
  onDeleteAccount: () => Promise<void>;
}

export function ProfileSettingsDangerZone({ onDeleteAccount }: ProfileSettingsDangerZoneProps) {
  const { t } = useTranslation('common');
  const [deleteStep, setDeleteStep] = useState<'idle' | 'confirm'>('idle');
  const [isDeleting, setIsDeleting] = useState(false);

  async function handleDeleteAccount() {
    setIsDeleting(true);
    try {
      await onDeleteAccount();
    } catch {
      toast.error(t('toast.generic'));
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
            {t('settings.dangerTitle')}
          </h3>
          <p className="profile-settings__danger-desc">
            {t('settings.dangerDesc')}
          </p>
        </div>
      </div>

      {deleteStep === 'idle' ? (
        <button
          type="button"
          className="profile-settings__danger-trigger"
          onClick={() => setDeleteStep('confirm')}
        >
          {t('settings.deleteAccount')}
        </button>
      ) : (
        <div className="profile-settings__danger-confirm" role="region" aria-live="polite">
          <p className="profile-settings__danger-question">{t('settings.deleteConfirm')}</p>
          <div className="profile-settings__danger-actions">
            <button
              type="button"
              className="profile-settings__btn profile-settings__btn--ghost"
              onClick={() => setDeleteStep('idle')}
              disabled={isDeleting}
            >
              {t('actions.cancel')}
            </button>
            <button
              type="button"
              className="profile-settings__btn profile-settings__btn--danger"
              onClick={handleDeleteAccount}
              disabled={isDeleting}
            >
              {isDeleting ? t('settings.deleting') : t('settings.yesDelete')}
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

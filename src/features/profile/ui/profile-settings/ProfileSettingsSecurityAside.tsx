'use client';

import Link from 'next/link';
import { Pencil, Shield } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export function ProfileSettingsSecurityAside() {
  const { t } = useTranslation('common');

  return (
    <aside className="profile-settings__card profile-panel profile-settings__aside">
      <div className="profile-settings__card-head">
        <span className="profile-settings__card-icon" aria-hidden>
          <Shield size={18} />
        </span>
        <div>
          <h3 className="profile-settings__card-title">{t('settings.securityTips')}</h3>
          <p className="profile-settings__card-desc">{t('settings.securityHint')}</p>
        </div>
      </div>

      <ul className="profile-settings__tips">
        <li>{t('settings.tipReuse')}</li>
        <li>{t('settings.tipShared')}</li>
        <li>{t('settings.tipVerify')}</li>
      </ul>

      <Link href="/profile/manage" className="profile-settings__link-row">
        <Pencil aria-hidden size={16} />
        <span>{t('settings.editProfileAvatar')}</span>
      </Link>
    </aside>
  );
}

import Link from 'next/link';
import { useTranslation } from 'react-i18next';
import { KeyRound, LayoutGrid, ShieldCheck, Star } from 'lucide-react';

import { VerifiedSealIcon } from '@/components/icons/verified-seal-icon';
import { cn } from '@/lib/utils';

interface ProfileEditAccountSectionProps {
  email: string;
  isVerified: boolean;
  role: string;
}

export function ProfileEditAccountSection({
  email,
  isVerified,
  role,
}: ProfileEditAccountSectionProps) {
  const { t } = useTranslation('common');
  const isAdmin = role === 'admin';

  return (
    <section className="profile-edit__card profile-panel">
      <h3 className="profile-edit__card-title">{t('profile.account')}</h3>

      <div className="profile-edit__account-row">
        <span className="profile-edit__label">{t('auth.email')}</span>
        <div className="profile-edit__email-value">
          <span>{email}</span>
          {isVerified ? (
            <VerifiedSealIcon
              className="h-4 w-4 shrink-0 text-zinc-100"
              title={t('profile.emailVerified')}
            />
          ) : (
            <span className="profile-edit__badge profile-edit__badge--warn">
              {t('profile.unverified')}
            </span>
          )}
        </div>
      </div>

      <div className="profile-edit__account-row">
        <span className="profile-edit__label">{t('profile.accountType')}</span>
        <span
          className={cn('profile-edit__badge', isAdmin && 'profile-edit__badge--admin')}
        >
          {isAdmin ? (
            <>
              <ShieldCheck aria-hidden size={14} />
              {t('profile.admin')}
            </>
          ) : (
            t('profile.member')
          )}
        </span>
      </div>

      <div className="profile-edit__shortcuts">
        <span className="profile-edit__label">{t('profile.shortcuts')}</span>
        <div className="profile-edit__shortcut-grid">
          <Link href="/profile" className="profile-edit__shortcut">
            <LayoutGrid aria-hidden size={18} />
            <span>{t('profile.overview')}</span>
          </Link>
          <Link href="/profile/favorites" className="profile-edit__shortcut">
            <Star aria-hidden size={18} />
            <span>{t('profile.favorites')}</span>
          </Link>
          <Link href="/profile/preferences" className="profile-edit__shortcut">
            <KeyRound aria-hidden size={18} />
            <span>{t('profile.password')}</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

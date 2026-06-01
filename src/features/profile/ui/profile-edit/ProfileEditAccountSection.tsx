import Link from 'next/link';
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
  const isAdmin = role === 'admin';

  return (
    <section className="profile-edit__card profile-panel">
      <h3 className="profile-edit__card-title">Account</h3>

      <div className="profile-edit__account-row">
        <span className="profile-edit__label">Email</span>
        <div className="profile-edit__email-value">
          <span>{email}</span>
          {isVerified ? (
            <VerifiedSealIcon
              className="h-4 w-4 shrink-0 text-zinc-100"
              title="Email verified"
            />
          ) : (
            <span className="profile-edit__badge profile-edit__badge--warn">Unverified</span>
          )}
        </div>
      </div>

      <div className="profile-edit__account-row">
        <span className="profile-edit__label">Account type</span>
        <span
          className={cn('profile-edit__badge', isAdmin && 'profile-edit__badge--admin')}
        >
          {isAdmin ? (
            <>
              <ShieldCheck aria-hidden size={14} />
              Admin
            </>
          ) : (
            'Member'
          )}
        </span>
      </div>

      <div className="profile-edit__shortcuts">
        <span className="profile-edit__label">Shortcuts</span>
        <div className="profile-edit__shortcut-grid">
          <Link href="/profile" className="profile-edit__shortcut">
            <LayoutGrid aria-hidden size={18} />
            <span>Overview</span>
          </Link>
          <Link href="/profile/favorites" className="profile-edit__shortcut">
            <Star aria-hidden size={18} />
            <span>Favorites</span>
          </Link>
          <Link href="/profile/preferences" className="profile-edit__shortcut">
            <KeyRound aria-hidden size={18} />
            <span>Password</span>
          </Link>
        </div>
      </div>
    </section>
  );
}

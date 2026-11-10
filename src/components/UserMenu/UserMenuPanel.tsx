'use client';

import { Bookmark, LogOut, Settings } from 'lucide-react';
import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerifiedSealIcon } from '@/components/icons/verified-seal-icon';
import { cloudinaryAvatarUrl } from '@/shared/utils/cloudinary-avatar-url';

import type { User } from './user-menu-types';

interface UserMenuPanelProps {
  user: User;
  loading: boolean;
  menuRef: React.RefObject<HTMLDivElement | null>;
  onNavigate: (href: string) => void;
  onLogout: () => void;
}

export function UserMenuPanel({
  user,
  loading,
  menuRef,
  onNavigate,
  onLogout,
}: UserMenuPanelProps) {
  const { t } = useTranslation('common');

  return (
    <div
      ref={menuRef}
      role="menu"
      className="user-menu__panel"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        type="button"
        role="menuitem"
        className="user-menu__profile"
        onClick={() => onNavigate('/profile')}
      >
        <div className="user-menu__profile-avatar">
          <Avatar className="h-full w-full">
            <AvatarImage
              className="h-full w-full rounded-full object-cover"
              src={cloudinaryAvatarUrl(user?.avatar, 40)}
              alt=""
            />
            <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        </div>

        <div className="user-menu__profile-meta">
          <span className="user-menu__profile-name">
            {user.username}
            {user.isVerified ? (
              <VerifiedSealIcon
                className="h-4 w-4 shrink-0 text-zinc-100"
                title={t('profile.emailVerified')}
              />
            ) : null}
          </span>
          <span className="user-menu__profile-email">{user.email}</span>
        </div>
      </button>

      <div className="user-menu__actions">
        <button
          type="button"
          role="menuitem"
          className="user-menu__item"
          onClick={() => onNavigate('/profile/preferences')}
        >
          <span className="user-menu__item-icon" aria-hidden>
            <Settings size={15} strokeWidth={2.25} />
          </span>
          {t('userMenu.settings')}
        </button>

        <button
          type="button"
          role="menuitem"
          className="user-menu__item"
          onClick={() => onNavigate('/profile/favorites')}
        >
          <span className="user-menu__item-icon" aria-hidden>
            <Bookmark size={15} strokeWidth={2.25} />
          </span>
          {t('userMenu.wishList')}
        </button>
      </div>

      <div className="user-menu__footer">
        <button
          type="button"
          role="menuitem"
          className="user-menu__item user-menu__item--danger"
          disabled={loading}
          onClick={!loading ? onLogout : undefined}
        >
          <span className="user-menu__item-icon" aria-hidden>
            <LogOut size={15} strokeWidth={2.25} />
          </span>
          {loading ? t('userMenu.loggingOut') : t('userMenu.logout')}
        </button>
      </div>
    </div>
  );
}

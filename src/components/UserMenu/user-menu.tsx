'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import { useAuth } from '@/context/AuthContext';
import { useDropdown } from '@/hooks/useDropdown';
import { cloudinaryAvatarUrl } from '@/shared/utils/cloudinary-avatar-url';

import { UserMenuPanel } from './UserMenuPanel';
import type { User } from './user-menu-types';
import { useNavAvatarHold } from './useNavAvatarHold';
import './user-menu.scss';

export type { User } from './user-menu-types';

type UserMenuProps = {
  user: User;
};

export function UserMenu({ user }: UserMenuProps) {
  const { isOpen, toggle, close, triggerRef, menuRef } = useDropdown<
    HTMLDivElement,
    HTMLDivElement
  >();
  const [loading, setLoading] = useState(false);
  const { logout, profileSavePending, profileNavbarAvatarHold, setProfileNavbarAvatarHold } =
    useAuth();
  const router = useRouter();

  const showNavAvatarSkeleton = profileSavePending || profileNavbarAvatarHold;

  useNavAvatarHold(user?.avatar, profileNavbarAvatarHold, setProfileNavbarAvatarHold);

  async function handleLogout() {
    try {
      setLoading(true);
      close();
      await logout();
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  }

  function navigate(href: string) {
    router.push(href);
    close();
  }

  return (
    <div
      className={`user-menu${isOpen ? ' user-menu--open' : ''}`}
      onClick={toggle}
      ref={triggerRef}
      role="button"
      tabIndex={0}
      aria-haspopup="menu"
      aria-expanded={isOpen}
      aria-label={`Account menu, ${user.username}`}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          toggle();
        }
      }}
    >
      <div className="user-menu__avatar-wrap">
        {showNavAvatarSkeleton ? (
          <Skeleton className="h-9 w-9 min-h-0 shrink-0 rounded-full" />
        ) : (
          <Avatar className="h-9 w-9 items-center justify-center">
            <AvatarImage
              className="h-9 w-9 rounded-full object-cover"
              src={cloudinaryAvatarUrl(user?.avatar, 36)}
              alt=""
            />
            <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
      </div>

      {isOpen ? (
        <UserMenuPanel
          user={user}
          loading={loading}
          menuRef={menuRef}
          onNavigate={navigate}
          onLogout={handleLogout}
        />
      ) : null}
    </div>
  );
}

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useDropdown } from '@/hooks/useDropdown';
import { Bookmark, LogOut, Settings } from 'lucide-react';
import { cloudinaryAvatarUrl } from '@/shared/utils/cloudinary-avatar-url';
import { VerifiedSealIcon } from '@/components/icons/verified-seal-icon';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';
import './user-menu.scss';

export type User = {
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
  isVerified?: boolean;
};

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

  const showNavAvatarSkeleton =
    profileSavePending || profileNavbarAvatarHold;

  useEffect(() => {
    if (!profileNavbarAvatarHold || !user?.avatar) return;
    let cancelled = false;
    const src = cloudinaryAvatarUrl(user.avatar, 36);
    const img = new window.Image();
    const maxWait = window.setTimeout(() => {
      if (!cancelled) setProfileNavbarAvatarHold(false);
    }, 8000);
    img.onload = () => {
      if (!cancelled) setProfileNavbarAvatarHold(false);
    };
    img.onerror = () => {
      if (!cancelled) setProfileNavbarAvatarHold(false);
    };
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      if (!cancelled) setProfileNavbarAvatarHold(false);
      window.clearTimeout(maxWait);
    }
    return () => {
      cancelled = true;
      window.clearTimeout(maxWait);
    };
  }, [profileNavbarAvatarHold, user?.avatar, setProfileNavbarAvatarHold]);

  const handleLogout = async () => {
    try {
      setLoading(true);
      close();
      await logout();
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  function navigate(href: string) {
    router.push(href);
    close();
  }

  return (
    <div
      className="user-menu"
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
        <div
          ref={menuRef}
          role="menu"
          className="user-menu__panel"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="user-menu__accent" aria-hidden />

          <button
            type="button"
            role="menuitem"
            className="user-menu__profile"
            onClick={() => navigate('/profile')}
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
                    title="Email verified"
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
              onClick={() => navigate('/profile/preferences')}
            >
              <span className="user-menu__item-icon" aria-hidden>
                <Settings size={15} strokeWidth={2.25} />
              </span>
              Settings
            </button>

            <button
              type="button"
              role="menuitem"
              className="user-menu__item"
              onClick={() => navigate('/profile/favorites')}
            >
              <span className="user-menu__item-icon" aria-hidden>
                <Bookmark size={15} strokeWidth={2.25} />
              </span>
              Wish List
            </button>
          </div>

          <div className="user-menu__footer">
            <button
              type="button"
              role="menuitem"
              className="user-menu__item user-menu__item--danger"
              disabled={loading}
              onClick={!loading ? handleLogout : undefined}
            >
              <span className="user-menu__item-icon" aria-hidden>
                <LogOut size={15} strokeWidth={2.25} />
              </span>
              {loading ? 'Logging out…' : 'Logout'}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

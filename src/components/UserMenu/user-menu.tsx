'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useEffect, useState } from 'react';
import { useDropdown } from '@/hooks/useDropdown';
import Image from 'next/image';
import { cloudinaryAvatarUrl } from '@/helper/cloudinaryAvatarUrl';
import { VerifiedSealIcon } from '@/components/icons/verified-seal-icon';
import { Skeleton } from '@/components/ui/Skeleton/Skeleton';

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

  return (
    <div
      className="flex h-full cursor-pointer items-center px-5 transition-colors lg:hover:bg-[#141519]"
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
      <div className="relative h-9 w-9 shrink-0">
        {showNavAvatarSkeleton ? (
          <Skeleton className="h-9 w-9 min-h-0 shrink-0 rounded-full" />
        ) : (
          <Avatar className="h-9 w-9 items-center justify-center">
            <AvatarImage
              className="h-9 w-9 object-cover rounded-full"
              src={cloudinaryAvatarUrl(user?.avatar, 36)}
              alt=""
            />
            <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
          </Avatar>
        )}
      </div>

      {isOpen && (
        <div
          ref={menuRef}
          role="menu"
          className="absolute top-0 right-0 translate-y-[60px] w-full bg-[#141519] md:max-w-[400px] bg-[#141519] border border-zinc-800"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="
              flex items-center gap-4 px-6 py-5
              border-b border-zinc-800
              hover:bg-zinc-800/30 transition-colors
            "
            onClick={() => {
              router.push('/profile/manage');
              close();
            }}
          >
            <Avatar className="h-10 w-10">
              <AvatarImage
                className="h-full w-full object-cover rounded-full"
                src={cloudinaryAvatarUrl(user?.avatar, 40)}
                alt=""
              />
              <AvatarFallback>
                {user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>

            <div className="flex min-w-0 flex-col gap-1">
              <span className="flex flex-wrap items-center gap-2 text-white font-medium">
                {user.username}
                {user.isVerified ? (
                  <VerifiedSealIcon
                    className="h-4 w-4 shrink-0 text-zinc-100"
                    title="Email verified"
                  />
                ) : null}
              </span>
              <span className="text-zinc-400 text-sm">{user.email}</span>
            </div>
          </div>

          <div
            className="flex items-center gap-[10px]
              px-5 py-3 cursor-pointer
              border-b border-zinc-800
              hover:bg-zinc-800/30 transition-colors
            "
            onClick={() => {
              router.push('/profile/preferences');
              close();
            }}
          >
            <Image width={16} height={16} src="/settings.png" alt="settings" />
            <span className="text-white">Settings</span>
          </div>

          <div
            className="flex items-center gap-[10px]
              px-5 py-3 cursor-pointer
              border-b border-zinc-800
              hover:bg-zinc-800/30 transition-colors
            "
            onClick={() => {
              router.push('/profile/favorites');
              close();
            }}
          >
            <Image width={16} height={16} src="/wishlist.png" alt="wishlist" />
            <span className="text-white">Wish List</span>
          </div>

          <div
            className="flex items-center gap-[10px]
              px-5 py-3 cursor-pointer
              hover:bg-red-900/20 transition-colors
            "
            onClick={!loading ? handleLogout : undefined}
          >
            <Image width={16} height={16} src="/logout.png" alt="logout" />
            <span
              className={`text-red-500 font-medium ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              Logout
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

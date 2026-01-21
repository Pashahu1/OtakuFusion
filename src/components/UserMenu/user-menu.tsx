'use client';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import { useDropdown } from '@/hooks/useDropdown';
import Image from 'next/image';

export type User = {
  username: string;
  email: string;
  role: string;
  avatar?: string | null;
};

type UserMenuProps = {
  user: User;
};

export function UserMenu({ user }: UserMenuProps) {
  const { isOpen, toggle, close, triggerRef, menuRef } = useDropdown<
    HTMLParagraphElement,
    HTMLDivElement
  >();
  const [loading, setLoading] = useState(false);
  const { logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    try {
      setLoading(true);
      await logout();
      router.push('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="flex items-center px-5 lg:hover:bg-black h-full cursor-pointer transition-colors"
      onClick={toggle}
      ref={triggerRef}
    >
      <Avatar className="items-center justify-center">
        <AvatarImage
          className="w-[36px] h-[36px] object-cover rounded-full"
          src={user?.avatar || ''}
        />
        <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
      </Avatar>

      {isOpen && (
        <div
          ref={menuRef}
          className="absolute top-0 right-0 translate-y-[60px] w-full bg-[#141519] md:max-w-[400px] bg-[#141519] border border-zinc-800"
        >
          <div
            className="
              flex items-center gap-4 px-5 py-4
              border-b border-zinc-800
              hover:bg-zinc-800/30 transition-colors
            "
            onClick={() => {
              router.push('/profile/manage');
              close;
            }}
          >
            <Avatar>
              <AvatarImage
                className="w-full h-full object-cover rounded-full"
                src={user?.avatar || ''}
              />
              <AvatarFallback>{user?.email?.[0]?.toUpperCase()}</AvatarFallback>
            </Avatar>

            <div className="flex flex-col">
              <span className="text-white font-medium">{user.username}</span>
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
              close;
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
              close;
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

'use client';
import { NavLink } from '@/components/NavLink/NavLink';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { UserMenu } from '@/components/UserMenu/user-menu';

export const NavbarList = () => {
  const { isAuth, user } = useAuth();
  return (
    <div className="flex items-center h-full">
      <NavLink className="p-0" href="/search">
        <Image
          width={24}
          height={24}
          src="/icon/search.svg"
          alt="search-icon"
        />
      </NavLink>
      {isAuth && user ? (
        <>
          <NavLink href="/profile/favorites">
            <Image width={24} height={24} src="/wishlist.png" alt="wishlist" />
          </NavLink>
          <UserMenu user={user} />
        </>
      ) : (
        <NavLink href="/auth/login">
          <Image width={24} height={24} src="/icon/user.svg" alt="user-icon" />
        </NavLink>
      )}
    </div>
  );
};

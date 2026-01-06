'use client';
import { NavLink } from '@/components/NavLink/NavLink';
import './NavbarList.scss';
import Image from 'next/image';
import { useAuth } from '@/context/AuthContext';
import { UserMenu } from '@/components/UserMenu/user-menu';

export const NavbarList = () => {
  const { isAuth, user } = useAuth();
  return (
    <div className="navbar-list">
      <NavLink className="navbar-list__link" href="/search">
        <Image
          width={24}
          height={24}
          src="/icon/search.svg"
          alt="search-icon"
        />
      </NavLink>
      {isAuth && user ? (
        <UserMenu user={user} />
      ) : (
        <NavLink className="navbar-list__link" href="/auth/login">
          <Image width={24} height={24} src="/icon/user.svg" alt="user-icon" />
        </NavLink>
      )}
    </div>
  );
};

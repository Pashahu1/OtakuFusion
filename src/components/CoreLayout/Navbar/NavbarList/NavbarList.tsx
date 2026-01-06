import { NavLink } from '@/components/NavLink/NavLink';
import './NavbarList.scss';
import Image from 'next/image';

export const NavbarList = () => {
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
      <NavLink className="navbar-list__link" href="/auth/login">
        <Image width={24} height={24} src="/icon/user.svg" alt="user-icon" />
      </NavLink>
    </div>
  );
};

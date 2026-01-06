'use client';
import { CategoryList } from '@/components/CategoryList/CategoryList';
import { NavLink } from '@/components/NavLink/NavLink';
import './NavbarDesktop.scss';
import { UserMenu } from '@/components/UserMenu/user-menu';
import { useAuth } from '@/context/AuthContext';

export const NavbarDesktop = () => {
  const { user } = useAuth();
  return (
    <div className="navbar__desktop">
      <div className="navbar__desktop-list">
        <NavLink className="" href="/">
          OtakuFusion
        </NavLink>
      </div>
      <div className="navbar__desktop-list">
        <NavLink href="/anime">Anime</NavLink>
      </div>
      <CategoryList />
    </div>
  );
};

import { CategoryList } from '@/components/CategoryList/CategoryList';
import { NavLink } from '@/components/NavLink/NavLink';
import './NavbarDesktop.scss';
export const NavbarDesktop = () => {
  return (
    <div className="navbar__desktop">
      <div className="navbar__desktop-list">
        <NavLink href="/">
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

import { CategoryList } from '@/components/CategoryList/CategoryList';
import { NavLink } from '@/components/NavLink/NavLink';
import { DISCOVER_NAV_SECTIONS } from '@/shared/data/discover-nav';
import './NavbarDesktop.scss';

export const NavbarDesktop = () => {
  return (
    <div className="navbar__desktop">
      <div className="navbar__desktop-list">
        <NavLink href="/">
          <span className="text-[var(--color-brand-orange)]">Otaku</span>
          Fusion
        </NavLink>
      </div>
      <div className="navbar__desktop-list navbar__desktop-list--discover">
        {DISCOVER_NAV_SECTIONS.map((item) => (
          <NavLink key={item.id} href={item.href}>
            {item.label}
          </NavLink>
        ))}
      </div>
      <CategoryList />
    </div>
  );
};

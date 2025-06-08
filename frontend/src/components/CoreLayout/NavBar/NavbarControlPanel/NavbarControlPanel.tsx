import { NavLink } from "../../../NavLink/NavLink";

export const NavbarControlPanel = () => {
  return (
    <ul className="navbar-list">
      <NavLink href="/">OtakuFusion</NavLink>
      <NavLink href="/animes/popular">Popular</NavLink>
      <NavLink href="/animes/category">Category</NavLink>

      {/* <NavLink href="/search">Search</NavLink> */}
      {/* <li className="navbar-list-item">
        <Link href="/">OtakuFusion</Link>
      </li>
      <li className="navbar-list-item">
        <Link href="/category">Category</Link>
      </li>
      <li className="navbar-list-item">
        <Link href="/search">Search</Link>
      </li> */}
    </ul>
  );
};

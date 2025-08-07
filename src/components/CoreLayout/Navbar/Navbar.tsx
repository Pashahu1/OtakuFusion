import "./Navbar.scss";
import { NavbarDesktop } from "./NavbarDesktop/NavbarDesktop";
import { NavbarMobile } from "./NavbarMobile/NavbarMobile";
import { NavbarList } from "./NavbarList/NavbarList";

export const Navbar = () => {
  return (
    <nav className="navbar">
      <NavbarDesktop />
      <NavbarMobile />
      <NavbarList />
    </nav>
  );
};

import "./NavBar.scss";
import { NavbarControlPanel } from "./NavbarControlPanel/NavbarControlPanel";
import { NavbarList } from "./NavbarList/NavbarList";

export const NavBar = () => {
  return (
    <nav className="navbar">
      <NavbarControlPanel />
      <NavbarList />
    </nav>
  );
};

"use client";
import { NavigationLink } from "../../../shared/NavigationLink/NavigationLink";

export const NavbarControlPanel = () => {
  return (
    <ul className="navbar-list">
      <NavigationLink title="Home" />
      <input type="text" />
    </ul>
  );
};

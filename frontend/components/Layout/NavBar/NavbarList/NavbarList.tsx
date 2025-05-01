"use client";
import { NavigationLink } from "../../../shared/NavigationLink/NavigationLink";

export const NavbarList = () => {
  return (
    <ul className="navbar-list">
      <li className="navbar-list-item">
        <NavigationLink title="Animes" />
      </li>
      <li className="navbar-list-item">
        <NavigationLink title="Manga" />
      </li>
      <li className="navbar-list-item">
        <NavigationLink title="Movies" />
      </li>
      <li className="navbar-list-item">
        <NavigationLink title="Series" />
      </li>
    </ul>
  );
};

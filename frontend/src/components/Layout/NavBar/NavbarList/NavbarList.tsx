"use client";
import { NavigationLink } from "../../../shared/NavigationLink/NavigationLink";
import Link from "next/link";
export const NavbarList = () => {
  return (
    <ul className="navbar-list">
      <li className="navbar-list-item">
        <Link style={{ color: "white" }} href="/search">
          <img style={{ width: "24px" }} src="!#" alt="search" />
        </Link>
      </li>
      <li className="navbar-list-item">
        <Link style={{ color: "white" }} href="/animes?letter=All&page=1">
          Anime
        </Link>
      </li>
      <li className="navbar-list-item">
        <Link href="/movies" title="Movies">
          Movies
        </Link>
      </li>
      <li className="navbar-list-item">
        <NavigationLink title="Series" />
      </li>
    </ul>
  );
};

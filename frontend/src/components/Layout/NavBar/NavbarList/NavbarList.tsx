"use client";
import Image from "next/image";
import Link from "next/link";
export const NavbarList = () => {
  return (
    <ul className="navbar-list">
      <li className="navbar-list-item">
        <Link style={{ color: "white" }} href="/search">
          <Image width={24} height={24} src="/icon/search.svg" alt="search" />
        </Link>
      </li>
      <li className="navbar-list-item">
        <Link style={{ color: "white" }} href="/animes?letter=All&page=1">
          Anime
        </Link>
      </li>
    </ul>
  );
};

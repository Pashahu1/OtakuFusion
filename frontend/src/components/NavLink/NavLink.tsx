"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import "./NavLink.scss";
import { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
}

export const NavLink = ({ href, children }: NavLinkProps) => {
  const path = usePathname();
  return (
    <li className="navbar-list-item">
      <Link className={`${path === href ? "active" : ""}`} href={href}>
        {children}
      </Link>
    </li>
  );
};

"use client";

import Link from "next/link";
import "./NavLink.scss";
import type { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

export const NavLink = ({
  href,
  children,
  onClick,
  className,
}: NavLinkProps) => {
  return (
    <Link
      className={`navigation-list__link ${className}`}
      onClick={onClick}
      href={href}
    >
      {children}
    </Link>
  );
};

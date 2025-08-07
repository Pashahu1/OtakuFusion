"use client";
import { NavLink } from "@/components/NavLink/NavLink";
import Image from "next/image";
import burger from "/public/icon/burgerMenu.svg";
import burgerOpen from "/public/icon/burgerMenuOpen.svg";
import "./NavbarMobile.scss";
import { SidebarMenu } from "../SidebarMenu/SidebarMenu";
import { useDropdown } from "@/hooks/useDropdown";

export function NavbarMobile() {
  const { isOpen, triggerRef, toggle, menuRef, close } = useDropdown<
    HTMLImageElement,
    HTMLDivElement
  >();

  return (
    <div className="navbar__mobile">
      <div className="navbar__mobile-content" ref={triggerRef}>
        {isOpen && <SidebarMenu menuRef={menuRef} close={close} />}
        <div className="burger-wrapper" ref={triggerRef} onClick={toggle}>
          {isOpen ? (
            <Image
              className="burger-menu"
              width={24}
              height={24}
              src={burgerOpen}
              alt="burger"
              aria-label="Open Burger Menu"
            />
          ) : (
            <Image
              className="burger-menu"
              width={24}
              height={24}
              src={burger}
              alt="burger"
              aria-label="Close Burger Menu"
            />
          )}
        </div>
      </div>

      <NavLink href="/">OtakuFusion</NavLink>
    </div>
  );
}

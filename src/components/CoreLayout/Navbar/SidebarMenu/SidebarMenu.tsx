"use client";

import { genres } from "@/shared/data/genres";
import { NavLink } from "@/components/NavLink/NavLink";
import "./SidebarMenu.scss";
import { useEffect, useState, type RefObject } from "react";

type Props = {
  menuRef: RefObject<HTMLDivElement | null>;
  close: () => void;
};

export function SidebarMenu({ menuRef, close }: Props) {
  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const handleOpenCategory = () => {
    setCategoryOpen((prev) => !prev);
  };

  useEffect(() => {
    setTimeout(() => setIsVisible(true), 10);
    return () => setIsVisible(false);
  }, []);

  return (
    <aside
      className={`aside-bar ${isVisible ? "aside-bar--enter" : "aside-bar--exit"
        }`}
      ref={menuRef}
    >
      <NavLink className="aside-bar__link" href="/schedule" onClick={close}>
        Schedule
      </NavLink>

      <NavLink className="aside-bar__link" href="/anime" onClick={close}>
        Anime
      </NavLink>

      <div className="aside-bar__category">
        <div
          className="aside-bar__link"
          onClick={(e) => {
            e.preventDefault();
            handleOpenCategory();
          }}
        >
          Category
        </div>

        <div
          className={`aside-bar__category-content ${isCategoryOpen ? "aside-bar__category-content--open" : ""
            }`}
          aria-label="Mobile Category"
        >
          {genres.map((item, idx) => (
            <NavLink
              key={item + idx}
              className="aside-bar__link"
              href={`/anime/category/${item}`}
              onClick={close}
            >
              {item}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}

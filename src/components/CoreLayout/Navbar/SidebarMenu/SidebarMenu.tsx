"use client";

import { useTranslation } from "react-i18next";
import { localizeGenreName } from "@/i18n/localize-genre";

import { genres } from "@/shared/data/genres";
import { DISCOVER_NAV_SECTIONS } from "@/shared/data/discover-nav";
import { NavLink } from "@/components/NavLink/NavLink";
import "./SidebarMenu.scss";
import { useEffect, useState, type RefObject } from "react";

type Props = {
  menuRef: RefObject<HTMLDivElement | null>;
  close: () => void;
};

export function SidebarMenu({ menuRef, close }: Props) {
  const { t } = useTranslation("common");
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
        {t("nav.schedule")}
      </NavLink>

      {DISCOVER_NAV_SECTIONS.map((item) => (
        <NavLink
          key={item.id}
          className="aside-bar__link"
          href={item.href}
          onClick={close}
        >
          {t(`nav.${item.id}`)}
        </NavLink>
      ))}

      <div className="aside-bar__category">
        <div
          className="aside-bar__link"
          onClick={(e) => {
            e.preventDefault();
            handleOpenCategory();
          }}
        >
          {t("nav.categories")}
        </div>

        <div
          className={`aside-bar__category-content ${isCategoryOpen ? "aside-bar__category-content--open" : ""
            }`}
          aria-label={t('nav.mobileCategory')}
        >
          {genres.map((item, idx) => (
            <NavLink
              key={item + idx}
              className="aside-bar__link"
              href={`/anime/category/${encodeURIComponent(item)}`}
              onClick={close}
            >
              {localizeGenreName(item, t)}
            </NavLink>
          ))}
        </div>
      </div>
    </aside>
  );
}

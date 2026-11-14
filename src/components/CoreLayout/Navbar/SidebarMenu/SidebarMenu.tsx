"use client";

import { useTranslation } from "react-i18next";
import { localizeGenreName } from "@/i18n/localize-genre";

import { genres } from "@/shared/data/genres";
import { DISCOVER_NAV_SECTIONS } from "@/shared/data/discover-nav";
import { NavLink } from "@/components/NavLink/NavLink";
import "./SidebarMenu.scss";
import { useEffect, useState, type RefObject } from "react";
import { createPortal } from "react-dom";

type Props = {
  menuRef: RefObject<HTMLElement | null>;
  close: () => void;
};

export function SidebarMenu({ menuRef, close }: Props) {
  const { t } = useTranslation("common");
  const [isCategoryOpen, setCategoryOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [mounted, setMounted] = useState(false);

  const handleOpenCategory = () => {
    setCategoryOpen((prev) => !prev);
  };

  useEffect(() => {
    setMounted(true);
    const frame = requestAnimationFrame(() => setIsVisible(true));
    return () => {
      cancelAnimationFrame(frame);
      setIsVisible(false);
    };
  }, []);

  if (!mounted) return null;

  return createPortal(
    <aside
      id="mobile-nav-menu"
      className={`aside-bar ${isVisible ? "aside-bar--enter" : "aside-bar--exit"}`}
      ref={menuRef}
      role="dialog"
      aria-modal="true"
      aria-label={t("nav.menu")}
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
        <button
          type="button"
          className="aside-bar__link aside-bar__category-toggle"
          aria-expanded={isCategoryOpen}
          onClick={handleOpenCategory}
        >
          {t("nav.categories")}
        </button>

        <div
          className={`aside-bar__category-content ${
            isCategoryOpen ? "aside-bar__category-content--open" : ""
          }`}
          aria-label={t("nav.mobileCategory")}
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
    </aside>,
    document.body,
  );
}

"use client";

import { useTranslation } from "react-i18next";
import { localizeGenreName } from "@/i18n/localize-genre";

import { genres } from "@/shared/data/genres";
import { NavLink } from "@/components/NavLink/NavLink";
import Image from "next/image";
import "./CategoryList.scss";
import { useDropdown } from "@/hooks/useDropdown";

function genreHref(genre: string) {
  return `/anime/category/${encodeURIComponent(genre)}`;
}

export const CategoryList = () => {
  const { t } = useTranslation("common");
  const { isOpen, toggle, close, triggerRef, menuRef } = useDropdown<
    HTMLButtonElement,
    HTMLDivElement
  >();

  return (
    <div className={`category ${isOpen ? "category--active" : ""}`}>
      <button
        ref={triggerRef}
        type="button"
        className="category__trigger"
        onClick={toggle}
        aria-expanded={isOpen}
        aria-haspopup="menu"
      >
        {t("nav.categories")}
        <Image
          src="/icon/down.png"
          alt=""
          width={14}
          height={14}
          sizes="14px"
          aria-hidden
        />
      </button>

      {isOpen ? (
        <div
          ref={menuRef}
          className={`category__popup ${
            isOpen ? "category__popup--active" : ""
          }`}
          role="presentation"
        >
          <nav className="category__mega" aria-label={t("nav.categoriesAria")}>
            <div className="category__mega-sidebar">
              <NavLink
                className="category__mega-primary-link"
                href="/schedule"
                onClick={close}
              >
                {t("nav.schedule")}
              </NavLink>
            </div>

            <div className="category__mega-divider" aria-hidden />

            <section className="category-genres">
              <p className="category-genres__title">{t("nav.genres")}</p>
              <ul className="category-genres__list">
                {genres.map((gen) => (
                  <li key={gen} className="category-genres__item">
                    <NavLink
                      className="category-genres__link"
                      href={genreHref(gen)}
                      onClick={close}
                    >
                      {localizeGenreName(gen, t)}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </section>
          </nav>
        </div>
      ) : null}
    </div>
  );
};

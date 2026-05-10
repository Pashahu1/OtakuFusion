"use client";

import { genres } from "@/shared/data/genres";
import { NavLink } from "@/components/NavLink/NavLink";
import Image from "next/image";
import "./CategoryList.scss";
import { useDropdown } from "@/hooks/useDropdown";

function genreHref(genre: string) {
  return `/anime/category/${encodeURIComponent(genre)}`;
}

export const CategoryList = () => {
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
        Categories
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
          <nav className="category__mega" aria-label="Anime categories">
            <div className="category__mega-sidebar">
              <NavLink
                className="category__mega-primary-link"
                href="/schedule"
                onClick={close}
              >
                Release Calendar
              </NavLink>
            </div>

            <div className="category__mega-divider" aria-hidden />

            <section className="category-genres">
              <p className="category-genres__title">Genres</p>
              <ul className="category-genres__list">
                {genres.map((gen) => (
                  <li key={gen} className="category-genres__item">
                    <NavLink
                      className="category-genres__link"
                      href={genreHref(gen)}
                      onClick={close}
                    >
                      {gen}
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

"use client";
import { genres } from "../../shared/data/genres";
import { NavLink } from "../NavLink/NavLink";
import Image from "next/image";
import "./CategoryList.scss";
import { useDropdown } from "@/hooks/useDropdown";

export const CategoryList = () => {
  const { isOpen, toggle, close, triggerRef, menuRef } = useDropdown<
    HTMLParagraphElement,
    HTMLDivElement
  >();

  return (
    <div className={`category ${isOpen ? "category--active" : ""}`}>
      <p ref={triggerRef} className="category__trigger" onClick={toggle}>
        Category
        <Image
          src="/icon/down.png"
          alt="Down arrow"
          width={14}
          height={14}
          sizes="cover"
        />
      </p>

      {isOpen && (
        <div
          ref={menuRef}
          className={`category__popup ${
            isOpen ? "category__popup--active" : ""
          }`}
        >
          <ul className="category__primary">
            <NavLink
              className="category__link"
              href="/schedule"
              onClick={close}
            >
              Schedule
            </NavLink>
          </ul>

          <section className="category-genres">
            <small className="category-genres__title">Genres</small>
            <ul className="category-genres__list">
              {genres.map((gen) => (
                <NavLink
                  key={gen}
                  className="category-genres__link"
                  href={`/anime/category/${gen}`}
                  onClick={close}
                >
                  {gen}
                </NavLink>
              ))}
            </ul>
          </section>
        </div>
      )}
    </div>
  );
};

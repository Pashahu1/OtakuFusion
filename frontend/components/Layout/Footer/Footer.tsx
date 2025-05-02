"use client";
import { AZFilter } from "../../AZFilter/AZFilter";
import "./Footer.scss";
export const Footer = () => {
  return (
    <footer className="footer">
      <h1 className="footer__title">A-Z Filter</h1>
      <AZFilter />
      <p className="footer__text">&copy; 2025 My Anime Website</p>
    </footer>
  );
};

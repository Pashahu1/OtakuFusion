"use client";
import Link from "next/link";
import "./Footer.scss";
import Image from "next/image";

export const Footer = () => {
  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__navigation">
          <h2>Navigation</h2>
          <div className="footer__information">
            <Link className="footer__link" href="/anime">
              Anime
            </Link>
            <Link className="footer__link" href="/schedule">
              Shedule
            </Link>
          </div>
        </div>
        <div className="footer__contacts">
          <h2>Contact Me</h2>
          <div className="footer__information">
            <Link className="footer__link" href="https://github.com/Pashahu1" target="_blank">
              <Image
                width={24}
                height={24}
                src="/icon/github.svg"
                alt="github-icon"
              />
              <span>Github</span>
            </Link>
            <Link className="footer__link" href="https://t.me/PashaChudin" target="_blank">
              <Image
                width={24}
                height={24}
                src="/icon/telegram.svg"
                alt="telegram-icon"
              />
              <span>Telegram</span>
            </Link>
            <Link
              className="footer__link"
              href="https://www.instagram.com/_chudin.pasha_/"
              target="_blank"
            >
              <Image
                width={24}
                height={24}
                src="/icon/instagram.svg"
                alt="instagram-icon"
              />
              <span>Instagram</span>
            </Link>
          </div>
        </div>
        <div className="footer__rulles">
          <h2>OtakuFushin</h2>
          <div className="footer__information">
            <Link className="footer__link" href="/about">
              About
            </Link>
            <Link className="footer__link" href="/privacy-policy">
              Privacy Policy
            </Link>
          </div>
        </div>
        <div className="footer__loggin">
          <h2>Account</h2>
          <div className="footer__information">
            <Link className="footer__link" href="/сreate-account">
              Create Account
            </Link>
            <Link className="footer__link" href="/Loggin">
              Log In
            </Link>
          </div>
        </div>
      </div>

      <p className="text-center">
        &copy; 2025 OtakuFushion All rights reserved.
      </p>
    </footer>
  );
};

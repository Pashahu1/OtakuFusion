'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

import { useTranslation } from 'react-i18next';

import { WEBSITE_NAME } from '@/config/website';
import { useAuth } from '@/context/AuthContext';
import { resolveReturnPath, withNextQuery } from '@/features/auth/lib/safe-next-path';
import './Footer.scss';

export function Footer() {
  const { t } = useTranslation('common');
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [logoutLoading, setLogoutLoading] = useState(false);
  const returnPath = resolveReturnPath(
    pathname,
    searchParams.toString() ? `?${searchParams.toString()}` : '',
  );

  async function handleLogout() {
    try {
      setLogoutLoading(true);
      await logout();
      router.push('/auth/login');
    } finally {
      setLogoutLoading(false);
    }
  }

  const isAuthRoute = pathname.startsWith('/auth');

  if (isAuthRoute) {
    return (
      <footer className="footer footer--auth">
        <nav className="footer__auth-nav" aria-label={t('footer.aria')}>
          <Link className="footer__link" href="/about">
            {t('footer.about')}
          </Link>
          <Link className="footer__link" href="/privacy-policy">
            {t('footer.privacy')}
          </Link>
          <Link className="footer__link" href="/discover/popular">
            {t('nav.popular')}
          </Link>
        </nav>
        <p className="footer__legal">
          &copy; 2026 {WEBSITE_NAME}. {t('footer.rights')}
        </p>
      </footer>
    );
  }

  return (
    <footer className="footer">
      <div className="footer__content">
        <div className="footer__navigation">
          <h2 className="footer__heading">{t('footer.navigation')}</h2>
          <div className="footer__information">
            <Link className="footer__link" href="/discover/popular">
              {t('nav.popular')}
            </Link>
            <Link className="footer__link" href="/discover/new">
              {t('nav.new')}
            </Link>
            <Link className="footer__link" href="/schedule">
              {t('nav.schedule')}
            </Link>
          </div>
        </div>
        <div className="footer__contacts">
          <h2 className="footer__heading">{t('footer.contact')}</h2>
          <div className="footer__information">
            <Link
              className="footer__link"
              href="https://github.com/Pashahu1"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image width={20} height={20} src="/icon/github.svg" alt="" />
              <span>GitHub</span>
            </Link>
            <Link
              className="footer__link"
              href="https://t.me/PashaChudin"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image width={20} height={20} src="/icon/telegram.svg" alt="" />
              <span>Telegram</span>
            </Link>
            <Link
              className="footer__link"
              href="https://www.instagram.com/_chudin.pasha_/"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Image width={20} height={20} src="/icon/instagram.svg" alt="" />
              <span>Instagram</span>
            </Link>
          </div>
        </div>
        <div className="footer__rules">
          <h2 className="footer__heading">{WEBSITE_NAME}</h2>
          <div className="footer__information">
            <Link className="footer__link" href="/about">
              {t('footer.about')}
            </Link>
            <Link className="footer__link" href="/privacy-policy">
              {t('footer.privacy')}
            </Link>
          </div>
        </div>
        <div className="footer__account">
          <h2 className="footer__heading">{t('footer.account')}</h2>
          <div className="footer__information">
            {user ? (
              <>
                <Link className="footer__link" href="/profile">
                  {t('footer.profile')}
                </Link>
                <Link className="footer__link" href="/profile/preferences">
                  {t('footer.settings')}
                </Link>
                <Link className="footer__link" href="/profile/favorites">
                  {t('footer.favorites')}
                </Link>
                <button
                  type="button"
                  className="footer__link"
                  disabled={logoutLoading}
                  onClick={() => void handleLogout()}
                >
                  {t('footer.logout')}
                </button>
              </>
            ) : (
              <>
                <Link
                  className="footer__link"
                  href={withNextQuery('/auth/register', returnPath)}
                >
                  {t('footer.createAccount')}
                </Link>
                <Link
                  className="footer__link"
                  href={withNextQuery('/auth/login', returnPath)}
                >
                  {t('footer.login')}
                </Link>
              </>
            )}
          </div>
        </div>
      </div>

      <p className="footer__legal">
        &copy; 2026 {WEBSITE_NAME}. {t('footer.rights')}
      </p>
    </footer>
  );
}

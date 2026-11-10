'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useTranslation } from 'react-i18next';

import { cn } from '@/lib/utils';

const NAV_ITEMS: { href: string; labelKey: string; exact?: boolean }[] = [
  { href: '/profile', labelKey: 'profile.overview', exact: true },
  { href: '/profile/favorites', labelKey: 'profile.favorites' },
  { href: '/profile/manage', labelKey: 'profile.edit' },
  { href: '/profile/preferences', labelKey: 'profile.settings' },
];

export function ProfileLayoutNav() {
  const pathname = usePathname();
  const { t } = useTranslation('common');

  return (
    <nav className="profile-nav" aria-label={t('profile.navAria')}>
      {NAV_ITEMS.map(({ href, labelKey, exact }) => {
        const isActive = exact
          ? pathname === href
          : pathname === href || pathname.startsWith(`${href}/`);
        return (
          <Link
            key={href}
            href={href}
            className={cn('profile-nav__link', isActive && 'profile-nav__link--active')}
            aria-current={isActive ? 'page' : undefined}
          >
            {t(labelKey)}
          </Link>
        );
      })}
    </nav>
  );
}

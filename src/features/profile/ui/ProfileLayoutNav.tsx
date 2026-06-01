'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

import { cn } from '@/lib/utils';

const NAV_ITEMS: { href: string; label: string; exact?: boolean }[] = [
  { href: '/profile', label: 'Overview', exact: true },
  { href: '/profile/favorites', label: 'Favorites' },
  { href: '/profile/manage', label: 'Edit profile' },
  { href: '/profile/preferences', label: 'Settings' },
];

export function ProfileLayoutNav() {
  const pathname = usePathname();

  return (
    <nav className="profile-nav" aria-label="Profile sections">
      {NAV_ITEMS.map(({ href, label, exact }) => {
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
            {label}
          </Link>
        );
      })}
    </nav>
  );
}

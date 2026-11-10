'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

import { isHeaderHeroOverlayPath } from './is-header-hero-overlay';
import { Navbar } from '../Navbar/Navbar';
import './Header.scss';

const SCROLL_GLASS_THRESHOLD_PX = 8;

export function Header() {
  const pathname = usePathname();
  const [isScrolled, setIsScrolled] = useState(false);
  const overlaysHero = isHeaderHeroOverlayPath(pathname) && !isScrolled;

  useEffect(() => {
    function syncScroll() {
      setIsScrolled(window.scrollY > SCROLL_GLASS_THRESHOLD_PX);
    }

    syncScroll();
    window.addEventListener('scroll', syncScroll, { passive: true });
    return () => window.removeEventListener('scroll', syncScroll);
  }, [pathname]);

  const className = [
    'header',
    overlaysHero ? 'header--over-hero' : '',
    isScrolled ? 'header--scrolled' : '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <header className={className}>
      <Navbar />
    </header>
  );
}

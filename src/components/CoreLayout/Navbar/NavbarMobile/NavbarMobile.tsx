'use client';
import { NavLink } from '@/components/NavLink/NavLink';
import Image from 'next/image';
import { useTranslation } from 'react-i18next';
import './NavbarMobile.scss';
import { SidebarMenu } from '../SidebarMenu/SidebarMenu';
import { useDropdown } from '@/hooks/useDropdown';

export function NavbarMobile() {
  const { t } = useTranslation('common');
  const { isOpen, triggerRef, toggle, menuRef, close } = useDropdown<
    HTMLButtonElement,
    HTMLElement
  >();

  return (
    <div className="navbar__mobile">
      <div className="navbar__mobile-content">
        {isOpen && <SidebarMenu menuRef={menuRef} close={close} />}
        <button
          type="button"
          className="burger-wrapper"
          ref={triggerRef}
          onClick={toggle}
          aria-expanded={isOpen}
          aria-controls="mobile-nav-menu"
          aria-label={isOpen ? t('nav.menuClose') : t('nav.menuOpen')}
        >
          {isOpen ? (
            <Image
              className="burger-menu"
              width={24}
              height={24}
              src="/icon/burgerMenuOpen.svg"
              alt=""
            />
          ) : (
            <Image
              className="burger-menu"
              width={24}
              height={24}
              src="/icon/burgerMenu.svg"
              alt=""
            />
          )}
        </button>
      </div>

      <NavLink href="/">
        <span className="text-[var(--color-brand-orange)]">Otaku</span>
        Fusion
      </NavLink>
    </div>
  );
}

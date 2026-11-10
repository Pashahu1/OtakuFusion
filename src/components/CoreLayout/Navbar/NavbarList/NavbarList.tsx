'use client';
import { NavLink } from '@/components/NavLink/NavLink';
import Image from 'next/image';
import { usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { resolveReturnPath, withNextQuery } from '@/features/auth/lib/safe-next-path';
import { UserMenu } from '@/components/UserMenu/user-menu';

export const NavbarList = () => {
  const { isAuth, user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const loginHref = withNextQuery(
    '/auth/login',
    resolveReturnPath(
      pathname,
      searchParams.toString() ? `?${searchParams.toString()}` : '',
    ),
  );
  return (
    <div className="flex items-center h-full">
      <NavLink className="p-0" href="/search">
        <Image
          width={24}
          height={24}
          src="/icon/search.svg"
          alt="search-icon"
        />
      </NavLink>
      {isAuth && user ? (
        <>
          <NavLink href="/profile/favorites">
            <Image width={24} height={24} src="/wishlist.png" alt="wishlist" />
          </NavLink>
          <UserMenu user={user} />
        </>
      ) : (
        <NavLink href={loginHref}>
          <Image width={24} height={24} src="/icon/user.svg" alt="user-icon" />
        </NavLink>
      )}
    </div>
  );
};

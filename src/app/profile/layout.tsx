'use client';

import { ProfileHero, ProfileLayoutNav } from '@/features/profile';
import { useAuth } from '@/context/AuthContext';
import '@/features/profile/profile.scss';

type LayoutProfileType = {
  children: React.ReactNode;
};

export default function LayoutProfile({ children }: LayoutProfileType) {
  const { user } = useAuth();

  return (
    <div className="profile-shell mx-auto mt-[80px] w-full px-4 py-8 sm:px-6 lg:px-10">
      {user ? (
        <>
          <ProfileHero
            username={user.username}
            email={user.email}
            avatar={user.avatar}
            isVerified={user.isVerified}
          />
          <ProfileLayoutNav />
        </>
      ) : null}
      {children}
    </div>
  );
}

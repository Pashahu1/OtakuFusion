'use client';

import { useTranslation } from 'react-i18next';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerifiedSealIcon } from '@/components/icons/verified-seal-icon';
import { cloudinaryAvatarUrl } from '@/shared/utils/cloudinary-avatar-url';

interface ProfileHeroProps {
  username: string;
  avatar?: string | null;
  isVerified?: boolean;
}

export function ProfileHero({
  username,
  avatar,
  isVerified,
}: ProfileHeroProps) {
  const { t } = useTranslation('common');
  const initial = username.trim().charAt(0).toUpperCase() || '?';

  return (
    <header className="profile-hero">
      <Avatar className="profile-hero__avatar">
        <AvatarImage
          src={cloudinaryAvatarUrl(avatar, 120)}
          alt=""
          className="h-full w-full object-cover"
        />
        <AvatarFallback className="text-2xl">{initial}</AvatarFallback>
      </Avatar>
      <div className="profile-hero__meta">
        <h1 className="profile-hero__name">
          {username}
          {isVerified ? (
            <VerifiedSealIcon
              className="h-5 w-5 shrink-0 text-zinc-100"
              title={t('profile.emailVerified')}
            />
          ) : null}
        </h1>
      </div>
    </header>
  );
}

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { VerifiedSealIcon } from '@/components/icons/verified-seal-icon';
import { cloudinaryAvatarUrl } from '@/shared/utils/cloudinary-avatar-url';

interface ProfileHeroProps {
  username: string;
  email: string;
  avatar?: string | null;
  isVerified?: boolean;
}

export function ProfileHero({
  username,
  email,
  avatar,
  isVerified,
}: ProfileHeroProps) {
  return (
    <header className="profile-hero">
      <div className="profile-hero__banner" aria-hidden />
      <div className="profile-hero__body">
        <Avatar className="profile-hero__avatar">
          <AvatarImage
            src={cloudinaryAvatarUrl(avatar, 120)}
            alt=""
            className="h-full w-full object-cover"
          />
          <AvatarFallback className="text-2xl">
            {email?.[0]?.toUpperCase() ?? '?'}
          </AvatarFallback>
        </Avatar>
        <div className="profile-hero__meta">
          <h1 className="profile-hero__name">
            {username}
            {isVerified ? (
              <VerifiedSealIcon
                className="h-5 w-5 shrink-0 text-zinc-100"
                title="Email verified"
              />
            ) : null}
          </h1>
          <p className="profile-hero__email">{email}</p>
        </div>
      </div>
    </header>
  );
}

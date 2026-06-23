import { Camera } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import {
  isPresetAvatarSrc,
  presetLabelFromSrc,
} from '@/shared/constants/preset-avatars';
import { cloudinaryAvatarUrl } from '@/shared/utils/cloudinary-avatar-url';

import { ProfileEditPresetAvatars } from './ProfileEditPresetAvatars';

interface ProfileEditIdentitySectionProps {
  fileInputId: string;
  username: string;
  usernameError: string | null;
  preview: string | null;
  selectedPresetSrc: string | null;
  avatarUrl: string;
  emailInitial: string;
  isLoading: boolean;
  onAvatarChange: (file: File | undefined) => void;
  onPresetSelect: (src: string) => void;
  onUsernameChange: (value: string) => void;
}

export function ProfileEditIdentitySection({
  fileInputId,
  username,
  usernameError,
  preview,
  selectedPresetSrc,
  avatarUrl,
  emailInitial,
  isLoading,
  onAvatarChange,
  onPresetSelect,
  onUsernameChange,
}: ProfileEditIdentitySectionProps) {
  const displayAvatarSrc =
    preview || cloudinaryAvatarUrl(avatarUrl, 160) || avatarUrl;
  const activeSrc = selectedPresetSrc ?? avatarUrl;
  const presetLabel = isPresetAvatarSrc(activeSrc)
    ? presetLabelFromSrc(activeSrc)
    : null;
  const isCustomPhoto =
    !presetLabel &&
    Boolean(displayAvatarSrc) &&
    (preview?.startsWith('blob:') === true ||
      activeSrc.includes('cloudinary.com'));

  return (
    <section className="profile-edit__card profile-panel">
      <h3 className="profile-edit__card-title">Public identity</h3>

      <div className="profile-edit__avatar-block">
        <div className="profile-edit__avatar-preview">
          <Avatar
            className={cn(
              'profile-edit__avatar',
              (selectedPresetSrc || isPresetAvatarSrc(avatarUrl)) &&
                'profile-edit__avatar--preset',
            )}
          >
            <AvatarImage
              src={displayAvatarSrc}
              alt=""
              className="h-full w-full object-cover"
            />
            <AvatarFallback className="text-3xl">{emailInitial}</AvatarFallback>
          </Avatar>
          {presetLabel ? (
            <p className="profile-edit__avatar-name">{presetLabel}</p>
          ) : isCustomPhoto ? (
            <p className="profile-edit__avatar-name">Custom photo</p>
          ) : null}
        </div>

        <ProfileEditPresetAvatars
          selectedSrc={selectedPresetSrc}
          currentAvatarSrc={avatarUrl}
          disabled={isLoading}
          onSelect={onPresetSelect}
        />

        <div className="profile-edit__upload-row">
          <p className="profile-edit__upload-label">Or upload your own</p>
          {!isLoading ? (
            <>
              <label htmlFor={fileInputId} className="profile-edit__avatar-btn">
                <Camera aria-hidden size={16} />
                Upload photo
              </label>
              <input
                id={fileInputId}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                className="sr-only"
                onChange={(e) => {
                  onAvatarChange(e.target.files?.[0]);
                  e.target.value = '';
                }}
              />
            </>
          ) : null}
          <p className="profile-edit__avatar-hint">JPG, PNG, WebP or GIF · up to 10 MB</p>
        </div>
      </div>

      <label className="profile-edit__field">
        <span className="profile-edit__label">Display name</span>
        <input
          className={cn(
            'profile-edit__input',
            usernameError && 'profile-edit__input--error',
          )}
          value={username}
          onChange={(e) => onUsernameChange(e.target.value)}
          autoComplete="username"
          maxLength={24}
          disabled={isLoading}
        />
        <span className="profile-edit__field-hint">
          Shown on your profile, comments, and watch activity.
        </span>
        {usernameError ? (
          <span className="profile-edit__field-error">{usernameError}</span>
        ) : null}
      </label>
    </section>
  );
}

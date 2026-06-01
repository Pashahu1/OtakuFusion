import { Camera } from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { cloudinaryAvatarUrl } from '@/shared/utils/cloudinary-avatar-url';

interface ProfileEditIdentitySectionProps {
  fileInputId: string;
  username: string;
  usernameError: string | null;
  preview: string | null;
  avatarUrl: string;
  emailInitial: string;
  isLoading: boolean;
  onAvatarChange: (file: File | undefined) => void;
  onUsernameChange: (value: string) => void;
}

export function ProfileEditIdentitySection({
  fileInputId,
  username,
  usernameError,
  preview,
  avatarUrl,
  emailInitial,
  isLoading,
  onAvatarChange,
  onUsernameChange,
}: ProfileEditIdentitySectionProps) {
  return (
    <section className="profile-edit__card profile-panel">
      <h3 className="profile-edit__card-title">Public identity</h3>

      <div className="profile-edit__avatar-block">
        <div className="profile-edit__avatar-wrap">
          <Avatar className="profile-edit__avatar">
            <AvatarImage
              src={preview || cloudinaryAvatarUrl(avatarUrl, 160)}
              alt=""
              className="h-full w-full object-cover"
            />
            <AvatarFallback className="text-3xl">{emailInitial}</AvatarFallback>
          </Avatar>
          {!isLoading ? (
            <>
              <label htmlFor={fileInputId} className="profile-edit__avatar-btn">
                <Camera aria-hidden size={16} />
                Change photo
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
        </div>
        <p className="profile-edit__avatar-hint">JPG, PNG, WebP or GIF · up to 10 MB</p>
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

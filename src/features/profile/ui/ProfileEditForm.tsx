'use client';

import { useRouter } from 'next/navigation';

import { ProfileEditAccountSection } from './profile-edit/ProfileEditAccountSection';
import { ProfileEditFormActions } from './profile-edit/ProfileEditFormActions';
import { ProfileEditIdentitySection } from './profile-edit/ProfileEditIdentitySection';
import { ProfileEditVerifyBanner } from './profile-edit/ProfileEditVerifyBanner';
import { useProfileEditForm } from './profile-edit/useProfileEditForm';
import '../profile-edit.scss';

export function ProfileEditForm() {
  const router = useRouter();
  const {
    user,
    fileInputId,
    username,
    preview,
    isLoading,
    usernameError,
    hasChanges,
    saveDisabled,
    handleAvatarChange,
    handleUsernameChange,
    handleDiscard,
    handleSave,
  } = useProfileEditForm();

  if (!user) return null;

  return (
    <div className="profile-edit">
      <div className="profile-edit__intro">
        <h2 className="profile-edit__title">Edit profile</h2>
        <p className="profile-edit__subtitle">
          Update how you appear across OtakuFusion — avatar and display name.
        </p>
      </div>

      {!user.isVerified ? (
        <ProfileEditVerifyBanner
          onVerify={() =>
            router.push(
              `/auth/verification/verify-email?email=${encodeURIComponent(user.email)}`,
            )
          }
        />
      ) : null}

      <form className="profile-edit__form" onSubmit={handleSave} aria-busy={isLoading}>
        <div className="profile-edit__grid">
          <ProfileEditIdentitySection
            fileInputId={fileInputId}
            username={username}
            usernameError={usernameError}
            preview={preview}
            avatarUrl={user.avatar}
            emailInitial={user.email?.[0]?.toUpperCase() ?? '?'}
            isLoading={isLoading}
            onAvatarChange={handleAvatarChange}
            onUsernameChange={handleUsernameChange}
          />

          <ProfileEditAccountSection
            email={user.email}
            isVerified={user.isVerified}
            role={user.role}
          />
        </div>

        <ProfileEditFormActions
          hasChanges={hasChanges}
          isLoading={isLoading}
          saveDisabled={saveDisabled}
          onDiscard={handleDiscard}
        />
      </form>
    </div>
  );
}

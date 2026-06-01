'use client';

import Link from 'next/link';
import { useEffect, useId, useState } from 'react';
import { Camera, KeyRound, LayoutGrid, ShieldCheck, Star } from 'lucide-react';

import { VerifiedSealIcon } from '@/components/icons/verified-seal-icon';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';
import { cloudinaryAvatarUrl } from '@/shared/utils/cloudinary-avatar-url';

import '../profile-edit.scss';

const API_ERROR_FALLBACK = 'Something went wrong.';
const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,24}$/;

async function messageFromResponse(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
    ) {
      return (data as { message: string }).message;
    }
  } catch {
    return API_ERROR_FALLBACK;
  }
  return API_ERROR_FALLBACK;
}

function validateUsername(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Username is required.';
  if (!USERNAME_PATTERN.test(trimmed)) {
    return 'Use 3–24 characters: letters, numbers, underscores.';
  }
  return null;
}

export function ProfileEditForm() {
  const {
    user,
    refreshUser,
    setProfileSavePending,
    setProfileNavbarAvatarHold,
    openVerifyEmailModal,
  } = useAuth();
  const fileInputId = useId();

  const [username, setUsername] = useState(user?.username ?? '');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameError, setUsernameError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.username) setUsername(user.username);
  }, [user?.username]);

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  if (!user) return null;

  const profileUser = user;
  const trimmedUsername = username.trim();
  const hasChanges =
    trimmedUsername !== profileUser.username || Boolean(avatarFile);
  const saveDisabled = isLoading || !hasChanges || Boolean(usernameError);

  function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleDiscard() {
    setUsername(profileUser.username);
    setAvatarFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setUsernameError(null);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    const validationError = validateUsername(trimmedUsername);
    if (validationError) {
      setUsernameError(validationError);
      return;
    }

    setIsLoading(true);
    setProfileSavePending(true);
    setProfileNavbarAvatarHold(false);
    let keepNavbarHoldAfterAvatarSuccess = false;

    try {
      if (trimmedUsername !== profileUser.username) {
        const usernameRes = await fetch('/api/user/update', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ username: trimmedUsername }),
        });

        if (!usernameRes.ok) {
          toast.error(await messageFromResponse(usernameRes));
          return;
        }
      }

      if (avatarFile) {
        const formData = new FormData();
        formData.append('avatar', avatarFile);
        const avatarRes = await fetch('/api/user/avatar', {
          method: 'POST',
          credentials: 'include',
          body: formData,
        });

        if (!avatarRes.ok) {
          toast.error(await messageFromResponse(avatarRes));
          return;
        }

        setProfileNavbarAvatarHold(true);
        keepNavbarHoldAfterAvatarSuccess = true;
      }

      await refreshUser();
      setAvatarFile(null);
      setPreview(null);
      toast.success(
        avatarFile ? 'Profile photo updated.' : 'Profile saved.',
      );
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Could not save profile.';
      toast.error(message);
    } finally {
      setIsLoading(false);
      if (!keepNavbarHoldAfterAvatarSuccess) {
        setProfileNavbarAvatarHold(false);
      }
      setProfileSavePending(false);
    }
  }

  return (
    <div className="profile-edit">
      <div className="profile-edit__intro">
        <h2 className="profile-edit__title">Edit profile</h2>
        <p className="profile-edit__subtitle">
          Update how you appear across OtakuFusion — avatar and display name.
        </p>
      </div>

      {!profileUser.isVerified ? (
        <div className="profile-edit__verify" role="status">
          <p>
            Confirm your email to unlock the full profile experience and keep
            your account secure.
          </p>
          <button
            type="button"
            className="profile-edit__verify-btn"
            onClick={() => openVerifyEmailModal(profileUser.email)}
          >
            Verify email
          </button>
        </div>
      ) : null}

      <form
        className="profile-edit__form"
        onSubmit={handleSave}
        aria-busy={isLoading}
      >
        <div className="profile-edit__grid">
          <section className="profile-edit__card profile-panel">
            <h3 className="profile-edit__card-title">Public identity</h3>

            <div className="profile-edit__avatar-block">
              <div className="profile-edit__avatar-wrap">
                <Avatar className="profile-edit__avatar">
                  <AvatarImage
                    src={preview || cloudinaryAvatarUrl(profileUser.avatar, 160)}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                  <AvatarFallback className="text-3xl">
                    {profileUser.email?.[0]?.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {!isLoading ? (
                  <>
                    <label
                      htmlFor={fileInputId}
                      className="profile-edit__avatar-btn"
                    >
                      <Camera aria-hidden size={16} />
                      Change photo
                    </label>
                    <input
                      id={fileInputId}
                      type="file"
                      accept="image/jpeg,image/png,image/webp,image/gif"
                      className="sr-only"
                      onChange={(e) => {
                        handleAvatarChange(e.target.files?.[0]);
                        e.target.value = '';
                      }}
                    />
                  </>
                ) : null}
              </div>
              <p className="profile-edit__avatar-hint">
                JPG, PNG, WebP or GIF · up to 10 MB
              </p>
            </div>

            <label className="profile-edit__field">
              <span className="profile-edit__label">Display name</span>
              <input
                className={cn(
                  'profile-edit__input',
                  usernameError && 'profile-edit__input--error',
                )}
                value={username}
                onChange={(e) => {
                  const next = e.target.value;
                  setUsername(next);
                  setUsernameError(validateUsername(next.trim()));
                }}
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

          <section className="profile-edit__card profile-panel">
            <h3 className="profile-edit__card-title">Account</h3>

            <div className="profile-edit__account-row">
              <span className="profile-edit__label">Email</span>
              <div className="profile-edit__email-value">
                <span>{profileUser.email}</span>
                {profileUser.isVerified ? (
                  <VerifiedSealIcon
                    className="h-4 w-4 shrink-0 text-zinc-100"
                    title="Email verified"
                  />
                ) : (
                  <span className="profile-edit__badge profile-edit__badge--warn">
                    Unverified
                  </span>
                )}
              </div>
            </div>

            <div className="profile-edit__account-row">
              <span className="profile-edit__label">Account type</span>
              <span
                className={cn(
                  'profile-edit__badge',
                  profileUser.role === 'admin' && 'profile-edit__badge--admin',
                )}
              >
                {profileUser.role === 'admin' ? (
                  <>
                    <ShieldCheck aria-hidden size={14} />
                    Admin
                  </>
                ) : (
                  'Member'
                )}
              </span>
            </div>

            <div className="profile-edit__shortcuts">
              <span className="profile-edit__label">Shortcuts</span>
              <div className="profile-edit__shortcut-grid">
                <Link href="/profile" className="profile-edit__shortcut">
                  <LayoutGrid aria-hidden size={18} />
                  <span>Overview</span>
                </Link>
                <Link href="/profile/favorites" className="profile-edit__shortcut">
                  <Star aria-hidden size={18} />
                  <span>Favorites</span>
                </Link>
                <Link
                  href="/profile/preferences"
                  className="profile-edit__shortcut"
                >
                  <KeyRound aria-hidden size={18} />
                  <span>Password</span>
                </Link>
              </div>
            </div>
          </section>
        </div>

        <div
          className={cn(
            'profile-edit__actions',
            hasChanges && 'profile-edit__actions--visible',
          )}
        >
          <button
            type="button"
            className="profile-edit__btn profile-edit__btn--ghost"
            onClick={handleDiscard}
            disabled={isLoading || !hasChanges}
          >
            Discard
          </button>
          <button
            type="submit"
            className="profile-edit__btn profile-edit__btn--primary"
            disabled={saveDisabled}
          >
            {isLoading ? 'Saving…' : 'Save changes'}
          </button>
        </div>
      </form>
    </div>
  );
}

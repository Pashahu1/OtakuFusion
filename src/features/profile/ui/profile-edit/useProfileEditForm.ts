'use client';

import { useEffect, useId, useState } from 'react';

import { useAuth } from '@/context/AuthContext';
import { toast } from '@/lib/toast';

import { messageFromResponse, validateUsername } from './profileEditValidation';

export function useProfileEditForm() {
  const {
    user,
    refreshUser,
    setProfileSavePending,
    setProfileNavbarAvatarHold,
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

  const trimmedUsername = username.trim();
  const hasChanges =
    user !== null &&
    (trimmedUsername !== user.username || Boolean(avatarFile));
  const saveDisabled = isLoading || !hasChanges || Boolean(usernameError);

  function handleAvatarChange(file: File | undefined) {
    if (!file) return;
    setAvatarFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function handleUsernameChange(next: string) {
    setUsername(next);
    setUsernameError(validateUsername(next.trim()));
  }

  function handleDiscard() {
    if (!user) return;
    setUsername(user.username);
    setAvatarFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    setUsernameError(null);
  }

  async function handleSave(event: React.FormEvent) {
    event.preventDefault();
    if (!user) return;

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
      if (trimmedUsername !== user.username) {
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
      toast.success(avatarFile ? 'Profile photo updated.' : 'Profile saved.');
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

  return {
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
  };
}

'use client';

import { useEffect } from 'react';

import { cloudinaryAvatarUrl } from '@/shared/utils/cloudinary-avatar-url';

export function useNavAvatarHold(
  avatar: string | null | undefined,
  hold: boolean,
  setHold: (next: boolean) => void,
): void {
  useEffect(() => {
    if (!hold || !avatar) return;
    let cancelled = false;
    const src = cloudinaryAvatarUrl(avatar, 36);
    const img = new window.Image();
    const maxWait = window.setTimeout(() => {
      if (!cancelled) setHold(false);
    }, 8000);
    img.onload = () => {
      if (!cancelled) setHold(false);
    };
    img.onerror = () => {
      if (!cancelled) setHold(false);
    };
    img.src = src;
    if (img.complete && img.naturalWidth > 0) {
      if (!cancelled) setHold(false);
      window.clearTimeout(maxWait);
    }
    return () => {
      cancelled = true;
      window.clearTimeout(maxWait);
    };
  }, [hold, avatar, setHold]);
}

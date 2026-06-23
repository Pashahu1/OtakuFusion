'use client';

import { Share2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { watchPlayPath, watchSeriesPath } from '@/shared/utils/watch-routes';
import './WatchPlayShareButton.scss';

interface WatchPlayShareButtonProps {
  shareTitle: string;
  animeId: string;
  episodeId: string | null;
}

export function WatchPlayShareButton({
  shareTitle,
  animeId,
  episodeId,
}: WatchPlayShareButtonProps) {
  async function handleShare() {
    const path = episodeId
      ? watchPlayPath(animeId, episodeId)
      : watchSeriesPath(animeId);
    const shareUrl =
      typeof window !== 'undefined'
        ? `${window.location.origin}${path}`
        : path;

    try {
      if (typeof navigator !== 'undefined' && navigator.share) {
        await navigator.share({
          title: shareTitle,
          url: shareUrl,
        });
        return;
      }

      await navigator.clipboard.writeText(shareUrl);
      toast.success('Link copied to clipboard.');
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error('Could not share this link.');
    }
  }

  return (
    <button
      type="button"
      className="watch-play-share"
      aria-label="Share episode link"
      onClick={() => void handleShare()}
    >
      <Share2 className="watch-play-share__icon" aria-hidden size={18} />
    </button>
  );
}

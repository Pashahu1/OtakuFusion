'use client';

import { Share2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation('common');

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
      toast.success(t('watch.shareCopied'));
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') return;
      toast.error(t('watch.shareFailed'));
    }
  }

  return (
    <button
      type="button"
      className="watch-play-share"
      aria-label={t('watch.share')}
      onClick={() => void handleShare()}
    >
      <Share2 className="watch-play-share__icon" aria-hidden size={18} />
    </button>
  );
}

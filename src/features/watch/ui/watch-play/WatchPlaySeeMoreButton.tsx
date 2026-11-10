'use client';

import { ListVideo } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import './WatchPlaySeeMoreButton.scss';

interface WatchPlaySeeMoreButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function WatchPlaySeeMoreButton({ onClick, disabled }: WatchPlaySeeMoreButtonProps) {
  const { t } = useTranslation('common');

  return (
    <button
      type="button"
      className="watch-play-see-more"
      onClick={onClick}
      disabled={disabled}
      aria-haspopup="dialog"
    >
      <ListVideo className="watch-play-see-more__icon" aria-hidden />
      <span>{t('watch.seeMoreEpisodes')}</span>
    </button>
  );
}

'use client';

import { ListVideo } from 'lucide-react';
import './WatchPlaySeeMoreButton.scss';

interface WatchPlaySeeMoreButtonProps {
  onClick: () => void;
  disabled?: boolean;
}

export function WatchPlaySeeMoreButton({ onClick, disabled }: WatchPlaySeeMoreButtonProps) {
  return (
    <button
      type="button"
      className="watch-play-see-more"
      onClick={onClick}
      disabled={disabled}
      aria-haspopup="dialog"
    >
      <ListVideo className="watch-play-see-more__icon" aria-hidden />
      <span>See more episodes</span>
    </button>
  );
}

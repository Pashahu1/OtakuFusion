'use client';

import {
  StreamOriginPreconnect,
  WatchPlayProvider,
  WatchPlayShell,
  useWatchPlay,
} from '@/features/watch';
import { useTheaterMode } from '@/features/watch/hooks/useTheaterMode';
import './watch-play-page.scss';

function WatchPlayPageContent() {
  const { watch } = useWatchPlay();

  return (
    <>
      <StreamOriginPreconnect streamUrl={watch.streamUrl} streamInfo={watch.streamInfo} />
      <WatchPlayShell />
    </>
  );
}

export default function WatchPlayPageClient({animeId}: {animeId: string}) {
  useTheaterMode();
  return (
    <div className="watch-play-page">
      <WatchPlayProvider animeId={animeId}>
        <WatchPlayPageContent />
      </WatchPlayProvider>
    </div>
  );
}
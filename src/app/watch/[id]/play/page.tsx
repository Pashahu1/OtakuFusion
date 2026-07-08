'use client';

import {
  StreamOriginPreconnect,
  WatchPlayProvider,
  WatchPlayShell,
  useWatchPlay,
} from '@/features/watch';
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

export default function WatchPlayPage() {
  return (
    <div className="watch-play-page">
      <WatchPlayProvider>
        <WatchPlayPageContent />
      </WatchPlayProvider>
    </div>
  );
}

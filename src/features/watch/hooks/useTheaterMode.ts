import { useEffect } from 'react';

const THEATER_CLASS = 'theater-mode';

/** Locks the document to a full-viewport player: no site chrome, no page scroll. */
export function useTheaterMode(): void {
  useEffect(() => {
    const root = document.documentElement;
    root.classList.add(THEATER_CLASS);
    return () => {
      root.classList.remove(THEATER_CLASS);
    };
  }, []);
}

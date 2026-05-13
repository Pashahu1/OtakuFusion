import { useEffect } from 'react';

export function useStreamErrorBlockDelay(
  errorBlockTimerRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
  setShowErrorBlock: (item: boolean) => void,
  buffering: boolean,
  streamUrl: string | null,
  playerShellPending: boolean
) {
  const isErrorState =
    !playerShellPending && !buffering && !streamUrl;
  useEffect(() => {
    if (isErrorState) {
      errorBlockTimerRef.current = setTimeout(
        () => setShowErrorBlock(true),
        900
      );
    } else {
      if (errorBlockTimerRef.current) {
        clearTimeout(errorBlockTimerRef.current);
        errorBlockTimerRef.current = null;
      }
      setShowErrorBlock(false);
    }
    return () => {
      if (errorBlockTimerRef.current) {
        clearTimeout(errorBlockTimerRef.current);
        errorBlockTimerRef.current = null;
      }
    };
  }, [errorBlockTimerRef, isErrorState, setShowErrorBlock]);
}

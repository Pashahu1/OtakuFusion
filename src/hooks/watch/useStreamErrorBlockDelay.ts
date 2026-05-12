import { useEffect } from 'react';

export function useStreamErrorBlockDelay(
  errorBlockTimerRef: React.RefObject<ReturnType<typeof setTimeout> | null>,
  setShowErrorBlock: (item: boolean) => void,
  serverLoading: boolean,
  buffering: boolean,
  streamUrl: string | null,
  playerShellPending: boolean
) {
  const isErrorState =
    !playerShellPending &&
    !serverLoading &&
    !buffering &&
    !streamUrl;
  useEffect(() => {
    if (isErrorState) {
      errorBlockTimerRef.current = setTimeout(
        () => setShowErrorBlock(true),
        400
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

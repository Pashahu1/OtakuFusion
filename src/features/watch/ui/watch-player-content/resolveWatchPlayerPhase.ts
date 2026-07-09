export type WatchPlayerPhase = 'loading' | 'playing' | 'error' | 'idle';

export interface ResolveWatchPlayerPhaseInput {
  playerShellPending: boolean;
  buffering: boolean;
  streamUrl: string | null;
  showErrorBlock: boolean;
  hasBuiltinError: boolean;
  streamOverlayMessage: { title: string; subtitle: string } | null;
}

interface WatchPlayerVisibility {
  showLoader: boolean;
  showBuiltinPlayer: boolean;
  showErrorOverlay: boolean;
}

/** Mirrors the pre-FSM booleans in WatchPlayerContent — single source of truth. */
export function resolveWatchPlayerVisibility(
  input: ResolveWatchPlayerPhaseInput,
): WatchPlayerVisibility {
  const isStreamMissing =
    !input.playerShellPending && !input.buffering && !input.streamUrl;

  const allowFatalErrorUi =
    isStreamMissing &&
    (input.showErrorBlock || input.hasBuiltinError || input.streamOverlayMessage != null);

  return {
    showBuiltinPlayer:
      !input.hasBuiltinError && !isStreamMissing && Boolean(input.streamUrl),
    showLoader:
      !input.hasBuiltinError &&
      (input.playerShellPending || input.buffering || !input.streamUrl) &&
      !allowFatalErrorUi,
    showErrorOverlay:
      isStreamMissing &&
      (input.showErrorBlock || input.hasBuiltinError || input.streamOverlayMessage != null),
  };
}

export function resolveWatchPlayerPhase(
  input: ResolveWatchPlayerPhaseInput,
): WatchPlayerPhase {
  const { showErrorOverlay, showBuiltinPlayer, showLoader } =
    resolveWatchPlayerVisibility(input);

  if (showErrorOverlay) return 'error';
  if (showBuiltinPlayer) return 'playing';
  if (showLoader) return 'loading';
  return 'idle';
}

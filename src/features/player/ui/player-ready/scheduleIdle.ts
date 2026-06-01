export function scheduleIdle(fn: () => void): void {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    window.requestIdleCallback(() => fn(), { timeout: 2200 });
  } else {
    setTimeout(fn, 1);
  }
}

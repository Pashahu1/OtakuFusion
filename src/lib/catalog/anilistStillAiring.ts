export function isAnilistStillAiringFromStatus(
  status: string | null | undefined
): boolean {
  const s = (status ?? '').trim().toLowerCase();
  if (!s) return false;
  if (s.includes('not yet aired') || s.includes('not-yet-aired')) return false;
  if (s.includes('cancel')) return false;
  return (
    s.includes('currently airing') ||
    s.includes('releasing') ||
    s.includes('ongoing') ||
    s === 'airing'
  );
}

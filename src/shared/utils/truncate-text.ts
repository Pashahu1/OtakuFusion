const DEFAULT_MAX_LENGTH = 300;
const ELLIPSIS = '…';

export function truncateText(
  text: string,
  maxLength: number = DEFAULT_MAX_LENGTH
): string {
  if (!text || text.length <= maxLength) return text;
  const trimmed = text.slice(0, maxLength).trim();
  return trimmed.endsWith('.') || trimmed.endsWith(',')
    ? trimmed + ELLIPSIS
    : trimmed + ' ' + ELLIPSIS;
}

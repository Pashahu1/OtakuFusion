import { readApiMessage } from '@/lib/read-api-message';

export const API_ERROR_FALLBACK = 'Something went wrong.';
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,24}$/;

export function messageFromResponse(res: Response): Promise<string> {
  return readApiMessage(res, API_ERROR_FALLBACK);
}

export function validateUsername(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Username is required.';
  if (!USERNAME_PATTERN.test(trimmed)) {
    return 'Use 3–24 characters: letters, numbers, underscores.';
  }
  return null;
}

export const API_ERROR_FALLBACK = 'Something went wrong.';
export const USERNAME_PATTERN = /^[a-zA-Z0-9_]{3,24}$/;

export async function messageFromResponse(res: Response): Promise<string> {
  try {
    const data: unknown = await res.json();
    if (
      data &&
      typeof data === 'object' &&
      'message' in data &&
      typeof (data as { message: unknown }).message === 'string'
    ) {
      return (data as { message: string }).message;
    }
  } catch {
    return API_ERROR_FALLBACK;
  }
  return API_ERROR_FALLBACK;
}

export function validateUsername(value: string): string | null {
  const trimmed = value.trim();
  if (!trimmed) return 'Username is required.';
  if (!USERNAME_PATTERN.test(trimmed)) {
    return 'Use 3–24 characters: letters, numbers, underscores.';
  }
  return null;
}

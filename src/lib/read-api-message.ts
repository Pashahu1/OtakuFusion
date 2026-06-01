export async function readApiMessage(res: Response, fallback: string): Promise<string> {
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
    return fallback;
  }
  return fallback;
}

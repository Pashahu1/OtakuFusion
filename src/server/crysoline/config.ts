export function getCrysolineApiBaseUrl(): string {
  const raw = process.env.CRYSOLINE_API_BASE_URL?.trim();
  if (raw) return raw.replace(/\/+$/, '');
  return 'https://api.crysoline.moe';
}

export function getCrysolineApiKey(): string {
  const key = process.env.CRYSOLINE_API_KEY?.trim();
  if (!key) {
    throw new Error('CRYSOLINE_API_KEY is not configured');
  }
  return key;
}

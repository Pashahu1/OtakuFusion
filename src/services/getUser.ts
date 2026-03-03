export interface GetUserResult {
  user: unknown;
}

export default async function getUser(): Promise<unknown> {
  const res = await fetch('/api/auth/me', { cache: 'no-store' });
  const data = (await res.json()) as GetUserResult;
  return data.user;
}

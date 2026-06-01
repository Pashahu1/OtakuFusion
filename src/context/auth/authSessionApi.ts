import { fetchWithRefresh } from '@/lib/fetchWithRefresh';

import type { AuthUser, LoginResult } from './authTypes';

export async function fetchAuthMe(): Promise<AuthUser | null> {
  const res = await fetchWithRefresh('/api/auth/me', { credentials: 'include' });
  const data = (await res.json()) as { user?: AuthUser | null };
  if (!res.ok) return null;
  return data.user ?? null;
}

export async function loginWithCredentials(
  email: string,
  password: string,
): Promise<LoginResult & { user?: AuthUser }> {
  try {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) {
      return { ok: false, message: data.message || 'Login failed' };
    }
    if (data.user) {
      return { ok: true, user: data.user as AuthUser };
    }
    return { ok: false, message: 'User not found after login' };
  } catch {
    return { ok: false, message: 'Something went wrong' };
  }
}

export async function logoutSession(): Promise<void> {
  await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
}

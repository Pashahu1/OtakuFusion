export async function fetchWithRefresh(url: string, options: RequestInit = {}) {
  let res = await fetch(url, {
    ...options,
    credentials: 'include',
  });

  if (res.status === 401) {
    const refresh = await fetch('/api/auth/refresh', {
      method: 'POST',
      credentials: 'include',
    });

    if (!refresh.ok) {
      return res;
    }

    res = await fetch(url, {
      ...options,
      credentials: 'include',
    });
  }

  return res;
}

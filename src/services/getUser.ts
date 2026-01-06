export default async function getUser() {
  const res = await fetch('@/api/auth/me', { cache: 'no-store' });
  const data = await res.json();
  return data.user;
}

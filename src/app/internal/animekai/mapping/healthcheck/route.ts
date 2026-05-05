import { proxyAnimekaiProtected } from '@/app/internal/animekai/_lib/proxy';

export async function POST(req: Request) {
  let body: unknown = {};
  try {
    body = await req.json();
  } catch {
    body = {};
  }
  return proxyAnimekaiProtected('/api/mapping/healthcheck', body);
}

/**
 * Cloudflare Worker relay for api.hikka-features.pp.ua (blocks Vercel/datacenter IPs).
 *
 * Deploy: npx wrangler deploy (from this folder)
 * Vercel env: HIKKA_FEATURES_RELAY_BASE=https://<your-worker>.workers.dev
 */
const hikkaFeaturesRelayWorker = {
  async fetch(request) {
    const url = new URL(request.url);
    const upstreamPath = url.pathname === '/' ? '' : url.pathname;
    const target = `https://api.hikka-features.pp.ua${upstreamPath}${url.search}`;

    const res = await fetch(target, {
      headers: {
        Accept: 'application/json',
        'User-Agent':
          request.headers.get('User-Agent') ||
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/131.0.0.0',
        Referer: 'https://hikka.io/',
      },
    });

    return new Response(res.body, {
      status: res.status,
      headers: {
        'Content-Type': res.headers.get('Content-Type') || 'application/json',
        'Cache-Control': 'public, max-age=300',
      },
    });
  },
};

export default hikkaFeaturesRelayWorker;

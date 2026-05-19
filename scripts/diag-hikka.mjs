const relay = process.env.HIKKA_FEATURES_RELAY_BASE ||
  'https://otakufusion-hikka-features-relay.maks-chudin567.workers.dev';
const slug = 'nippon-sangoku-282b30';

async function main() {
  const watchUrl = `${relay.replace(/\/+$/, '')}/watch/v2/${slug}`;
  const w = await fetch(watchUrl, {
    headers: { Accept: 'application/json', Referer: 'https://hikka.io/' },
  });
  console.log('relay watch', w.status);
  if (!w.ok) {
    console.log(await w.text());
    return;
  }
  const watch = await w.json();
  const moon = watch.moon;
  const team = 'FanVoxUA';
  const ep1 = moon?.teams?.[team]?.episodes?.find((e) => e.episode === 1);
  const pageUrl = ep1?.video_url;
  console.log('ep1 page', pageUrl);

  const pageRes = await fetch(pageUrl, {
    headers: {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
      Accept: 'text/html,application/xhtml+xml',
      Referer: 'https://moonanime.art/',
    },
  });
  const html = await pageRes.text();
  const m = html.match(/var\s+_\w+\s*=\s*atob\(\s*"([^"]+)"\s*\)/);
  if (!m) {
    console.log('no obfuscated script, len', html.length);
    return;
  }
  const packed = atob(m[1]);
  const bytes = Uint8Array.from(packed, (c) => c.charCodeAt(0));
  const key = bytes.slice(0, 32);
  const payload = bytes.slice(32);
  const decoded = new Uint8Array(payload.length);
  for (let i = 0; i < payload.length; i++) decoded[i] = payload[i] ^ key[i % 32];
  const inner = new TextDecoder().decode(decoded);
  const fm = inner.match(/file\s*:\s*_0xd\(\s*"([^"]+)"\s*\)/);
  if (!fm) {
    console.log('no file xor in inner');
    return;
  }
  const k = 'mAnK';
  const raw = Buffer.from(fm[1], 'base64').toString('binary');
  let out = '';
  for (let i = 0; i < raw.length; i++) out += String.fromCharCode(raw.charCodeAt(i) ^ k.charCodeAt(i % k.length));
  const m3u8 = decodeURIComponent(escape(out));
  console.log('m3u8', m3u8.slice(0, 120) + '...');

  const m3u8Res = await fetch(m3u8, {
    headers: { Referer: 'https://moonanime.art/', Origin: 'https://moonanime.art' },
  });
  console.log('direct m3u8', m3u8Res.status);
}

main().catch(console.error);

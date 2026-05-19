import { extractM3u8FromEmbedPage } from '../src/services/hikka/extractPageM3u8';

async function main() {
  const url = 'https://moonanime.art/iframe/sepr4nzpfy6j1g1gx7dn9';
  const result = await extractM3u8FromEmbedPage(url);
  console.log(result ? result.slice(0, 100) : 'NULL');
}

void main();

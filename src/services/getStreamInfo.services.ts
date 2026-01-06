import { apiUrl } from '@/lib/api';

export default async function getStreamInfo(
  animeId: string,
  episodeId: string,
  serverName: string,
  type: string
) {
  const data = await apiUrl.get(
    `/stream?id=${animeId}?ep=${episodeId}&server=${serverName}&type=${type}`
  );
  return data.results;
}

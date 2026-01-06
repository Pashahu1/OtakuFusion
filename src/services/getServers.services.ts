import { apiUrl } from '@/lib/api';

export default async function getServers(animeId: string, episodeId: string) {
  const data = await apiUrl.get(`/servers/${animeId}?ep=${episodeId}`);
  return data.results;
}

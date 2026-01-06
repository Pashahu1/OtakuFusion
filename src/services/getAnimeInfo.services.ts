import { apiUrl } from '@/lib/api';

export default async function fetchAnimeInfo(id: string) {
  const data = await apiUrl.get(`/info?id=${id}`);
  return data.results;
}

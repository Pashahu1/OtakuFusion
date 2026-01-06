import { apiUrl } from '@/lib/api';

export default async function fetchVoiceActorInfo(id: string, page: string) {
  const data = await apiUrl.get(`/character/list/${id}?page=${page}`);
  return data.results;
}

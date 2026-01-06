import { apiUrl } from '@/lib/api';
import axios from 'axios';

export default async function getEpisodes(id: string) {
  const data = await apiUrl.get(`/episodes/${id}`);
  return data.results;
}

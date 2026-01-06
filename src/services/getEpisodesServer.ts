import { apiUrl } from '@/lib/api';

export const getEpisodesServer = async (id: string) => {
  const data = await apiUrl.get(`/servers/${id}`);
  return data;
};

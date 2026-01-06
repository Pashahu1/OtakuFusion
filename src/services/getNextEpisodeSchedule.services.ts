import { apiUrl } from '@/lib/api';

const getNextEpisodeSchedule = async (id: string) => {
  const data = await apiUrl.get(`/schedule/${id}`);
  return data.results;
};

export default getNextEpisodeSchedule;

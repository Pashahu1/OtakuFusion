import { apiUrl } from '@/lib/api';

export const getHomePage = async () => {
  const data = await apiUrl.get('/');
  return data.results;
};

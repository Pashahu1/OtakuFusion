import { apiUrl } from '@/lib/api';

export const getCategory = async (name: string, page: number = 1) => {
  const data = await apiUrl.get(`/${name}?page=${page}`);
  return data;
};

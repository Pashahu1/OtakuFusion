import { apiUrl } from '@/lib/api';

const getCategoryInfo = async (path: string, page: string) => {
  const data = await apiUrl.get(`/${path}?page=${page}`);
  return data;
};

export default getCategoryInfo;

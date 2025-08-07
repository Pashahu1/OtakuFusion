import axios from 'axios';

const getCategoryInfo = async (path: string, page: string) => {
  const api_url = 'https://anime-api-nu-ten.vercel.app/api';
  try {
    const response = await axios.get(`${api_url}/${path}?page=${page}`);
    return response.data.results;
  } catch (err) {
    console.error('Error fetching genre info:', err);
    return err;
  }
};

export default getCategoryInfo;

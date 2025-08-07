import axios from 'axios';

export default async function getEpisodes(id: string) {
  const api_url = 'https://anime-api-nu-ten.vercel.app/api';
  try {
    const response = await axios.get(`${api_url}/episodes/${id}`);
    return response.data.results;
  } catch (error) {
    console.error('Error fetching anime info:', error);
    return error;
  }
}

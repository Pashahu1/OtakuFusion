import axios from 'axios';

export default async function getServers(animeId: string, episodeId: string) {
  try {
    const api_url = 'https://anime-api-nu-ten.vercel.app/api';
    const response = await axios.get(
      `${api_url}/servers/${animeId}?ep=${episodeId}`
    );
    return response.data.results;
  } catch (error) {
    console.error(error);
    return error;
  }
}

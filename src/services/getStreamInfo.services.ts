import axios from 'axios';

export default async function getStreamInfo(
  animeId: string,
  episodeId: string,
  serverName: string,
  type: string
) {
  const api_url = 'https://anime-api-nu-ten.vercel.app/api';
  try {
    const response = await axios.get(
      `${api_url}/stream?id=${animeId}?ep=${episodeId}&server=${serverName}&type=${type}`
    );
    return response.data.results;
  } catch (error) {
    console.error('Error fetching stream info:', error);
    return error;
  }
}

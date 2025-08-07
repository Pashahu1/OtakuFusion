import axios from 'axios';

const getNextEpisodeSchedule = async (id: string) => {
  const api_url = 'https://anime-api-nu-ten.vercel.app/api';
  try {
    const response = await axios.get(`${api_url}/schedule/${id}`);
    return response.data.results;
  } catch (err) {
    console.error('Error fetching next episode schedule:', err);
    return err;
  }
};

export default getNextEpisodeSchedule;

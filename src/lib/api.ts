import { ApiError } from './errors/ApiError';

const API_URL = 'https://anime-api-nu-ten.vercel.app/api';

export const apiUrl = {
  get: async (endpoint: string) => {
    const res = await fetch(`${API_URL}${endpoint}`);

    if (!res.ok) {
      throw new ApiError('API request failed', res.status);
    }

    return res.json();
  },
};

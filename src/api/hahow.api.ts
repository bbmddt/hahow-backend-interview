import axios, { AxiosError } from 'axios';
import { Hero, HeroProfile } from '../types/hero.types';
import AppError from '../utils/appError';

const apiClient = axios.create({
  baseURL: process.env.HAHOW_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// add a interceptor to handle API response
apiClient.interceptors.response.use(
  (response) => {
    // handle 200 responses that contain an error payload (e.g., { code, message })
    if (response.data && response.data.code) {
      // reject with AppError to error handler catch it
      return Promise.reject(
        new AppError(503, 'The external API service is currently unavailable.')
      );
    }
    // If the response is truly successful, pass it through
    return response;
  },
  // handle failed responses (non-2xx status codes)
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

export const getHeroes = async (): Promise<Hero[]> => {
  const response = await apiClient.get<Hero[]>('/heroes');
  return response.data;
};

export const getHeroById = async (heroId: string): Promise<Hero> => {
  const response = await apiClient.get<Hero>(`/heroes/${heroId}`);
  return response.data;
};

export const getHeroProfileById = async (heroId: string): Promise<HeroProfile> => {
  const response = await apiClient.get<HeroProfile>(`/heroes/${heroId}/profile`);
  return response.data;
};

export const authenticate = async (name: string, password: string): Promise<boolean> => {
  // let Axios and the interceptor handle errors, only returns true if the request succeeds without error.
  await apiClient.post('/auth', { name, password });

  return true;
};
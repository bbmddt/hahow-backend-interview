import axios, { AxiosError } from 'axios';
import { Hero, HeroProfile } from '../types/hero.types';

// Custom error for Hahow API specific issues, especially for 200 OK with error payload.
export class HahowApiError extends Error {
  constructor(
    public code: number,
    public message: string
  ) {
    super(message);
    this.name = 'HahowApiError';
  }
}

const apiClient = axios.create({
  baseURL: process.env.HAHOW_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add a response interceptor to handle API responses globally.
apiClient.interceptors.response.use(
  (response) => {
    // Handle 200 OK responses that contain a business logic error payload (e.g., { code, message }).
    if (response.data && response.data.code) {
      // Reject with a custom error to be handled by the caller.
      return Promise.reject(
        new HahowApiError(response.data.code, response.data.message)
      );
    }
    // If the response is successful, pass it through.
    return response;
  },
  // Handle non-2xx status code errors.
  (error: AxiosError) => {
    // The error will be handled by the calling service, which can decide on retries or error mapping.
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

export const authenticate = async (name: string, password: string): Promise<void> => {
  // Let the interceptor handle the response. A successful response resolves, an error rejects.
  await apiClient.post('/auth', { name, password });
};
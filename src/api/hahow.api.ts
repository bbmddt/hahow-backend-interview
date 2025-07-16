import axios, { AxiosError } from 'axios';
import { Hero, HeroProfile } from '../types/hero.types';

// Custom error to handle cases where the API returns a 200 OK status
// but includes an error payload (e.g., { "code": 1000, "message": "Backend Error" }).
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

// Use a response interceptor to centralize response handling.
apiClient.interceptors.response.use(
  (response) => {
    // This is crucial for handling the "200 OK with error" scenario.
    // If the response data contains a `code` field, it's treated as a business logic error.
    if (response.data && response.data.code) {
      return Promise.reject(
        new HahowApiError(response.data.code, response.data.message)
      );
    }
    return response;
  },
  (error: AxiosError) => {
    // For standard HTTP errors (non-2xx), let the error propagate.
    // The calling service (`hero.service.ts`) is responsible for implementing
    // retry logic or mapping it to a user-facing error.
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
  // The interceptor will automatically handle success or failure.
  // A successful authentication resolves, while an error (e.g., 401) rejects.
  await apiClient.post('/auth', { name, password });
};

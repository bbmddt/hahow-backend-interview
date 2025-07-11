import axios from 'axios';
import { Hero, HeroProfile } from '../types/hero.types';

const apiClient = axios.create({
  baseURL: process.env.HAHOW_API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

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
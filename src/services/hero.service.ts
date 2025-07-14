import { AxiosError } from 'axios';
import * as hahowApi from '../api/hahow.api';
import { AuthenticatedHero, Hero } from '../types/hero.types';
import AppError from '../utils/appError';

export const listHeroes = async (isAuthenticated = false): Promise<Hero[] | AuthenticatedHero[]> => {

  const heroes = await hahowApi.getHeroes();

  if (!isAuthenticated) {
    return heroes;
  }

  // use Promise.all fetch all hero profiles in parallel
  const profiles = await Promise.all(
    heroes.map(hero => hahowApi.getHeroProfileById(hero.id))
  );

  const authenticatedHeroes: AuthenticatedHero[] = heroes.map((hero, index) => ({
    ...hero,
    profile: profiles[index],
  }));

  return authenticatedHeroes;
};

export const getSingleHero = async (
  heroId: string,
  isAuthenticated = false
): Promise<Hero | AuthenticatedHero> => {

  try {
    const hero = await hahowApi.getHeroById(heroId);

    if (!isAuthenticated) {
      return hero;
    }

    const profile = await hahowApi.getHeroProfileById(heroId);

    return { ...hero, profile };

  } catch (error) {
    if (error instanceof AxiosError && error.response?.status === 404) {
      // throw custom AppError with a clear message and status code.
      throw new AppError(404, 'Hero not found');
    }
    throw error;
  }
};
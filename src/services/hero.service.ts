import { AxiosError } from 'axios';
import * as hahowApi from '../api/hahow.api';
import { HahowApiError } from '../api/hahow.api';
import { AuthenticatedHero, Hero } from '../types/hero.types';
import AppError from '../utils/appError';
import { withRetry } from '../utils/retry';

// A centralized function to handle Hahow API calls with retry logic and error mapping.
const callHahowApi = async <T>(
  apiCall: () => Promise<T>,
  context: string // A string to identify the source of the call for logging.
): Promise<T> => {
  try {
    return await withRetry(apiCall, 3, 200, (error: unknown) => {
      // Retry on any HahowApiError or any AxiosError that is not a 404.
      if (error instanceof HahowApiError) {
        return true;
      }
      if (error instanceof AxiosError) {
        return error.response?.status !== 404;
      }
      return false; // Do not retry for other error types.
    });
  } catch (error) {
    // Map specific errors to AppError for consistent error handling.
    if (error instanceof AxiosError && error.response?.status === 404) {
      throw new AppError(404, 'Hero not found');
    }
    // Log the detailed error with context for better traceability.
    console.error(`Failed to execute Hahow API call [${context}]:`, error);
    throw new AppError(503, 'The external API service is currently unavailable.');
  }
};

export const listHeroes = async (isAuthenticated = false): Promise<Hero[] | AuthenticatedHero[]> => {
  const heroes = await callHahowApi(() => hahowApi.getHeroes(), 'getHeroes');

  if (!isAuthenticated) {
    return heroes;
  }

  // Fetch all hero profiles in parallel, with retry logic for each call.
  const profiles = await Promise.all(
    heroes.map(hero =>
      callHahowApi(() => hahowApi.getHeroProfileById(hero.id), `getHeroProfileById for hero ${hero.id}`)
    )
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
  const hero = await callHahowApi(() => hahowApi.getHeroById(heroId), `getHeroById for hero ${heroId}`);

  if (!isAuthenticated) {
    return hero;
  }

  const profile = await callHahowApi(() => hahowApi.getHeroProfileById(heroId), `getHeroProfileById for hero ${heroId}`);

  return { ...hero, profile };
};

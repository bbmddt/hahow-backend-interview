import { AxiosError } from 'axios';
import * as hahowApi from '../api/hahow.api';
import { HahowApiError } from '../api/hahow.api';
import { AuthenticatedHero, Hero } from '../types/hero.types';
import AppError from '../utils/appError';
import { withRetry } from '../utils/retry';
import logger from '../utils/logger';
import cache from '../utils/cache';

// Centralized function to handle Hahow API calls with retry logic and error mapping.
const callHahowApi = async <T>(
  apiCall: () => Promise<T>,
  context: string // Context for logging to identify the source of the call.
): Promise<T> => {
  try {
    return await withRetry(apiCall, 3, 200, (error: unknown) => {
      // Retry on any HahowApiError or any AxiosError that is not a 404,
      // as a 404 is an expected "not found" case and shouldn't be retried.
      if (error instanceof HahowApiError) {
        return true;
      }
      if (error instanceof AxiosError) {
        return error.response?.status !== 404;
      }
      return false;
    }, context);
  } catch (error) {
    // Map a 404 error to custom AppError for consistent error handling.
    if (error instanceof AxiosError && error.response?.status === 404) {
      throw new AppError(404, 'Hero not found');
    }
    logger.error(`Failed to execute Hahow API call [${context}]:`, error);
    throw new AppError(503, 'The external API service is currently unavailable.');
  }
};

export const listHeroes = async (isAuthenticated = false): Promise<Hero[] | AuthenticatedHero[]> => {
  const cacheKey = `heroes:${isAuthenticated ? 'authenticated' : 'public'}`;
  const cachedData = cache.get<Hero[] | AuthenticatedHero[]>(cacheKey);
  if (cachedData) {
    logger.info(`[Cache] HIT for key: ${cacheKey}`);
    return cachedData;
  }
  logger.info(`[Cache] MISS for key: ${cacheKey}`);

  const heroes = await callHahowApi(() => hahowApi.getHeroes(), 'getHeroes');

  if (!isAuthenticated) {
    cache.set(cacheKey, heroes);
    return heroes;
  }

  const profiles = await Promise.all(
    heroes.map(hero =>
      callHahowApi(() => hahowApi.getHeroProfileById(hero.id), `getHeroProfileById for hero ${hero.id}`)
    )
  );

  const authenticatedHeroes: AuthenticatedHero[] = heroes.map((hero, index) => ({
    ...hero,
    profile: profiles[index],
  }));

  cache.set(cacheKey, authenticatedHeroes);
  return authenticatedHeroes;
};

export const getSingleHero = async (
  heroId: string,
  isAuthenticated = false
): Promise<Hero | AuthenticatedHero> => {
  const cacheKey = `hero:${heroId}:${isAuthenticated ? 'authenticated' : 'public'}`;
  const cachedData = cache.get<Hero | AuthenticatedHero>(cacheKey);
  if (cachedData) {
    logger.info(`[Cache] HIT for key: ${cacheKey}`);
    return cachedData;
  }
  logger.info(`[Cache] MISS for key: ${cacheKey}`);

  const hero = await callHahowApi(() => hahowApi.getHeroById(heroId), `getHeroById for hero ${heroId}`);

  if (!isAuthenticated) {
    cache.set(cacheKey, hero);
    return hero;
  }

  const profile = await callHahowApi(() => hahowApi.getHeroProfileById(heroId), `getHeroProfileById for hero ${heroId}`);
  const authenticatedHero = { ...hero, profile };

  cache.set(cacheKey, authenticatedHero);
  return authenticatedHero;
};

import * as hahowApi from '../api/hahow.api';
import { AuthenticatedHero, Hero } from '../types/hero.types';

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
  // fetch hero data and profile in parallel (if authenticated).
  const heroPromise = hahowApi.getHeroById(heroId);
  const profilePromise = isAuthenticated
    ? hahowApi.getHeroProfileById(heroId)
    : Promise.resolve(null);

  const [hero, profile] = await Promise.all([heroPromise, profilePromise]);

  if (profile) {
    return { ...hero, profile };
  }

  return hero;
};
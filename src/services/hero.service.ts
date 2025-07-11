import * as hahowApi from '../api/hahow.api';
import { Hero } from '../types/hero.types';

export const listHeroes = async (): Promise<Hero[]> => {
  return await hahowApi.getHeroes();
};

export const getSingleHero = async (heroId: string): Promise<Hero> => {
  return await hahowApi.getHeroById(heroId);
};
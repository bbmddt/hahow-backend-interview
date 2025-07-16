import { Request, Response, NextFunction } from 'express';
import * as heroService from '../services/hero.service';

export const getHeroesList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const heroes = await heroService.listHeroes(req.isAuthenticated);
    res.status(200).json({ heroes });
  } catch (error) {
    next(error);
  }
};

export const getHeroById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { heroId } = req.params;
    const hero = await heroService.getSingleHero(heroId, req.isAuthenticated);
    res.status(200).json(hero);
  } catch (error) {
    next(error);
  }
};

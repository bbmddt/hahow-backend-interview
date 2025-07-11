import { Request, Response, NextFunction } from 'express';
import * as heroService from '../services/hero.service';

export const getHeroesList = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const heroes = await heroService.listHeroes();
    res.status(200).json({ heroes });
  } catch (error) {
    next(error); // Pass the error to the global error handler
  }
};

export const getHeroById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { heroId } = req.params;
    const hero = await heroService.getSingleHero(heroId);
    res.status(200).json(hero);
  } catch (error) {
    next(error);
  }
};
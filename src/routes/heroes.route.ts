import { Router } from 'express';
import * as heroController from '../controllers/hero.controller';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();

router.use(authMiddleware);

router.get('/', heroController.getHeroesList);
router.get('/:heroId', heroController.getHeroById);

export default router;

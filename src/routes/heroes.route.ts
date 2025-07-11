import { Router } from 'express';
import * as heroController from '../controllers/hero.controller';

const router = Router();

router.get('/', heroController.getHeroesList);
router.get('/:heroId', heroController.getHeroById);

export default router;
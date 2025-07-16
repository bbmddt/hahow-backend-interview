import { Router, Request, Response } from 'express';
import heroRoutes from './heroes.route';

const router = Router();

router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Heroes API Server' });
});

router.use('/heroes', heroRoutes);

export default router;

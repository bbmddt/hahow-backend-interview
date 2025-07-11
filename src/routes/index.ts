import { Router, Request, Response } from 'express';
import heroRoutes from './heroes.route';

const router = Router();

// root route
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Heroes API Server' });
});

// route all requests starting with /heroes to heroRoutes
router.use('/heroes', heroRoutes);

export default router;
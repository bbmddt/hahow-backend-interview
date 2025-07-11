import { Router, Request, Response } from 'express';

const router = Router();

// root route
router.get('/', (req: Request, res: Response) => {
  res.status(200).json({ message: 'Heroes API Server' });
});

export default router;
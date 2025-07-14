import { Request, Response, NextFunction } from 'express';
import { authenticate } from '../api/hahow.api';

export const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const name = req.headers.name as string;
  const password = req.headers.password as string;

  // if name or password are not provided in the headers, mark the request as unauthenticated and proceed.
  if (!name || !password) {
    req.isAuthenticated = false;
    return next();
  }

  // call the external API to authenticate with the provided credentials.
  const isAuthenticated = await authenticate(name, password);
  req.isAuthenticated = isAuthenticated;

  next();
};
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use env var in production

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Allow OPTIONS requests for CORS preflight
  if (req.method === 'OPTIONS') {
    return next();
  }

  // Skip authentication for login routes and user signup
  if (['/account/login', '/account/login/otp/verify', '/account/signup'].includes(req.path)) {
    return next();
  }

  const token = req.cookies?.jwt;

  if (!token) {
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    (req as any).user = decoded; // Attach user to request
    next();
  } catch (error) {
    logger.error('Invalid JWT token', error, { token: token ? 'present' : 'missing' });
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export interface AuthRequest extends Request {
  user?: { userId: string };
}

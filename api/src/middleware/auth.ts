import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key'; // Use env var in production

export const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
  // Skip authentication for login routes and user signup
  if (
    req.path === '/account/login' ||
    req.path === '/account/login/otp/verify' ||
    (req.method === 'POST' && req.path === '/user')
  ) {
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
    return res.status(401).json({ message: 'Invalid token' });
  }
};

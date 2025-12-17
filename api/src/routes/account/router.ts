import { Router } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const router = Router();

router.post('/account/login', (req, res) => {
  // Handle user login - send OTP
  res.status(200).json({ message: 'OTP sent' });
});

router.post('/account/login/otp/verify', (req, res) => {
  // Handle OTP verification and JWT creation
  // TODO: Verify OTP from request body

  // Mock user ID - replace with actual user lookup
  const userId = 'user-123';

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  res.status(200).json({ message: 'Login successful' });
});

export default router;

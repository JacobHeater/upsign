import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { totp } from 'otplib';
import { IApiResponse } from '../../http/response/response';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const router = Router();

router.options('/account/login', (req, res) => {
  res.sendStatus(200);
});

router.options('/account/login/otp/verify', (req, res) => {
  res.sendStatus(200);
});

function getSecretForPhone(phoneNumber: string): string {
  // Derive a per-phone secret from the server secret so we don't need to store it
  // HMAC-SHA256 produces 64 hex characters (256 bits), suitable for TOTP
  return crypto.createHmac('sha256', JWT_SECRET).update(phoneNumber).digest('hex');
}

function isValidPhoneNumber(phoneNumber: string): boolean {
  // Basic validation: starts with +, followed by digits, spaces, dashes, parentheses
  const phoneRegex = /^\+?[1-9]\d{1,14}(\s|\-|\(|\))*\d*$/;
  return phoneRegex.test(phoneNumber);
}

router.post('/account/login', (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
    const response: IApiResponse<null> = {
      success: false,
      error: 'Valid phone number is required',
    };
    res.status(400).json(response);
    return;
  }

  const secret = getSecretForPhone(phoneNumber);

  // Generate a TOTP (time-based) code
  const otp = totp.generate(secret);

  // In a real app, send SMS here. For now, log it.
  console.log(`TOTP for ${phoneNumber}: ${otp}`);

  const response: IApiResponse<{ message: string }> = {
    success: true,
    data: { message: 'OTP sent' },
  };
  res.status(200).json(response);
});

router.post('/account/login/otp/verify', (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !isValidPhoneNumber(phoneNumber) || !otp) {
    const response: IApiResponse<null> = {
      success: false,
      error: 'Valid phone number and OTP are required',
    };
    res.status(400).json(response);
    return;
  }

  const secret = getSecretForPhone(phoneNumber);

  // Verify the TOTP (allowing configurable window via TOTP_WINDOW env var, default 2 for 1 minute window)
  const TOTP_WINDOW = Number(process.env.TOTP_WINDOW) || 2;
  const verifier = totp.create({ window: TOTP_WINDOW });
  const valid = verifier.check(otp, secret);

  if (!valid) {
    const response: IApiResponse<null> = {
      success: false,
      error: 'Invalid or expired OTP',
    };
    res.status(400).json(response);
    return;
  }

  // Mock user ID - replace with actual user lookup
  const userId = 'user-123';

  const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });

  res.cookie('jwt', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 1000, // 1 hour
  });

  const response: IApiResponse<{ message: string }> = {
    success: true,
    data: { message: 'Login successful' },
  };
  res.status(200).json(response);
});

export default router;

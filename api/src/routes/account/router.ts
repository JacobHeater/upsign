import { Router } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { IApiResponse } from '../../http/response/response';
import { PrismaUserRepository } from '../../repositories/users/prisma-user-repository';
import { PrismaUserOtpRepository } from '../../repositories/users/prisma-user-otp-repository';
import { isValidPhoneNumber } from '../../utils/validation';
import logger from '../../utils/logger';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

const userRepo = new PrismaUserRepository();
const otpRepo = new PrismaUserOtpRepository();

const router = Router();

router.post('/login', async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber || !isValidPhoneNumber(phoneNumber)) {
    const response: IApiResponse<null> = {
      success: false,
      error: 'Valid phone number is required',
    };
    res.status(400).json(response);
    return;
  }

  const user = await userRepo.getByPhoneNumberAsync(phoneNumber);
  if (!user) {
    const response: IApiResponse<null> = {
      success: false,
      error: 'User not found',
    };
    res.status(404).json(response);
    return;
  }

  const otp = crypto.randomInt(100000, 1000000).toString();

  await otpRepo.createOtpAsync(user.id, otp);

  // In a real app, send SMS here. For now, log it.
  logger.info(`OTP generated for ${phoneNumber}`, { otp });

  const response: IApiResponse<{ message: string }> = {
    success: true,
    data: { message: 'OTP sent' },
  };
  res.status(200).json(response);
});

router.post('/login/otp/verify', async (req, res) => {
  const { phoneNumber, otp } = req.body;

  if (!phoneNumber || !isValidPhoneNumber(phoneNumber) || !otp) {
    const response: IApiResponse<null> = {
      success: false,
      error: 'Valid phone number and OTP are required',
    };
    res.status(400).json(response);
    return;
  }

  const user = await userRepo.getByPhoneNumberAsync(phoneNumber);
  if (!user) {
    const response: IApiResponse<null> = {
      success: false,
      error: 'User not found',
    };
    res.status(404).json(response);
    return;
  }

  const validOtp = await otpRepo.getValidOtpAsync(user.id, otp);
  if (!validOtp) {
    const response: IApiResponse<null> = {
      success: false,
      error: 'Invalid or expired OTP',
    };
    res.status(400).json(response);
    return;
  }

  // Delete the used OTP
  await otpRepo.deleteOtpAsync(validOtp.id);

  const token = jwt.sign({ userId: user.id }, JWT_SECRET);

  res.cookie('jwt', token, {
    httpOnly: process.env.NODE_ENV === 'production',
    secure: process.env.NODE_ENV === 'production',
    maxAge: 60 * 60 * 24 * 365, // 1 year
  });

  const response: IApiResponse<{ message: string }> = {
    success: true,
    data: { message: 'Login successful' },
  };
  res.status(200).json(response);
});

router.post('/signup', async (req, res) => {
  const { firstName, lastName, email, dateOfBirth, phoneNumber, allergies } = req.body;

  if (
    !firstName ||
    !lastName ||
    !email ||
    !dateOfBirth ||
    !phoneNumber ||
    !isValidPhoneNumber(phoneNumber)
  ) {
    const response: IApiResponse<null> = {
      success: false,
      error: 'All fields are required and phone number must be valid',
    };
    res.status(400).json(response);
    return;
  }

  try {
    const user = await userRepo.createAsync({
      firstName,
      lastName,
      email,
      dateOfBirth: new Date(dateOfBirth),
      phoneNumber,
      allergies: allergies?.map((allergy: string) => ({ allergy })) || [],
      verified: false,
      locked: false,
      lastLogin: null,
    } as any);
    logger.info('Account created', { userId: user.id });

    const response: IApiResponse<{ message: string }> = {
      success: true,
      data: { message: 'Account created successfully' },
    };
    res.status(201).json(response);
  } catch (error) {
    logger.error('Error creating account', error, { body: req.body });
    const response: IApiResponse<null> = {
      success: false,
      error: 'Failed to create account',
    };
    res.status(500).json(response);
  }
});

router.post('/logout', (req, res) => {
  res.clearCookie('jwt');
  const response: IApiResponse<{ message: string }> = {
    success: true,
    data: { message: 'Logged out successfully' },
  };
  res.status(200).json(response);
});

export default router;

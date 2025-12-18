import request from 'supertest';
import app from '../../../index';
import { jest, describe, beforeEach, it, expect } from '@jest/globals';

jest.mock('../../../repositories/users/prisma-user-repository');
jest.mock('../../../repositories/users/prisma-user-otp-repository');

const mockUserRepo = require('../../../repositories/users/prisma-user-repository');
const mockOtpRepo = require('../../../repositories/users/prisma-user-otp-repository');

describe('Account Router', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /api/account/login', () => {
    it('should send OTP', async () => {
      const mockUser = { id: 'user1', phoneNumber: '+1234567890' };
      mockUserRepo.PrismaUserRepository.prototype.getByPhoneNumberAsync.mockResolvedValue(mockUser);
      mockOtpRepo.PrismaUserOtpRepository.prototype.createOtpAsync.mockResolvedValue({});

      const response = await request(app)
        .post('/api/account/login')
        .send({ phoneNumber: '+1234567890' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: { message: 'OTP sent' } });
      expect(
        mockUserRepo.PrismaUserRepository.prototype.getByPhoneNumberAsync
      ).toHaveBeenCalledWith('+1234567890');
      expect(mockOtpRepo.PrismaUserOtpRepository.prototype.createOtpAsync).toHaveBeenCalledWith(
        'user1',
        expect.any(String)
      );
    });
  });

  describe('POST /api/account/login/otp/verify', () => {
    it('should verify OTP and return JWT', async () => {
      const mockUser = { id: 'user1', phoneNumber: '+1234567890' };
      const mockOtp = { id: 'otp1' };
      mockUserRepo.PrismaUserRepository.prototype.getByPhoneNumberAsync.mockResolvedValue(mockUser);
      mockOtpRepo.PrismaUserOtpRepository.prototype.getValidOtpAsync.mockResolvedValue(mockOtp);
      mockOtpRepo.PrismaUserOtpRepository.prototype.deleteOtpAsync.mockResolvedValue(true);

      const response = await request(app)
        .post('/api/account/login/otp/verify')
        .send({ phoneNumber: '+1234567890', otp: '123456' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ success: true, data: { message: 'Login successful' } });
      expect(response.headers['set-cookie']).toBeDefined();
      expect(
        mockUserRepo.PrismaUserRepository.prototype.getByPhoneNumberAsync
      ).toHaveBeenCalledWith('+1234567890');
      expect(mockOtpRepo.PrismaUserOtpRepository.prototype.getValidOtpAsync).toHaveBeenCalledWith(
        'user1',
        '123456'
      );
      expect(mockOtpRepo.PrismaUserOtpRepository.prototype.deleteOtpAsync).toHaveBeenCalledWith(
        'otp1'
      );
    });
  });
});

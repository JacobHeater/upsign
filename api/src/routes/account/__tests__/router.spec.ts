import request from 'supertest';
import app from '../../../index';

describe('Account Router', () => {
  describe('POST /api/account/login', () => {
    it('should send OTP', async () => {
      const response = await request(app)
        .post('/api/account/login')
        .send({ email: 'test@example.com' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'OTP sent' });
    });
  });

  describe('POST /api/account/login/otp/verify', () => {
    it('should verify OTP and return JWT', async () => {
      const response = await request(app)
        .post('/api/account/login/otp/verify')
        .send({ otp: '123456' });

      expect(response.status).toBe(200);
      expect(response.body).toEqual({ message: 'Login successful' });
      expect(response.headers['set-cookie']).toBeDefined();
    });
  });
});

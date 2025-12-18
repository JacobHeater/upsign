import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../index';
import { PrismaUserRepository } from '../../../repositories/users/prisma-user-repository';
import { describe, beforeAll, it, expect } from '@jest/globals';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const userRepo = new PrismaUserRepository();

describe('Event Router', () => {
  const token = jwt.sign({ userId: 'test-user' }, JWT_SECRET, { expiresIn: '1h' });

  beforeAll(async () => {
    // Create test user
    console.log('Creating user');
    try {
      const user = await userRepo.createAsync({
        id: 'test-user',
        firstName: 'Test',
        lastName: 'User',
        allergies: [],
        email: 'test-event-999@example.com',
        dateOfBirth: new Date(),
        phoneNumber: '9999999999',
        verified: true,
        locked: false,
        lastLogin: null,
        otps: [],
        attendances: [],
        hostedEvents: [],
      } as any);
      console.log('User created', user.id);
    } catch (e) {
      console.log('User create failed', e);
      // Ignore if already exists
    }
  });

  describe('POST /api/event', () => {
    it('should create event', async () => {
      const response = await request(app)
        .post('/api/event')
        .set('Cookie', [`jwt=${token}`])
        .send({
          name: 'Test Event',
          date: '2023-01-01',
          location: 'Test Location',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/event/:id', () => {
    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .get('/api/event/1')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/event', () => {
    it('should get all events', async () => {
      const response = await request(app)
        .get('/api/event')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/event/:id', () => {
    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .put('/api/event/1')
        .set('Cookie', [`jwt=${token}`])
        .send({
          name: 'Updated Event',
          date: '2023-01-01',
          location: 'Updated Location',
        });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/event/:id', () => {
    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .delete('/api/event/1')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(404);
    });
  });
});

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../index';
import { PrismaUserRepository } from '../../../repositories/users/prisma-user-repository';
import { PrismaEventRepository } from '../../../repositories/events/prisma-event-repository';
import { describe, beforeAll, it, expect } from '@jest/globals';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const userRepo = new PrismaUserRepository();
const eventRepo = new PrismaEventRepository();

describe('Event Segment Router', () => {
  const token = jwt.sign({ userId: 'test-user' }, JWT_SECRET, { expiresIn: '1h' });
  let eventId: string;

  beforeAll(async () => {
    // Create test user
    try {
      await userRepo.createAsync({
        id: 'test-user',
        firstName: 'Test',
        lastName: 'User',
        allergies: [],
        email: 'test-segment-999@example.com',
        dateOfBirth: '2023-01-01',
        phoneNumber: '9999999999',
        verified: true,
        locked: false,
        lastLogin: null,
        otps: [],
        attendances: [],
        hostedEvents: [],
      } as any);
    } catch (e) {
      // Ignore if already exists
    }

    // Create test event
    console.log('Creating event');
    try {
      const event = await eventRepo.createAsync({
        id: '',
        name: 'Test Event',
        date: new Date('2023-01-01'),
        hostId: 'test-user',
        host: { id: 'test-user' } as any,
        location: 'Test Location',
        segments: [],
      });
      eventId = event.id;
      console.log('Event created', eventId);
    } catch (e) {
      console.log('Event create failed', e);
      // If already exists, get it
      const events = await eventRepo.getAllAsync();
      eventId = events[0]?.id || 'event1';
    }
  });

  describe('POST /api/event-segment', () => {
    it('should create event segment', async () => {
      console.log('eventId:', eventId);
      const response = await request(app)
        .post('/api/event-segment')
        .set('Cookie', [`jwt=${token}`])
        .send({ name: 'Test Segment', eventId });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
    });
  });

  describe('GET /api/event-segment/:id', () => {
    it('should return 404 for non-existent event segment', async () => {
      const response = await request(app)
        .get('/api/event-segment/1')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(404);
    });
  });

  describe('GET /api/event-segment', () => {
    it('should get all event segments', async () => {
      const response = await request(app)
        .get('/api/event-segment')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/event-segment/:id', () => {
    it('should return 404 for non-existent event segment', async () => {
      const response = await request(app)
        .put('/api/event-segment/1')
        .set('Cookie', [`jwt=${token}`])
        .send({ name: 'Updated Segment', eventId });

      expect(response.status).toBe(404);
    });
  });

  describe('DELETE /api/event-segment/:id', () => {
    it('should return 404 for non-existent event segment', async () => {
      const response = await request(app)
        .delete('/api/event-segment/1')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(404);
    });
  });
});

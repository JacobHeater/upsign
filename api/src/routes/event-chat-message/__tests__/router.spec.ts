import request from 'supertest';
import jwt from 'jsonwebtoken';
import express from 'express';
import router from '../router';
import { authMiddleware } from '../../../middleware/auth';
import cookieParser from 'cookie-parser';
import { PrismaEventRepository } from '../../../repositories/events/prisma-event-repository';
import { describe, beforeAll, it, expect } from '@jest/globals';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const eventRepo = new PrismaEventRepository();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', authMiddleware);
app.use('/api/event-chat-message', router);

describe('Event Chat Message Router', () => {
  const token = jwt.sign({ userId: 'test-user' }, JWT_SECRET, { expiresIn: '1h' });
  let eventId: string;

  beforeAll(async () => {
    // Create test user
    console.log('Creating user');
    try {
      const user = await eventRepo['prisma'].user.create({
        data: {
          id: 'test-user-msg',
          firstName: 'Test',
          lastName: 'User',
          email: 'test-chat-message@example.com',
          dateOfBirth: new Date(),
          phoneNumber: '9999999998',
          verified: true,
          locked: false,
          lastLogin: null,
        },
      });
      console.log('User created', user.id);
    } catch (e) {
      console.log('User create failed', e);
      // Ignore if already exists
    }

    // Create test event
    try {
      const event = await eventRepo.createAsync({
        id: '',
        name: 'Test Event for Chat',
        description: 'Test Description',
        date: new Date('2023-01-01'),
        location: 'Test Location',
        icon: '🎂',
        hostId: 'test-user-msg',
        host: { id: 'test-user-msg' } as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        segments: [],
        attendees: [],
      });
      eventId = event.id;
      console.log('Event created', eventId);
    } catch (e) {
      console.log('Event create failed', e);
    }
  });

  describe('POST /api/event-chat-message', () => {
    it('should create event chat message', async () => {
      const response = await request(app)
        .post('/api/event-chat-message')
        .set('Cookie', [`jwt=${token}`])
        .send({
          eventId,
          message: 'Hello World!',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Hello World!');
    });

    it('should fail without eventId', async () => {
      const response = await request(app)
        .post('/api/event-chat-message')
        .set('Cookie', [`jwt=${token}`])
        .send({
          message: 'Hello World!',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/event-chat-message', () => {
    it('should get messages for event', async () => {
      const response = await request(app)
        .get('/api/event-chat-message')
        .set('Cookie', [`jwt=${token}`])
        .query({ eventId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail without eventId', async () => {
      const response = await request(app)
        .get('/api/event-chat-message')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

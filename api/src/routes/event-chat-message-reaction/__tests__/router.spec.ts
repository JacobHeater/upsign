import request from 'supertest';
import jwt from 'jsonwebtoken';
import express from 'express';
import router from '../router';
import { authMiddleware } from '../../../middleware/auth';
import cookieParser from 'cookie-parser';
import { PrismaEventRepository } from '../../../repositories/events/prisma-event-repository';
import { PrismaEventChatMessageRepository } from '../../../repositories/events/prisma-event-chat-message-repository';
import { describe, beforeAll, it, expect } from '@jest/globals';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const eventRepo = new PrismaEventRepository();
const messageRepo = new PrismaEventChatMessageRepository();

const app = express();
app.use(express.json());
app.use(cookieParser());
app.use('/api', authMiddleware);
app.use('/api/event-chat-message-reaction', router);

describe('Event Chat Message Reaction Router', () => {
  const token = jwt.sign({ userId: 'test-user' }, JWT_SECRET, { expiresIn: '1h' });
  let eventId: string;
  let messageId: string;

  beforeAll(async () => {
    // Create test user
    console.log('Creating user');
    try {
      const user = await eventRepo['prisma'].user.create({
        data: {
          id: 'test-user',
          firstName: 'Test',
          lastName: 'User',
          email: 'test-chat-reaction@example.com',
          dateOfBirth: new Date(),
          phoneNumber: '9999999999',
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
        name: 'Test Event for Reaction',
        description: 'Test Description',
        date: new Date('2023-01-01'),
        location: 'Test Location',
        icon: '🎂',
        hostId: 'test-user',
        host: { id: 'test-user' } as any,
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

    // Create test message
    try {
      const message = await messageRepo.createAsync({
        id: '',
        userId: 'test-user',
        user: { id: 'test-user' } as any,
        eventId,
        event: { id: eventId } as any,
        message: 'Test message',
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      messageId = message.id;
      console.log('Message created', messageId);
    } catch (e) {
      console.log('Message create failed', e);
    }
  });

  describe('POST /api/event-chat-message-reaction', () => {
    it('should create event chat message reaction', async () => {
      const response = await request(app)
        .post('/api/event-chat-message-reaction')
        .set('Cookie', [`jwt=${token}`])
        .send({
          messageId,
          reaction: '👍',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.reaction).toBe('👍');
    });

    it('should fail without messageId', async () => {
      const response = await request(app)
        .post('/api/event-chat-message-reaction')
        .set('Cookie', [`jwt=${token}`])
        .send({
          reaction: '👍',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });

  describe('GET /api/event-chat-message-reaction', () => {
    it('should get reactions for message', async () => {
      const response = await request(app)
        .get('/api/event-chat-message-reaction')
        .set('Cookie', [`jwt=${token}`])
        .query({ messageId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should fail without messageId', async () => {
      const response = await request(app)
        .get('/api/event-chat-message-reaction')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
    });
  });
});

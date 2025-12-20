import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../index';
import { PrismaUserRepository } from '../../../repositories/users/prisma-user-repository';
import { PrismaEventRepository } from '../../../repositories/events/prisma-event-repository';
import { PrismaEventSegmentRepository } from '../../../repositories/events/prisma-event-segment-repository';
import { PrismaEventAttendeeRepository } from '../../../repositories/events/prisma-event-attendee-repository';
import { describe, beforeAll, it, expect } from '@jest/globals';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const userRepo = new PrismaUserRepository();
const eventRepo = new PrismaEventRepository();
const segmentRepo = new PrismaEventSegmentRepository();
const attendeeRepo = new PrismaEventAttendeeRepository();

describe('Event Attendee Router', () => {
  const token = jwt.sign({ userId: 'test-user' }, JWT_SECRET, { expiresIn: '1h' });
  let userId: string;
  let eventId: string;
  let segmentId: string;
  let attendeeId: string;

  beforeAll(async () => {
    // Create test user
    console.log('Creating user');
    try {
      const user = await userRepo.createAsync({
        id: 'test-user',
        firstName: 'Test',
        lastName: 'User',
        allergies: [],
        email: 'test-attendee@example.com',
        dateOfBirth: new Date(),
        phoneNumber: `9999999999${Date.now()}`,
        verified: true,
        locked: false,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        otps: [],
        attendances: [],
        hostedEvents: [],
      } as any);
      userId = user.id;
      console.log('User created', userId);
    } catch (e) {
      console.log('User create failed', e);
      // Ignore if already exists
      userId = 'test-user';
    }

    // Create another user for attendee
    try {
      const attendeeUser = await userRepo.createAsync({
        id: 'attendee-user',
        firstName: 'Attendee',
        lastName: 'User',
        allergies: [],
        email: 'attendee@example.com',
        dateOfBirth: new Date(),
        phoneNumber: `8888888888${Date.now()}`,
        verified: true,
        locked: false,
        lastLogin: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        otps: [],
        attendances: [],
        hostedEvents: [],
      } as any);
      console.log('Attendee user created', attendeeUser.id);
    } catch (e) {
      console.log('Attendee user create failed', e);
    }

    // Create test event
    try {
      const event = await eventRepo.createAsync({
        id: '',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        hostId: userId,
        host: { id: userId } as any,
        location: 'Test Location',
        icon: '🎉',
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

    // Create test segment
    try {
      const segment = await segmentRepo.createAsync({
        id: '',
        name: 'Test Segment',
        eventId,
        event: { id: eventId } as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        attendees: [],
      });
      segmentId = segment.id;
      console.log('Segment created', segmentId);
    } catch (e) {
      console.log('Segment create failed', e);
    }

    // Create test attendee
    try {
      const attendee = await attendeeRepo.createAsync({
        id: '',
        userId: 'attendee-user',
        eventId,
        user: { id: 'attendee-user' } as any,
        event: { id: eventId } as any,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      attendeeId = attendee.id;
      console.log('Attendee created', attendeeId);
    } catch (e) {
      console.log('Attendee create failed', e);
    }
  });

  describe('POST /api/event-attendee', () => {
    it('should create event attendee', async () => {
      const response = await request(app)
        .post('/api/event-attendee')
        .set('Cookie', [`jwt=${token}`])
        .send({ userId: 'attendee-user', eventId });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/event-attendee/:id', () => {
    it('should get event attendee by id', async () => {
      const response = await request(app)
        .get(`/api/event-attendee/${attendeeId}`)
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/event-attendee', () => {
    it('should get all event attendees', async () => {
      const response = await request(app)
        .get('/api/event-attendee')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/event-attendee/:id', () => {
    it('should update event attendee', async () => {
      const response = await request(app)
        .put(`/api/event-attendee/${attendeeId}`)
        .set('Cookie', [`jwt=${token}`])
        .send({ userId: 'attendee-user', eventId });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/event-attendee/:id', () => {
    it('should delete event attendee', async () => {
      const response = await request(app)
        .delete(`/api/event-attendee/${attendeeId}`)
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(204);
    });
  });
});

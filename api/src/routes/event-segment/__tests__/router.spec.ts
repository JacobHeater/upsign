import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../index';
import { PrismaUserRepository } from '../../../repositories/users/prisma-user-repository';
import { PrismaEventRepository } from '../../../repositories/events/prisma-event-repository';
import { PrismaEventSegmentRepository } from '../../../repositories/events/prisma-event-segment-repository';
import { describe, beforeAll, it, expect } from '@jest/globals';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const userRepo = new PrismaUserRepository();
const eventRepo = new PrismaEventRepository();
const eventSegmentRepo = new PrismaEventSegmentRepository();

describe('Event Segment Router', () => {
  const token = jwt.sign({ userId: 'test-user' }, JWT_SECRET, { expiresIn: '1h' });
  const otherToken = jwt.sign({ userId: 'other-user' }, JWT_SECRET, { expiresIn: '1h' });
  let eventId: string;
  let segmentId: string;

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
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
    } catch (e) {
      // Ignore if already exists
    }

    // Create other user
    try {
      await userRepo.createAsync({
        id: 'other-user',
        firstName: 'Other',
        lastName: 'User',
        allergies: [],
        email: 'other-segment@example.com',
        dateOfBirth: '2023-01-01',
        phoneNumber: '8888888888',
        verified: true,
        locked: false,
        lastLogin: null,
        otps: [],
        attendances: [],
        hostedEvents: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
    } catch (e) {
      // Ignore
    }

    // Create test event
    console.log('Creating event');
    try {
      const event = await eventRepo.createAsync({
        id: '',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date('2023-01-01'),
        icon: '🎉',
        hostId: 'test-user',
        host: { id: 'test-user' } as any,
        location: 'Test Location',
        segments: [],
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      eventId = event.id;
      console.log('Event created', eventId);
    } catch (e) {
      console.log('Event create failed', e);
      // If already exists, get it
      const events = await eventRepo.getAllAsync();
      eventId = events.find((e) => e.hostId === 'test-user')?.id || 'event1';
    }

    // Create test segment
    try {
      const segment = await eventSegmentRepo.createAsync({
        id: '',
        name: 'Test Segment',
        eventId,
        event: {} as any,
        attendees: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      segmentId = segment.id;
      console.log('Segment created', segmentId);
    } catch (e) {
      console.log('Segment create failed', e);
      const segments = await eventSegmentRepo.getAllAsync();
      segmentId = segments.find((s) => s.eventId === eventId)?.id || 'segment1';
    }
  });

  describe('POST /api/event-segment', () => {
    it('should create event segment', async () => {
      console.log('eventId:', eventId);
      const response = await request(app)
        .post('/api/event-segment')
        .set('Cookie', [`jwt=${token}`])
        .send({ name: 'Test Segment 2', eventId });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.name).toBe('Test Segment 2');
      expect(response.body.data.eventId).toBe(eventId);
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .post('/api/event-segment')
        .set('Cookie', [`jwt=${token}`])
        .send({ eventId });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 for missing eventId', async () => {
      const response = await request(app)
        .post('/api/event-segment')
        .set('Cookie', [`jwt=${token}`])
        .send({ name: 'Test Segment' });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .post('/api/event-segment')
        .set('Cookie', [`jwt=${token}`])
        .send({ name: 'Test Segment', eventId: 'non-existent' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Event not found');
    });

    it('should return 403 for non-host user', async () => {
      const response = await request(app)
        .post('/api/event-segment')
        .set('Cookie', [`jwt=${otherToken}`])
        .send({ name: 'Test Segment', eventId });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Only event host can create segments');
    });
  });

  describe('GET /api/event-segment/:id', () => {
    it('should return event segment', async () => {
      const response = await request(app)
        .get(`/api/event-segment/${segmentId}`)
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(segmentId);
      expect(response.body.data.name).toBe('Test Segment');
      expect(response.body.data.eventId).toBe(eventId);
    });

    it('should return 404 for non-existent event segment', async () => {
      const response = await request(app)
        .get('/api/event-segment/non-existent')
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
    it('should update event segment', async () => {
      const response = await request(app)
        .put(`/api/event-segment/${segmentId}`)
        .set('Cookie', [`jwt=${token}`])
        .send({ name: 'Updated Segment', eventId });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.name).toBe('Updated Segment');
    });

    it('should return 400 for missing name', async () => {
      const response = await request(app)
        .put(`/api/event-segment/${segmentId}`)
        .set('Cookie', [`jwt=${token}`])
        .send({ eventId });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 404 for non-existent event segment', async () => {
      const response = await request(app)
        .put('/api/event-segment/non-existent')
        .set('Cookie', [`jwt=${token}`])
        .send({ name: 'Updated Segment', eventId });

      expect(response.status).toBe(404);
    });

    it('should return 404 for non-existent event', async () => {
      const response = await request(app)
        .put(`/api/event-segment/${segmentId}`)
        .set('Cookie', [`jwt=${token}`])
        .send({ name: 'Updated Segment', eventId: 'non-existent' });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Event not found');
    });

    it('should return 403 for non-host user', async () => {
      const response = await request(app)
        .put(`/api/event-segment/${segmentId}`)
        .set('Cookie', [`jwt=${otherToken}`])
        .send({ name: 'Updated Segment', eventId });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Only event host can update segments');
    });
  });

  describe('DELETE /api/event-segment/:id', () => {
    it('should delete event segment', async () => {
      // Create another segment to delete
      const createResponse = await request(app)
        .post('/api/event-segment')
        .set('Cookie', [`jwt=${token}`])
        .send({ name: 'Segment to Delete', eventId });

      expect(createResponse.status).toBe(201);
      const deleteId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/event-segment/${deleteId}`)
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(204);
    });

    it('should return 404 for non-existent event segment', async () => {
      const response = await request(app)
        .delete('/api/event-segment/non-existent')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(404);
    });

    it('should return 403 for non-host user', async () => {
      const response = await request(app)
        .delete(`/api/event-segment/${segmentId}`)
        .set('Cookie', [`jwt=${otherToken}`]);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Only event host can delete segments');
    });
  });
});

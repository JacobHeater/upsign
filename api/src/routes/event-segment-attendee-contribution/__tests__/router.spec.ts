import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../index';
import { PrismaUserRepository } from '../../../repositories/users/prisma-user-repository';
import { PrismaEventRepository } from '../../../repositories/events/prisma-event-repository';
import { PrismaEventSegmentRepository } from '../../../repositories/events/prisma-event-segment-repository';
import { PrismaEventSegmentAttendeeRepository } from '../../../repositories/events/prisma-event-segment-attendee-repository';
import { PrismaEventSegmentAttendeeContributionRepository } from '../../../repositories/events/prisma-event-segment-attendee-contribution-repository';
import { describe, beforeAll, it, expect } from '@jest/globals';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const userRepo = new PrismaUserRepository();
const eventRepo = new PrismaEventRepository();
const segmentRepo = new PrismaEventSegmentRepository();
const attendeeRepo = new PrismaEventSegmentAttendeeRepository();
const contributionRepo = new PrismaEventSegmentAttendeeContributionRepository();

describe('Event Segment Attendee Contribution Router', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
  let token: string;
  let userId: string;
  let eventId: string;
  let segmentId: string;
  let attendeeId: string;
  let contributionId: string;
  let itemName: string;

  beforeAll(async () => {
    itemName = `Test Item ${Date.now()}`;
    // Create test user
    console.log('Creating user');
    try {
      const user = await userRepo.createAsync({
        id: `test-user-${Date.now()}`,
        firstName: 'Test',
        lastName: 'User',
        allergies: [],
        email: `test-contribution-${Date.now()}@example.com`,
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
      token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '1h' });
      console.log('User created', userId);
    } catch (e) {
      console.log('User create failed', e);
      // Ignore if already exists
      userId = 'test-user';
    }

    // Create test event
    console.log('Creating event');
    try {
      const event = await eventRepo.createAsync({
        id: '',
        name: `Test Event ${Date.now()}`,
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
      eventId = 'test-event';
    }

    // Create test segment
    console.log('Creating segment');
    try {
      const segment = await segmentRepo.createAsync({
        id: '',
        name: `Test Segment ${Date.now()}`,
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
      segmentId = 'test-segment';
    }

    // Create test attendee
    console.log('Creating attendee');
    try {
      const attendee = await attendeeRepo.createAsync({
        id: '',
        userId,
        segmentId,
        user: { id: userId } as any,
        segment: { id: segmentId } as any,
        contributions: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      });
      attendeeId = attendee.id;
      console.log('Attendee created', attendeeId);
    } catch (e) {
      console.log('Attendee create failed', e);
      attendeeId = 'test-attendee';
    }
  });

  describe('POST /api/event-segment-attendee-contribution', () => {
    it('should create event segment attendee contribution', async () => {
      const response = await request(app)
        .post('/api/event-segment-attendee-contribution')
        .set('Cookie', [`jwt=${token}`])
        .send({
          item: itemName,
          description: 'Test Description',
          quantity: 1,
          eventSegmentAttendeeId: attendeeId,
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.item).toBe(itemName);
      contributionId = response.body.data.id;
    });
  });

  describe('GET /api/event-segment-attendee-contribution/:id', () => {
    it('should get event segment attendee contribution by id', async () => {
      const response = await request(app)
        .get(`/api/event-segment-attendee-contribution/${contributionId}`)
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(contributionId);
    });
  });

  describe('GET /api/event-segment-attendee-contribution', () => {
    it('should get all event segment attendee contributions', async () => {
      const response = await request(app)
        .get('/api/event-segment-attendee-contribution')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
  });

  describe('PUT /api/event-segment-attendee-contribution/:id', () => {
    it('should update event attendee contribution', async () => {
      const response = await request(app)
        .put(`/api/event-segment-attendee-contribution/${contributionId}`)
        .set('Cookie', [`jwt=${token}`])
        .send({ quantity: 2 });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/event-segment-attendee-contribution/:id', () => {
    it('should delete event attendee contribution', async () => {
      const response = await request(app)
        .delete(`/api/event-segment-attendee-contribution/${contributionId}`)
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(204);
    });
  });
});

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../index';
import { PrismaUserRepository } from '../../../repositories/users/prisma-user-repository';
import { PrismaEventRepository } from '../../../repositories/events/prisma-event-repository';
import { PrismaEventSegmentRepository } from '../../../repositories/events/prisma-event-segment-repository';
import { PrismaEventSegmentAttendeeRepository } from '../../../repositories/events/prisma-event-segment-attendee-repository';
import { describe, beforeAll, it, expect } from '@jest/globals';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const userRepo = new PrismaUserRepository();
const eventRepo = new PrismaEventRepository();
const segmentRepo = new PrismaEventSegmentRepository();
const attendeeRepo = new PrismaEventSegmentAttendeeRepository();

describe('Event Segment Attendee Router', () => {
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

    // Create test event
    console.log('Creating event');
    const event = await eventRepo.createAsync({
      id: '',
      name: 'Test Event',
      description: 'Test Description',
      date: new Date(),
      icon: '🎉',
      hostId: userId,
      host: { id: userId } as any,
      location: 'Test Location',
      segments: [],
      attendees: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    });
    eventId = event.id;
    console.log('Event created', eventId);

    // Create test segment
    console.log('Creating segment');
    const segment = await segmentRepo.createAsync({
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
  });

  it('should create an event segment attendee', async () => {
    const response = await request(app)
      .post('/api/event-segment-attendee')
      .set('Cookie', [`jwt=${token}`])
      .send({ userId, segmentId });

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('id');
    expect(response.body.data.userId).toBe(userId);
    expect(response.body.data.segmentId).toBe(segmentId);
    attendeeId = response.body.data.id;
  });

  it('should get an event segment attendee by id', async () => {
    const response = await request(app)
      .get(`/api/event-segment-attendee/${attendeeId}`)
      .set('Cookie', [`jwt=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(attendeeId);
  });

  it('should get all event segment attendees', async () => {
    const response = await request(app)
      .get('/api/event-segment-attendee')
      .set('Cookie', [`jwt=${token}`]);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
  });

  it('should update an event segment attendee', async () => {
    const response = await request(app)
      .put(`/api/event-segment-attendee/${attendeeId}`)
      .set('Cookie', [`jwt=${token}`])
      .send({ userId, segmentId });

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data.id).toBe(attendeeId);
  });

  it('should delete an event segment attendee', async () => {
    const response = await request(app)
      .delete(`/api/event-segment-attendee/${attendeeId}`)
      .set('Cookie', [`jwt=${token}`]);

    expect(response.status).toBe(204);
  });

  it('should return 404 for non-existent event segment attendee', async () => {
    const response = await request(app)
      .get('/api/event-segment-attendee/non-existent-id')
      .set('Cookie', [`jwt=${token}`]);

    expect(response.status).toBe(404);
    expect(response.body.success).toBe(false);
  });
});

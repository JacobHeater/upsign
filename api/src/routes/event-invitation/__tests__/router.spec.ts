import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../index';
import { PrismaUserRepository } from '../../../repositories/users/prisma-user-repository';
import { PrismaEventRepository } from '../../../repositories/events/prisma-event-repository';
import { PrismaEventInvitationRepository } from '../../../repositories/events/prisma-event-invitation-repository';
import { PrismaEventAttendeeRepository } from '../../../repositories/events/prisma-event-attendee-repository';
import { PrismaEventSegmentAttendeeRepository } from '../../../repositories/events/prisma-event-segment-attendee-repository';
import { PrismaEventSegmentRepository } from '../../../repositories/events/prisma-event-segment-repository';
import { RsvpStatus } from 'common/schema';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const userRepo = new PrismaUserRepository();
const invitationRepo = new PrismaEventInvitationRepository();
const eventAttendeeRepo = new PrismaEventAttendeeRepository();
const attendeeRepo = new PrismaEventSegmentAttendeeRepository();
const segmentRepo = new PrismaEventSegmentRepository();

describe('Event Invitation Router', () => {
  const senderToken = jwt.sign({ userId: 'test-sender' }, JWT_SECRET, { expiresIn: '1h' });
  const recipientToken = jwt.sign({ userId: 'test-recipient' }, JWT_SECRET, { expiresIn: '1h' });
  const user3333Token = jwt.sign({ userId: 'test-user-3333' }, JWT_SECRET, { expiresIn: '1h' });
  const user4444Token = jwt.sign({ userId: 'test-user-4444' }, JWT_SECRET, { expiresIn: '1h' });
  const user5555Token = jwt.sign({ userId: 'test-user-5555' }, JWT_SECRET, { expiresIn: '1h' });
  const user6666Token = jwt.sign({ userId: 'test-user-6666' }, JWT_SECRET, { expiresIn: '1h' });
  const user7777Token = jwt.sign({ userId: 'test-user-7777' }, JWT_SECRET, { expiresIn: '1h' });
  const user8888Token = jwt.sign({ userId: 'test-user-8888' }, JWT_SECRET, { expiresIn: '1h' });
  const user9999Token = jwt.sign({ userId: 'test-user-9999' }, JWT_SECRET, { expiresIn: '1h' });
  const user1010Token = jwt.sign({ userId: 'test-user-1010' }, JWT_SECRET, { expiresIn: '1h' });
  const user1112Token = jwt.sign({ userId: 'test-user-1112' }, JWT_SECRET, { expiresIn: '1h' });

  let testInvitationId: string | null = null;
  let testEventId: string | null = null;

  beforeAll(async () => {
    // Create test users
    try {
      const sender = await userRepo.createAsync({
        id: 'test-sender',
        firstName: 'Test',
        lastName: 'Sender',
        allergies: [],
        email: 'test-sender@example.com',
        dateOfBirth: new Date(),
        phoneNumber: '1111111111',
        verified: true,
        locked: false,
        lastLogin: null,
        otps: [],
        attendances: [],
        hostedEvents: [],
      } as any);
      console.log('Sender created', sender.id);
    } catch (e) {
      console.log('Sender creation failed, may already exist', e);
    }

    try {
      const recipient = await userRepo.createAsync({
        id: 'test-recipient',
        firstName: 'Test',
        lastName: 'Recipient',
        allergies: [],
        email: 'test-recipient@example.com',
        dateOfBirth: new Date(),
        phoneNumber: '2222222222',
        verified: true,
        locked: false,
        lastLogin: null,
        otps: [],
        attendances: [],
        hostedEvents: [],
      } as any);
      console.log('Recipient created', recipient.id);
    } catch (e) {
      console.log('Recipient creation failed, may already exist', e);
    }

    // Create additional test users for different phone numbers
    const testUsers = [
      { id: 'test-user-3333', phone: '3333333333' },
      { id: 'test-user-4444', phone: '4444444444' },
      { id: 'test-user-5555', phone: '5555555555' },
      { id: 'test-user-6666', phone: '6666666666' },
      { id: 'test-user-7777', phone: '7777777777' },
      { id: 'test-user-8888', phone: '8888888888' },
      { id: 'test-user-9999', phone: '9999999999' },
      { id: 'test-user-1010', phone: '1010101010' },
      { id: 'test-user-1112', phone: '1111111112' },
    ];

    for (const user of testUsers) {
      try {
        await userRepo.createAsync({
          id: user.id,
          firstName: 'Test',
          lastName: 'User',
          allergies: [],
          email: `${user.id}@example.com`,
          dateOfBirth: new Date(),
          phoneNumber: user.phone,
          verified: true,
          locked: false,
          lastLogin: null,
          otps: [],
          attendances: [],
          hostedEvents: [],
        } as any);
        console.log(`User ${user.id} created`);
      } catch (e) {
        console.log(`User ${user.id} creation failed, may already exist`, e);
      }
    }

    // Create test event
    try {
      const eventRepo = new PrismaEventRepository();
      const event = await eventRepo.createAsync({
        id: '',
        name: 'Test Event',
        description: 'Test Description',
        date: new Date(),
        hostId: 'test-sender',
        location: 'Test Location',
        icon: '🎉',
        host: { id: 'test-sender' } as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        segments: [],
        attendees: [],
      } as any);
      console.log('Event created', event.id);
      testEventId = event.id;
    } catch (e) {
      console.log('Event creation failed', e);
      // Try to find existing event
      try {
        const eventRepo = new PrismaEventRepository();
        const events = await eventRepo.getAllAsync();
        const existingEvent = events.find((e) => e.hostId === 'test-sender');
        if (existingEvent) {
          testEventId = existingEvent.id;
          console.log('Using existing event', testEventId);
        } else {
          throw new Error('No existing event found');
        }
      } catch (findError) {
        console.log('Failed to find existing event', findError);
        throw e; // Re-throw original error
      }
    }
  });

  afterAll(async () => {
    // Clean up test data
    try {
      // Clean up all test invitations
      const allInvitations = await invitationRepo.getByEventIdAsync(testEventId!);
      for (const invitation of allInvitations) {
        try {
          await invitationRepo.deleteAsync(invitation.id);
        } catch (e) {
          // Ignore individual cleanup errors
        }
      }
    } catch (e) {
      // Ignore cleanup errors
    }
  });

  describe('POST /api/event-invitation', () => {
    it('should create event invitation', async () => {
      const response = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          phoneNumber: '2222222222',
          eventId: testEventId,
          message: 'Test invitation message',
        });

      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveProperty('id');
      expect(response.body.data.message).toBe('Test invitation message');
      expect(response.body.data.senderId).toBe('test-sender');
      expect(response.body.data.recipientId).toBe('test-recipient');
      expect(response.body.data.viewed).toBe(false);
      expect(response.body.data.rsvpStatus).toBe('Pending');
    });

    it('should return 400 for missing required fields', async () => {
      const response = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          message: 'Test message',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toContain('Missing required fields');
    });

    it('should return 400 when trying to invite oneself', async () => {
      const response = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          phoneNumber: '1111111111', // sender's phone number
          eventId: testEventId,
          message: 'Self invitation test',
        });

      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('You cannot invite yourself to an event');
    });
  });

  describe('GET /api/event-invitation/:id', () => {
    it('should return event invitation by id', async () => {
      // First create an invitation
      const createResponse = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          phoneNumber: '3333333333',
          eventId: testEventId,
          message: 'Test invitation for get',
        });

      const invitationId = createResponse.body.data.id;

      const response = await request(app)
        .get(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${senderToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe(invitationId);
      expect(response.body.data.message).toBe('Test invitation for get');
    });

    it('should return 404 for non-existent invitation', async () => {
      const response = await request(app)
        .get('/api/event-invitation/non-existent-id')
        .set('Cookie', [`jwt=${senderToken}`]);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Event invitation not found');
    });
  });

  describe('GET /api/event-invitation', () => {
    it('should return all invitations for user', async () => {
      const response = await request(app)
        .get('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
    });

    it('should return sent invitations when type=sent', async () => {
      const response = await request(app)
        .get('/api/event-invitation?type=sent')
        .set('Cookie', [`jwt=${senderToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // All returned invitations should be sent by the user
      response.body.data.forEach((invitation: any) => {
        expect(invitation.senderId).toBe('test-sender');
      });
    });

    it('should return received invitations when type=received', async () => {
      const response = await request(app)
        .get('/api/event-invitation?type=received')
        .set('Cookie', [`jwt=${recipientToken}`]);

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      // All returned invitations should be received by the user
      response.body.data.forEach((invitation: any) => {
        expect(invitation.recipientId).toBe('test-recipient');
      });
    });
  });

  describe('PUT /api/event-invitation/:id', () => {
    it('should allow sender to update message', async () => {
      // First create an invitation
      const createResponse = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          phoneNumber: '4444444444',
          eventId: testEventId,
          message: 'Original message',
        });

      const invitationId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          message: 'Updated message',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.message).toBe('Updated message');
    });

    it('should allow sender to update rsvpStatus and viewed', async () => {
      // First create an invitation
      const createResponse = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          phoneNumber: '5555555555',
          eventId: testEventId,
          message: 'Resend test message',
        });

      const invitationId = createResponse.body.data.id;

      // First, recipient accepts the invitation
      await request(app)
        .put(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${recipientToken}`])
        .send({
          rsvpStatus: 'Accepted',
        });

      // Now sender should be able to reset it to Pending (resend)
      const response = await request(app)
        .put(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          rsvpStatus: 'Pending',
          viewed: false,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rsvpStatus).toBe('Pending');
      expect(response.body.data.viewed).toBe(false);
    });

    it('should allow recipient to update viewed and rsvpStatus', async () => {
      // First create an invitation
      const createResponse = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          phoneNumber: '6666666666',
          eventId: testEventId,
          message: 'RSVP test message',
        });

      const invitationId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${user6666Token}`])
        .send({
          viewed: true,
          rsvpStatus: 'Accepted',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.viewed).toBe(true);
      expect(response.body.data.rsvpStatus).toBe('Accepted');
    });

    it('should create event attendee when RSVP status is set to Accepted', async () => {
      // Create an event first
      const eventRepo = new PrismaEventRepository();
      const event = await eventRepo.createAsync({
        id: '',
        name: 'Test Event for Attendee Creation',
        description: 'Test Description',
        date: new Date(),
        hostId: 'test-sender',
        location: 'Test Location',
        icon: '🎉',
        host: { id: 'test-sender' } as any,
        createdAt: new Date(),
        updatedAt: new Date(),
        segments: [],
        attendees: [],
      } as any);

      // Create an invitation for this event
      const createResponse = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          phoneNumber: '2222222222',
          eventId: event.id,
          message: 'Test invitation for attendee creation',
        });

      const invitationId = createResponse.body.data.id;

      // Accept the invitation
      const response = await request(app)
        .put(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${recipientToken}`])
        .send({
          viewed: true,
          rsvpStatus: 'Accepted',
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.rsvpStatus).toBe('Accepted');

      // Verify event attendee was created
      const eventAttendee = await eventAttendeeRepo.getByUserIdAndEventIdAsync(
        'test-recipient',
        event.id
      );
      expect(eventAttendee).toBeDefined();
      expect(eventAttendee?.userId).toBe('test-recipient');
      expect(eventAttendee?.eventId).toBe(event.id);

      // Clean up
      await eventAttendeeRepo.deleteAsync(eventAttendee!.id);
      await invitationRepo.deleteAsync(invitationId);
      await eventRepo.deleteAsync(event.id);
    });

    it('should return 403 for unauthorized user', async () => {
      // Create another user for this test
      const otherUserToken = jwt.sign({ userId: 'other-user' }, JWT_SECRET, { expiresIn: '1h' });

      // First create an invitation
      const createResponse = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          phoneNumber: '7777777777',
          eventId: testEventId,
          message: 'Test invitation for unauthorized update',
        });

      const invitationId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${otherUserToken}`])
        .send({
          message: 'Unauthorized update',
        });

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Unauthorized to update this invitation');
    });

    it('should return 404 for non-existent invitation', async () => {
      const response = await request(app)
        .put('/api/event-invitation/non-existent-id')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          message: 'Updated message',
        });

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Event invitation not found');
    });
  });

  describe('DELETE /api/event-invitation/:id', () => {
    it('should allow sender to delete invitation', async () => {
      // First create an invitation
      const createResponse = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          phoneNumber: '8888888888',
          eventId: testEventId,
          message: 'Message to delete',
        });

      const invitationId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${senderToken}`]);

      expect(response.status).toBe(204);
    });

    it('should return 403 for recipient trying to delete pending invitation', async () => {
      // First create an invitation
      const createResponse = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          phoneNumber: '9999999999',
          eventId: testEventId,
          message: 'Recipient cannot delete pending',
        });

      const invitationId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${recipientToken}`]);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe(
        'Only the sender or responded recipients can delete this invitation'
      );
    });

    it('should allow recipient to delete invitation after responding', async () => {
      // First create an invitation
      const createResponse = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          phoneNumber: '1010101010',
          eventId: testEventId,
          message: 'Recipient can delete after responding',
        });

      const invitationId = createResponse.body.data.id;

      // First respond to the invitation
      await request(app)
        .put(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${user1010Token}`])
        .send({
          viewed: true,
          rsvpStatus: 'Accepted',
        });

      // Now recipient should be able to delete it
      const deleteResponse = await request(app)
        .delete(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${user1010Token}`]);

      expect(deleteResponse.status).toBe(204);

      // Verify invitation is deleted
      const getResponse = await request(app)
        .get(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${senderToken}`]);

      expect(getResponse.status).toBe(404);
    });

    it('should return 404 for non-existent invitation', async () => {
      const response = await request(app)
        .delete('/api/event-invitation/non-existent-id')
        .set('Cookie', [`jwt=${senderToken}`]);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Event invitation not found');
    });

    it('should allow sender to withdraw (delete) a pending invitation', async () => {
      // Create a new invitation to withdraw
      const createResponse = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          phoneNumber: '1111111112',
          eventId: testEventId,
          message: 'Invitation to withdraw',
        });

      const invitationId = createResponse.body.data.id;

      // Withdraw the invitation
      const deleteResponse = await request(app)
        .delete(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${senderToken}`]);

      expect(deleteResponse.status).toBe(204);

      // Verify invitation is deleted
      const getResponse = await request(app)
        .get(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${senderToken}`]);

      expect(getResponse.status).toBe(404);
    });
  });
});

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../index';
import { PrismaUserRepository } from '../../../repositories/users/prisma-user-repository';
import { PrismaEventInvitationRepository } from '../../../repositories/events/prisma-event-invitation-repository';
import { RsvpStatus } from 'common/schema';
import { describe, beforeAll, afterAll, it, expect } from '@jest/globals';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const userRepo = new PrismaUserRepository();
const invitationRepo = new PrismaEventInvitationRepository();

describe('Event Invitation Router', () => {
  const senderToken = jwt.sign({ userId: 'test-sender' }, JWT_SECRET, { expiresIn: '1h' });
  const recipientToken = jwt.sign({ userId: 'test-recipient' }, JWT_SECRET, { expiresIn: '1h' });
  let testInvitationId: string;

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

      // Create test invitation
      const invitation = await invitationRepo.createAsync({
        id: '',
        senderId: 'test-sender',
        sender: { id: 'test-sender' } as any,
        recipientId: 'test-recipient',
        recipient: { id: 'test-recipient' } as any,
        message: 'Test invitation',
        viewed: false,
        rsvpStatus: 'Pending',
      });
      testInvitationId = invitation.id;
    } catch (e) {
      console.log('Setup failed', e);
      // Ignore if already exists
    }
  });

  afterAll(async () => {
    // Clean up test data
    try {
      if (testInvitationId) {
        await invitationRepo.deleteAsync(testInvitationId);
      }
      await invitationRepo.deleteAsync('test-invitation-2');
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
          recipientId: 'test-recipient',
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
  });

  describe('GET /api/event-invitation/:id', () => {
    it('should return event invitation by id', async () => {
      // First create an invitation
      const createResponse = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          recipientId: 'test-recipient',
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
          recipientId: 'test-recipient',
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

    it('should allow recipient to update viewed and rsvpStatus', async () => {
      // First create an invitation
      const createResponse = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          recipientId: 'test-recipient',
          message: 'RSVP test message',
        });

      const invitationId = createResponse.body.data.id;

      const response = await request(app)
        .put(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${recipientToken}`])
        .send({
          viewed: true,
          rsvpStatus: RsvpStatus.Accepted,
        });

      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.viewed).toBe(true);
      expect(response.body.data.rsvpStatus).toBe('Accepted');
    });

    it('should return 403 for unauthorized user', async () => {
      // Create another user for this test
      const otherUserToken = jwt.sign({ userId: 'other-user' }, JWT_SECRET, { expiresIn: '1h' });

      const response = await request(app)
        .put(`/api/event-invitation/${testInvitationId}`)
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
          recipientId: 'test-recipient',
          message: 'Message to delete',
        });

      const invitationId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${senderToken}`]);

      expect(response.status).toBe(204);
    });

    it('should return 403 for recipient trying to delete', async () => {
      // First create an invitation
      const createResponse = await request(app)
        .post('/api/event-invitation')
        .set('Cookie', [`jwt=${senderToken}`])
        .send({
          recipientId: 'test-recipient',
          message: 'Recipient cannot delete',
        });

      const invitationId = createResponse.body.data.id;

      const response = await request(app)
        .delete(`/api/event-invitation/${invitationId}`)
        .set('Cookie', [`jwt=${recipientToken}`]);

      expect(response.status).toBe(403);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Only the sender can delete this invitation');
    });

    it('should return 404 for non-existent invitation', async () => {
      const response = await request(app)
        .delete('/api/event-invitation/non-existent-id')
        .set('Cookie', [`jwt=${senderToken}`]);

      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBe('Event invitation not found');
    });
  });
});

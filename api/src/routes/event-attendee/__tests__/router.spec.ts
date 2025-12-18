import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../index';
import { describe, it, expect } from '@jest/globals';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

describe('Event Attendee Router', () => {
  const token = jwt.sign({ userId: 'test-user' }, JWT_SECRET, { expiresIn: '1h' });

  describe('POST /api/event-attendee', () => {
    it('should create event attendee', async () => {
      const response = await request(app)
        .post('/api/event-attendee')
        .set('Cookie', [`jwt=${token}`])
        .send({ userId: 'user1', segmentId: 'segment1' });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/event-attendee/:id', () => {
    it('should get event attendee by id', async () => {
      const response = await request(app)
        .get('/api/event-attendee/1')
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
        .put('/api/event-attendee/1')
        .set('Cookie', [`jwt=${token}`])
        .send({ userId: 'user2' });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/event-attendee/:id', () => {
    it('should delete event attendee', async () => {
      const response = await request(app)
        .delete('/api/event-attendee/1')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(204);
    });
  });
});

import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../index';
import { describe, it, expect } from '@jest/globals';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

describe('Event Attendee Contribution Router', () => {
  const token = jwt.sign({ userId: 'test-user' }, JWT_SECRET, { expiresIn: '1h' });

  describe('POST /api/event-attendee-contribution', () => {
    it('should create event attendee contribution', async () => {
      const response = await request(app)
        .post('/api/event-attendee-contribution')
        .set('Cookie', [`jwt=${token}`])
        .send({
          item: 'Test Item',
          description: 'Test Description',
          quantity: 1,
          attendeeId: 'attendee1',
        });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/event-attendee-contribution/:id', () => {
    it('should get event attendee contribution by id', async () => {
      const response = await request(app)
        .get('/api/event-attendee-contribution/1')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/event-attendee-contribution', () => {
    it('should get all event attendee contributions', async () => {
      const response = await request(app)
        .get('/api/event-attendee-contribution')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/event-attendee-contribution/:id', () => {
    it('should update event attendee contribution', async () => {
      const response = await request(app)
        .put('/api/event-attendee-contribution/1')
        .set('Cookie', [`jwt=${token}`])
        .send({ quantity: 2 });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/event-attendee-contribution/:id', () => {
    it('should delete event attendee contribution', async () => {
      const response = await request(app)
        .delete('/api/event-attendee-contribution/1')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(204);
    });
  });
});

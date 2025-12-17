import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../index';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

describe('Event Segment Router', () => {
  const token = jwt.sign({ userId: 'test-user' }, JWT_SECRET, { expiresIn: '1h' });

  describe('POST /api/event-segment', () => {
    it('should create event segment', async () => {
      const response = await request(app)
        .post('/api/event-segment')
        .set('Cookie', [`jwt=${token}`])
        .send({ name: 'Test Segment', eventId: 'event1' });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/event-segment/:id', () => {
    it('should get event segment by id', async () => {
      const response = await request(app)
        .get('/api/event-segment/1')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
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
        .put('/api/event-segment/1')
        .set('Cookie', [`jwt=${token}`])
        .send({ name: 'Updated Segment' });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/event-segment/:id', () => {
    it('should delete event segment', async () => {
      const response = await request(app)
        .delete('/api/event-segment/1')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(204);
    });
  });
});

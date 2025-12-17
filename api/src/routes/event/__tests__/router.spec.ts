import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../index';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

describe('Event Router', () => {
  const token = jwt.sign({ userId: 'test-user' }, JWT_SECRET, { expiresIn: '1h' });

  describe('POST /api/event', () => {
    it('should create event', async () => {
      const response = await request(app)
        .post('/api/event')
        .set('Cookie', [`jwt=${token}`])
        .send({ name: 'Test Event', date: '2023-01-01', location: 'Test Location' });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/event/:id', () => {
    it('should get event by id', async () => {
      const response = await request(app)
        .get('/api/event/1')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/event', () => {
    it('should get all events', async () => {
      const response = await request(app)
        .get('/api/event')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/event/:id', () => {
    it('should update event', async () => {
      const response = await request(app)
        .put('/api/event/1')
        .set('Cookie', [`jwt=${token}`])
        .send({ name: 'Updated Event' });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/event/:id', () => {
    it('should delete event', async () => {
      const response = await request(app)
        .delete('/api/event/1')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(204);
    });
  });
});

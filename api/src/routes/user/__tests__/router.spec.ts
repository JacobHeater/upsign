import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../../index';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';

describe('User Router', () => {
  const token = jwt.sign({ userId: 'test-user' }, JWT_SECRET, { expiresIn: '1h' });

  describe('POST /api/user', () => {
    it('should create user', async () => {
      const response = await request(app)
        .post('/api/user')
        .set('Cookie', [`jwt=${token}`])
        .send({ firstName: 'John', lastName: 'Doe' });

      expect(response.status).toBe(201);
    });
  });

  describe('GET /api/user/:id', () => {
    it('should get user by id', async () => {
      const response = await request(app)
        .get('/api/user/1')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
    });
  });

  describe('GET /api/user', () => {
    it('should get all users', async () => {
      const response = await request(app)
        .get('/api/user')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(200);
    });
  });

  describe('PUT /api/user/:id', () => {
    it('should update user', async () => {
      const response = await request(app)
        .put('/api/user/1')
        .set('Cookie', [`jwt=${token}`])
        .send({ firstName: 'Jane' });

      expect(response.status).toBe(200);
    });
  });

  describe('DELETE /api/user/:id', () => {
    it('should delete user', async () => {
      const response = await request(app)
        .delete('/api/user/1')
        .set('Cookie', [`jwt=${token}`]);

      expect(response.status).toBe(204);
    });
  });
});

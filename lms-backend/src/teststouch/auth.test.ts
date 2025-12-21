import request from 'supertest';
import app from '../app';
import { supabase } from '../config/supabase';


afterAll(async () => {
  await supabase.from('users').delete().eq('email', 'teststudent@example.com');
});

describe('Auth Endpoints', () => {
 describe('POST /api/auth/login', () => {
    
    beforeAll(async () => {
       await request(app).post('/api/auth/register').send({
         email: 'loginuser@example.com',
         password: 'securepassword',
         role: 'student'
       });
    });

    afterAll(async () => {
       await supabase.from('users').delete().eq('email', 'loginuser@example.com');
    });

    it('should login successfully with correct credentials', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'loginuser@example.com',
        password: 'securepassword',
      });

      expect(res.statusCode).toEqual(200);
      expect(res.body).toHaveProperty('token'); 
      expect(res.body.user).toHaveProperty('email', 'loginuser@example.com');
    });

    it('should fail with wrong password', async () => {
      const res = await request(app).post('/api/auth/login').send({
        email: 'loginuser@example.com',
        password: 'wrongpassword',
      });

      expect(res.statusCode).toEqual(401);
      expect(res.body).toHaveProperty('message', 'Invalid credentials');
    });
  });

    it('should reject invalid email', async () => {
      const res = await request(app).post('/api/auth/register').send({
        email: 'not-an-email',
        password: 'password123',
      });
      expect(res.statusCode).toEqual(400);
    });
  });
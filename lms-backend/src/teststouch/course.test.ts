import request from 'supertest';
import app from '../app';
import { supabase } from '../config/supabase';

let studentToken: string;
let mentorToken: string;
let mentorId: string;

describe('Course Management (RBAC)', () => {
  
  // 1. Setup: Create Users & Get Tokens
  beforeAll(async () => {
    // Register Student
    await request(app).post('/api/auth/register').send({
      email: 'student@test.com', password: 'password123', role: 'student'
    });
    const resStudent = await request(app).post('/api/auth/login').send({
      email: 'student@test.com', password: 'password123'
    });
    studentToken = resStudent.body.token;

    // Register Mentor
    await request(app).post('/api/auth/register').send({
      email: 'mentor@test.com', password: 'password123', role: 'mentor'
    });
    // Manually approve mentor in DB (since we don't have Admin API yet)
    await supabase.from('users').update({ is_approved: true }).eq('email', 'mentor@test.com');
    
    const resMentor = await request(app).post('/api/auth/login').send({
      email: 'mentor@test.com', password: 'password123'
    });
    mentorToken = resMentor.body.token;
    mentorId = resMentor.body.user.id;
  });

  // Cleanup
  afterAll(async () => {
    await supabase.from('users').delete().eq('email', 'student@test.com');
    await supabase.from('users').delete().eq('email', 'mentor@test.com');
  });

  // 2. The Tests
  it('should DENY a student from creating a course', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${studentToken}`)
      .send({ title: 'Hacking 101' });

    expect(res.statusCode).toEqual(403);
    expect(res.body.message).toMatch(/permission/i);
  });

  it('should ALLOW a mentor to create a course', async () => {
    const res = await request(app)
      .post('/api/courses')
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({ title: 'Advanced TypeScript', description: 'Deep dive' });

    expect(res.statusCode).toEqual(201);
    expect(res.body.course).toHaveProperty('title', 'Advanced TypeScript');
    expect(res.body.course).toHaveProperty('mentor_id', mentorId);
  });
});
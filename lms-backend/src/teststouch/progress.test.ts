import request from 'supertest';
import app from '../app';
import { supabase } from '../config/supabase';

let mentorToken: string, studentToken: string;
let courseId: string, chapter1Id: string, chapter2Id: string;
let studentId: string;

describe('Sequential Progress Logic', () => {

  // 1. Setup: Create Users, Course, Chapters, Enrollment
  beforeAll(async () => {
    // A. Create Mentor & Token
    // FIX: Password changed to 'password123' (min 6 chars)
    await request(app).post('/api/auth/register').send({ email: 'p4mentor@test.com', password: 'password123', role: 'mentor' });
    await supabase.from('users').update({ is_approved: true }).eq('email', 'p4mentor@test.com');
    const resMen = await request(app).post('/api/auth/login').send({ email: 'p4mentor@test.com', password: 'password123' });
    mentorToken = resMen.body.token;

    // B. Create Student & Token
    // FIX: Password changed to 'password123'
    await request(app).post('/api/auth/register').send({ email: 'p4student@test.com', password: 'password123', role: 'student' });
    const resStu = await request(app).post('/api/auth/login').send({ email: 'p4student@test.com', password: 'password123' });
    
    studentToken = resStu.body.token;
    studentId = resStu.body.user.id; // This should work now!

    // C. Create Course
    const resCourse = await request(app).post('/api/courses')
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({ title: 'Math 101' });
    courseId = resCourse.body.course.id;

    // D. Create Chapter 1 (Seq 1)
    const resChap1 = await request(app).post(`/api/courses/${courseId}/chapters`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({ title: 'Algebra', video_url: 'http://vid.com/1', sequence_order: 1 });
    chapter1Id = resChap1.body.chapter.id;

    // E. Create Chapter 2 (Seq 2)
    const resChap2 = await request(app).post(`/api/courses/${courseId}/chapters`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({ title: 'Calculus', video_url: 'http://vid.com/2', sequence_order: 2 });
    chapter2Id = resChap2.body.chapter.id;

    // F. Enroll Student
    await request(app).post(`/api/courses/${courseId}/enroll`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({ studentId });
  });

  afterAll(async () => {
    await supabase.from('users').delete().eq('email', 'p4mentor@test.com');
    await supabase.from('users').delete().eq('email', 'p4student@test.com');
  });

  // ... (Keep the rest of the tests exactly the same) ...
  it('should BLOCK completion of Chapter 2 if Chapter 1 is incomplete', async () => {
    const res = await request(app)
      .post(`/api/progress/${chapter2Id}/complete`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(400);
    expect(res.body.message).toMatch(/previous chapter/i);
  });

  it('should ALLOW completion of Chapter 1', async () => {
    const res = await request(app)
      .post(`/api/progress/${chapter1Id}/complete`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toMatch(/completed/i);
  });

  it('should ALLOW completion of Chapter 2 NOW (since Chap 1 is done)', async () => {
    const res = await request(app)
      .post(`/api/progress/${chapter2Id}/complete`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(200);
  });
});
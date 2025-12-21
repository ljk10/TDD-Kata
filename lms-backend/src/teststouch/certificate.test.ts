import request from 'supertest';
import app from '../app';
import { supabase } from '../config/supabase';

let mentorToken: string, studentToken: string;
let courseId: string, chapterId: string;
let studentId: string;

describe('Certificate Generation', () => {

  
  beforeAll(async () => {
    
    await request(app).post('/api/auth/register').send({ email: 'certmentor@test.com', password: 'password123', role: 'mentor' });
    await supabase.from('users').update({ is_approved: true }).eq('email', 'certmentor@test.com');
    const resMen = await request(app).post('/api/auth/login').send({ email: 'certmentor@test.com', password: 'password123' });
    mentorToken = resMen.body.token;

    
    await request(app).post('/api/auth/register').send({ email: 'certstudent@test.com', password: 'password123', role: 'student' });
    const resStu = await request(app).post('/api/auth/login').send({ email: 'certstudent@test.com', password: 'password123' });
    studentToken = resStu.body.token;
    studentId = resStu.body.user.id;

    
    const resCourse = await request(app).post('/api/courses').set('Authorization', `Bearer ${mentorToken}`).send({ title: 'Cert Course' });
    courseId = resCourse.body.course.id;
    
    
    const resChap = await request(app)
      .post(`/api/courses/${courseId}/chapters`)
      .set('Authorization', `Bearer ${mentorToken}`)
      .send({ 
        title: 'Chap 1', 
        video_url: 'http://example.com/video', 
        sequence_order: 1 
      });

    
    if (resChap.status !== 201) {
        console.error('Setup Failed:', resChap.body);
    }
    
    chapterId = resChap.body.chapter.id;

    
    await request(app).post(`/api/courses/${courseId}/enroll`).set('Authorization', `Bearer ${mentorToken}`).send({ studentId });
  });
  afterAll(async () => {
    await supabase.from('users').delete().eq('email', 'certmentor@test.com');
    await supabase.from('users').delete().eq('email', 'certstudent@test.com');
  });

  
  it('should DENY certificate if course is incomplete', async () => {
    const res = await request(app)
      .get(`/api/certificates/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(400); 
    expect(res.body.message).toMatch(/not completed/i);
  });

  it('should GRANT certificate if course is 100% complete', async () => {
    
    await request(app).post(`/api/progress/${chapterId}/complete`).set('Authorization', `Bearer ${studentToken}`);

    
    const res = await request(app)
      .get(`/api/certificates/${courseId}`)
      .set('Authorization', `Bearer ${studentToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.header['content-type']).toBe('application/pdf');
  });
});
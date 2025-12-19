import { z } from 'zod';

export const chapterSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  video_url: z.string().url(),
  sequence_order: z.number().int().positive(),
});

export const enrollmentSchema = z.object({
  studentId: z.string().uuid().optional(),
  email: z.string().email().optional(), 
});


export const registerSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  role: z.enum(['student', 'mentor', 'admin']).optional(), // Admin creates admins manually
});
export const courseSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});
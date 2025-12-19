import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { supabase } from '../config/supabase';
import { courseSchema } from '../utils/validation';

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    // 1. Validate Input
    const validation = courseSchema.safeParse(req.body);
    if (!validation.success) {
      return res.status(400).json({ error: validation.error.format() });
    }

    const { title, description } = validation.data;
    const mentorId = req.user?.userId; // Got from Token
    

    // 2. Insert into DB
    const { data, error } = await supabase
      .from('courses')
      .insert([{ title, description, mentor_id: mentorId }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: 'Course created successfully', course: data });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMyCourses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.userId;
    
    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('mentor_id', userId);

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
// ... existing imports and functions

export const getAssignedCourses = async (req: AuthRequest, res: Response) => {
  try {
    const studentId = req.user?.userId;

    // Join Enrollments with Courses to get course details
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        course_id,
        courses (
          id,
          title,
          description,
          mentor_id
        )
      `)
      .eq('student_id', studentId);

    if (error) throw error;

    // Flatten the structure for the frontend
    const courses = data.map((item: any) => item.courses);

    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
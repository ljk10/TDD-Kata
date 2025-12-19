import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { supabase } from '../config/supabase';
import bcrypt from 'bcryptjs';
// Get all users who are mentors but NOT approved yet
export const getPendingMentors = async (req: AuthRequest, res: Response) => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .eq('role', 'mentor')
      .eq('is_approved', false);

    if (error) throw error;
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const createMentor = async (req: AuthRequest, res: Response) => {
  const { email, password } = req.body;

  try {
    // 1. Check if user exists
    const { data: existing } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existing) return res.status(400).json({ message: 'User already exists' });

    // 2. Hash Password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 3. Insert new Mentor (Auto-Approved)
    const { error } = await supabase
      .from('users')
      .insert([
        { 
          email, 
          password: hashedPassword, 
          role: 'mentor', 
          is_approved: true // <--- The key difference: Auto-approved!
        }
      ]);

    if (error) throw error;

    res.status(201).json({ message: 'Mentor created successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    // Fetch users with their related data
    const { data, error } = await supabase
      .from('users')
      .select(`
        id, 
        email, 
        role, 
        is_approved,
        created_at,
        courses:courses!mentor_id (title),          
        enrollments:enrollments!student_id (
          course:courses (title)
        )
      `)
      .neq('role', 'admin') // Optional: Don't show other admins
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Clean up the structure for the frontend
    const users = data.map((user: any) => {
      let courseList: string[] = [];
      
      if (user.role === 'mentor') {
        // Get courses they teach
        courseList = user.courses ? user.courses.map((c: any) => c.title) : [];
      } else if (user.role === 'student') {
        // Get courses they study
        courseList = user.enrollments ? user.enrollments.map((e: any) => e.course?.title).filter(Boolean) : [];
      }

      return {
        id: user.id,
        email: user.email,
        role: user.role,
        is_approved: user.is_approved,
        courses: courseList
      };
    });

    res.json(users);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Approve a specific mentor
export const approveMentor = async (req: AuthRequest, res: Response) => {
  const { userId } = req.params;

  try {
    const { error } = await supabase
      .from('users')
      .update({ is_approved: true })
      .eq('id', userId);

    if (error) throw error;
    res.json({ message: 'Mentor approved successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
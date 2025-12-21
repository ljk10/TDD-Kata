import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';


export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, is_approved, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!users) return res.json([]);

    
    const usersWithCourses = await Promise.all(users.map(async (user) => {
      
      
      if (user.role === 'student') {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id, courses(title)') 
          .eq('student_id', user.id);
        
        
        const courses = enrollments?.map((e: any) => ({
          id: e.course_id,
          title: e.courses?.title || 'Unknown Course'
        })) || [];
        
        return { ...user, courses };
      }

      
      if (user.role === 'mentor') {
        const { data: createdCourses } = await supabase
          .from('courses')
          .select('id, title')
          .eq('mentor_id', user.id);
          
        return { ...user, courses: createdCourses || [] };
      }

      
      return { ...user, courses: [] };
    }));

    res.json(usersWithCourses);

  } catch (error: any) {
    console.error("Get Users Error:", error);
    res.status(500).json({ error: error.message });
  }
};


export const approveUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    const { data, error } = await supabase
      .from('users')
      .update({ is_approved: true })
      .eq('id', userId)
      .select()
      .single();

    if (error) throw error;

    res.json({ message: 'User approved successfully', user: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};


export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;

    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error("Delete User Error:", error);
    res.status(500).json({ error: error.message });
  }
};
export const createMentor = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

   
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ 
        email, 
        password: hashedPassword, 
        role: 'mentor', 
        is_approved: true
      }])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ message: "Mentor created successfully", user: newUser });

  } catch (error: any) {
    console.error("Create Mentor Error:", error);
    res.status(500).json({ error: error.message });
  }
};
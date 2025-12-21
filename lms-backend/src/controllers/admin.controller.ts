import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';
import bcrypt from 'bcryptjs';

// 1. Get List of All Users (Enhanced with Course Info)
export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    // A. Fetch all users
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, role, is_approved, created_at')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!users) return res.json([]);

    // B. Attach Course Data based on Role
    // We use Promise.all to run these queries in parallel
    const usersWithCourses = await Promise.all(users.map(async (user) => {
      
      // If Student: Get Enrolled Courses
      if (user.role === 'student') {
        const { data: enrollments } = await supabase
          .from('enrollments')
          .select('course_id, courses(title)') // Join to get course title
          .eq('student_id', user.id);
        
        // Flatten the structure for easier frontend display
        const courses = enrollments?.map((e: any) => ({
          id: e.course_id,
          title: e.courses?.title || 'Unknown Course'
        })) || [];
        
        return { ...user, courses };
      }

      // If Mentor: Get Created Courses
      if (user.role === 'mentor') {
        const { data: createdCourses } = await supabase
          .from('courses')
          .select('id, title')
          .eq('mentor_id', user.id);
          
        return { ...user, courses: createdCourses || [] };
      }

      // If Admin: Return as is (Admins usually don't have courses)
      return { ...user, courses: [] };
    }));

    res.json(usersWithCourses);

  } catch (error: any) {
    console.error("Get Users Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Approve a User
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

// 3. Delete a User (NEW)
export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { userId } = req.params;

    // Delete user from the public.users table
    // (Ensure your Supabase table is set to 'Cascade Delete' for related data)
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

    // 1. Validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. Check if user exists
    const { data: existingUser } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // 3. Hash Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // 4. Insert New Mentor (Auto-approved)
    const { data: newUser, error } = await supabase
      .from('users')
      .insert([{ 
        email, 
        password: hashedPassword, 
        role: 'mentor', 
        is_approved: true // Admins bypass approval
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
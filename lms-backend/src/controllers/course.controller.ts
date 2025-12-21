import { Request, Response } from "express";
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { title, description } = req.body;
    if (!req.user || !req.user.id) return res.status(401).json({ message: "Unauthorized" });

    const { data, error } = await supabase
      .from('courses')
      .insert([{ title, description, mentor_id: req.user.id }])
      .select().single();

    if (error) throw error;
    res.status(201).json({ course: data });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params; 
    const userId = req.user?.id;
    const userRole = req.user?.role;

    
    const { data: course, error: fetchError } = await supabase
      .from('courses')
      .select('mentor_id')
      .eq('id', id)
      .single();

    if (fetchError || !course) {
      return res.status(404).json({ message: "Course not found" });
    }

    
    const isOwner = course.mentor_id === userId;
    const isAdmin = userRole === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Forbidden: You do not own this course" });
    }

    
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', id);

    if (error) throw error;

    res.json({ message: "Course deleted successfully" });

  } catch (error: any) {
    console.error("Delete Course Error:", error);
    res.status(500).json({ error: error.message });
  }
};

export const getAllCourses = async (req: AuthRequest, res: Response) => {
    try {
        const userId = req.user?.id;
        const role = req.user?.role;
        let query = supabase.from('courses').select('*');

        if (role === 'mentor') query = query.eq('mentor_id', userId);
        
        const { data, error } = await query;
        if (error) throw error;
        res.json(data);
    } catch (error: any) {
        res.status(500).json({ error: error.message });
    }
};

export const getCourseById = async (req: AuthRequest, res: Response) => {
    const { id } = req.params;
    const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();
    if (error) return res.status(404).json({ message: "Course not found" });
    res.json(data);
};

export const enrollStudent = async (req: Request, res: Response): Promise<void> => {
  const { courseId } = req.params;
  const { email } = req.body;

  try {
    
    const { data: student } = await supabase
      .from('users') 
      .select('id').eq('email', email).maybeSingle();

    if (!student) {
      res.status(400).json({ message: "User not found" });
      return;
    }

    
    const { data: exists } = await supabase
      .from('enrollments')
      .select('*')
      .eq('student_id', student.id).eq('course_id', courseId).maybeSingle();

    if (exists) {
      res.status(400).json({ message: "Already enrolled" });
      return;
    }

    
    const { error } = await supabase
      .from('enrollments').insert([{ student_id: student.id, course_id: courseId }]);

    if (error) throw error;
    res.status(201).json({ message: "Enrollment successful" });

  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};
export const getAssignedCourses = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    
    
    const { data, error } = await supabase
      .from('enrollments')
      .select(`
        course_id,
        courses (
          *
        )
      `)
      .eq('student_id', userId);

    if (error) throw error;

    const courses = data?.map((enrollment: any) => enrollment.courses) || [];

    res.json(courses);

  } catch (error: any) {
    console.error("Get Assigned Courses Error:", error);
    res.status(500).json({ error: error.message });
  }
};
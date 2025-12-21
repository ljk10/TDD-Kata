import { Request, Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

// 1. Create Chapter
export const createChapter = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params; 
    const { title, video_url, sequence_order } = req.body;
    const mentorId = req.user?.id; 

    // Verify Ownership
    const { data: course } = await supabase
      .from('courses')
      .select('mentor_id')
      .eq('id', courseId)
      .single();

    if (!course) return res.status(404).json({ message: 'Course not found' });
    
    if (course.mentor_id !== mentorId) {
      return res.status(403).json({ message: 'Forbidden: You do not own this course' });
    }

    // Insert Chapter
    const { data, error } = await supabase
      .from('chapters')
      .insert([{ course_id: courseId, title, video_url, sequence_order }])
      .select()
      .single();

    if (error) {
       if (error.code === '23505') {
          return res.status(409).json({ 
            message: "A chapter with this sequence number already exists." 
          });
       }
       throw error;
    }

    res.status(201).json({ message: 'Chapter created', chapter: data });

  } catch (error: any) {
    console.error("Create Chapter Error:", error);
    res.status(500).json({ error: error.message });
  }
};

// 2. Get Chapters (👇 THIS WAS MISSING)
// 2. Get Chapters with Progress Logic
export const getChapters = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id; // Get the logged-in student's ID

    if (!courseId) return res.status(400).json({ message: "Course ID is missing" });

    // A. Fetch all Chapters for this course
    const { data: chapters, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('course_id', courseId)
      .order('sequence_order', { ascending: true });

    if (chapterError) throw chapterError;

    // B. Fetch User's Progress for this course
    // (We only need to know WHICH chapter IDs are present in the progress table)
    const { data: progressData, error: progressError } = await supabase
      .from('progress')
      .select('chapter_id, is_completed')
      .eq('student_id', userId)
      .eq('is_completed', true);

    if (progressError) console.error("Progress fetch error:", progressError);

    // Create a Set of completed chapter IDs for fast lookup
    const completedChapterIds = new Set(progressData?.map(p => p.chapter_id));

    // C. Merge Logic: Calculate isLocked and isCompleted
    let isPreviousChapterCompleted = true; // Chapter 1 is always unlocked

    const chaptersWithStatus = chapters.map((chapter) => {
      const isCompleted = completedChapterIds.has(chapter.id);
      
      // A chapter is locked if the previous one wasn't finished
      const isLocked = !isPreviousChapterCompleted;

      // Update the flag for the NEXT iteration
      isPreviousChapterCompleted = isCompleted;

      return {
        ...chapter,
        isCompleted,
        isLocked
      };
    });

    res.status(200).json(chaptersWithStatus);

  } catch (err: any) {
    console.error("Get Chapters Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};
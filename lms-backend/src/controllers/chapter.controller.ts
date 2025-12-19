import { Response } from 'express';
import { AuthRequest } from '../middlewares/auth.middleware';
import { supabase } from '../config/supabase';
import { chapterSchema, enrollmentSchema } from '../utils/validation';

// 1. Add Chapter
export const addChapter = async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  const validation = chapterSchema.safeParse(req.body);

  if (!validation.success) return res.status(400).json({ error: validation.error.format() });

  const { data, error } = await supabase
    .from('chapters')
    .insert([{ ...validation.data, course_id: courseId }])
    .select()
    .single();

  if (error) return res.status(500).json({ error: error.message });
  res.status(201).json({ message: 'Chapter added', chapter: data });
};

// 2. Enroll Student
// Replace the existing enrollStudent function with this robust version:

export const enrollStudent = async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  const validation = enrollmentSchema.safeParse(req.body);
  
  if (!validation.success) return res.status(400).json({ error: validation.error.format() });

  let targetStudentId = validation.data.studentId;

  try {
    // If email provided, look up the user ID
    if (!targetStudentId && validation.data.email) {
      const { data: user } = await supabase
        .from('users')
        .select('id')
        .eq('email', validation.data.email)
        .single();
      
      if (!user) return res.status(404).json({ message: 'Student email not found' });
      targetStudentId = user.id;
    }

    if (!targetStudentId) return res.status(400).json({ message: 'Student ID or Email required' });

    // Enroll them
    const { error } = await supabase
      .from('enrollments')
      .insert([{ student_id: targetStudentId, course_id: courseId }]);

    // Ignore "already enrolled" errors (duplicate key)
    if (error && error.code !== '23505') throw error;

    res.status(201).json({ message: 'Student enrolled successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
export const completeChapter = async (req: AuthRequest, res: Response) => {
  const { chapterId } = req.params;
  const studentId = req.user?.userId;

  try {
    // A. Get details of the chapter trying to be completed
    const { data: currentChapter, error: chapError } = await supabase
      .from('chapters')
      .select('course_id, sequence_order')
      .eq('id', chapterId)
      .single();

    if (chapError || !currentChapter) return res.status(404).json({ message: 'Chapter not found' });

    // B. Check Sequence: Is there a previous chapter?
    if (currentChapter.sequence_order > 1) {
      const previousSequence = currentChapter.sequence_order - 1;

      // Find the ID of the previous chapter
      const { data: prevChapter } = await supabase
        .from('chapters')
        .select('id')
        .eq('course_id', currentChapter.course_id)
        .eq('sequence_order', previousSequence)
        .single();

      if (prevChapter) {
        // Check if student has completed that previous chapter
        const { data: progress } = await supabase
          .from('progress')
          .select('id')
          .eq('student_id', studentId)
          .eq('chapter_id', prevChapter.id)
          .single();

        if (!progress) {
          return res.status(400).json({ message: 'Previous chapter must be completed first.' });
        }
      }
    }

    // C. Mark as Complete
    const { error: insertError } = await supabase
      .from('progress')
      .insert([{ student_id: studentId, chapter_id: chapterId }]);

    if (insertError) {
        // Handle duplicate completion gracefully
        if (insertError.code === '23505') return res.json({ message: 'Chapter already completed' });
        throw insertError;
    }

    res.json({ message: 'Chapter completed successfully' });

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
// ... existing imports

export const getCourseContent = async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  const studentId = req.user?.userId;

  try {
    // 1. Get all chapters for this course (Sorted by sequence)
    const { data: chapters, error: chapError } = await supabase
      .from('chapters')
      .select('*')
      .eq('course_id', courseId)
      .order('sequence_order', { ascending: true });

    if (chapError) throw chapError;

    // 2. Get student's completed chapter IDs
    const { data: progress, error: progError } = await supabase
      .from('progress')
      .select('chapter_id')
      .eq('student_id', studentId);

    if (progError) throw progError;

    // 3. Create a Set for fast lookup
    const completedIds = new Set(progress?.map(p => p.chapter_id));

    // 4. Merge Data (Add 'isCompleted' and 'isLocked' flags)
    // Rule: A chapter is locked if the PREVIOUS one is not completed.
    const content = chapters.map((chapter, index) => {
      const isCompleted = completedIds.has(chapter.id);
      
      // First chapter is always unlocked. 
      // Others are unlocked only if the previous one is completed.
      const isLocked = index === 0 ? false : !completedIds.has(chapters[index - 1].id);

      return { ...chapter, isCompleted, isLocked };
    });

    res.json(content);

  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
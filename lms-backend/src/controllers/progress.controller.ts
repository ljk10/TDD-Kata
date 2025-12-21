import { Response } from 'express';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

export const completeChapter = async (req: AuthRequest, res: Response) => {
  try {
    const { chapterId } = req.params;
    const userId = req.user?.id; 

    if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    
    const { data: currentChapter, error: chapterError } = await supabase
      .from('chapters')
      .select('*')
      .eq('id', chapterId)
      .single();

    if (chapterError || !currentChapter) {
      return res.status(404).json({ message: 'Chapter not found' });
    }

    
    if (currentChapter.sequence_order > 1) {
      
      const { data: prevChapter } = await supabase
        .from('chapters')
        .select('id')
        .eq('course_id', currentChapter.course_id)
        .eq('sequence_order', currentChapter.sequence_order - 1)
        .single();

      if (prevChapter) {
        
        const { data: progress } = await supabase
          .from('progress')
          .select('id')
          .eq('student_id', userId)
          .eq('chapter_id', prevChapter.id)
          .eq('is_completed', true)
          .single();

        
        if (!progress) {
          
          return res.status(400).json({ 
            message: "Cannot complete this chapter. Previous chapter must be completed first." 
          });
        }
      }
    }

    
    const { data, error } = await supabase
      .from('progress')
      .upsert([
        { 
          student_id: userId, 
          chapter_id: chapterId, 
          is_completed: true, 
          completed_at: new Date() 
        }
      ], { onConflict: 'student_id, chapter_id' })
      .select()
      .single();

    if (error) throw error;

    res.status(200).json({ message: 'Chapter marked as completed', progress: data });

  } catch (error: any) {
    console.error("Progress Error:", error);
    res.status(500).json({ error: error.message });
  }
};
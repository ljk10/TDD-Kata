import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { supabase } from '../config/supabase';
import { AuthRequest } from '../middlewares/auth.middleware';

export const generateCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    
    const studentId = req.user?.id; 

    if (!studentId) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    
    const { data: course, error: courseError } = await supabase
      .from('courses')
      .select('title')
      .eq('id', courseId)
      .single();

    if (courseError || !course) {
      return res.status(404).json({ message: 'Course not found' });
    }

    
    const { count: totalChapters } = await supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true })
      .eq('course_id', courseId);

    
    const { count: completedChapters } = await supabase
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .eq('is_completed', true)
      
    const { data: courseChapters } = await supabase
        .from('chapters')
        .select('id')
        .eq('course_id', courseId);
    
    const courseChapterIds = courseChapters?.map(c => c.id) || [];
    
    if (courseChapterIds.length === 0) {
         return res.status(400).json({ message: "Course has no content" });
    }

    const { data: userProgress } = await supabase
        .from('progress')
        .select('chapter_id')
        .eq('student_id', studentId)
        .eq('is_completed', true)
        .in('chapter_id', courseChapterIds);
    
    const completedCount = userProgress?.length || 0;

    if (completedCount !== courseChapterIds.length) {
      return res.status(400).json({ message: 'Course not completed yet' });
    }

    
    const doc = new PDFDocument();
    
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${courseId}.pdf`);

    doc.pipe(res);

    doc.fontSize(25).text('Certificate of Completion', 100, 100);
    doc.fontSize(15).text(`This certifies that the student has completed:`, 100, 160);
    doc.fontSize(20).text(course.title, 100, 190);
    
    doc.end();

  } catch (error: any) {
    console.error("Certificate Error:", error);
    res.status(500).json({ error: error.message });
  }
};
import { Response } from 'express';
import PDFDocument from 'pdfkit';
import { AuthRequest } from '../middlewares/auth.middleware';
import { supabase } from '../config/supabase';

export const getCertificate = async (req: AuthRequest, res: Response) => {
  const { courseId } = req.params;
  const studentId = req.user?.userId;

  try {
    // 1. Get Total Chapters in Course
    const { count: totalChapters, error: errTotal } = await supabase
      .from('chapters')
      .select('*', { count: 'exact', head: true }) // head:true means just get count, no data
      .eq('course_id', courseId);

    if (errTotal) throw errTotal;

    // 2. Get Completed Chapters by this Student for this Course
    // We need to query progress where chapter_id belongs to the course
    const { data: courseChapters } = await supabase
      .from('chapters')
      .select('id')
      .eq('course_id', courseId);
      
    const chapterIds = courseChapters?.map(c => c.id) || [];

    if (chapterIds.length === 0) {
        return res.status(400).json({ message: 'Course has no chapters' });
    }

    const { count: completedCount, error: errProg } = await supabase
      .from('progress')
      .select('*', { count: 'exact', head: true })
      .eq('student_id', studentId)
      .in('chapter_id', chapterIds); // Check only chapters from THIS course

    if (errProg) throw errProg;

    // 3. Compare
    if (!totalChapters || !completedCount || completedCount < totalChapters) {
      return res.status(400).json({ message: 'Course not completed yet.' });
    }

    // 4. Generate PDF
    const doc = new PDFDocument();
    
    // Set HTTP Headers for PDF download
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=certificate-${courseId}.pdf`);

    doc.pipe(res); // Stream directly to response

    // PDF Content
    doc.fontSize(25).text('Certificate of Completion', { align: 'center' });
    doc.moveDown();
    doc.fontSize(18).text(`Awarded to User ID: ${studentId}`, { align: 'center' });
    doc.moveDown();
    doc.text(`For completing Course ID: ${courseId}`, { align: 'center' });
    doc.moveDown();
    doc.fontSize(12).text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });

    doc.end();

  } catch (error: any) {
    // Note: If headers are already sent (streaming started), this might crash, 
    // but for this Kata scope it's fine.
    if (!res.headersSent) {
        res.status(500).json({ error: error.message });
    }
  }
};
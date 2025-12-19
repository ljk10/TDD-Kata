import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { createCourse, getMyCourses, getAssignedCourses } from '../controllers/course.controller';
import { addChapter, enrollStudent, getCourseContent, completeChapter } from '../controllers/chapter.controller';
const router = Router();

// Apply 'authenticate' to all routes in this file
router.use(authenticate);

// Only Mentors (and Admins) can create courses
router.post('/', authorize(['mentor', 'admin']), createCourse);


// Only Mentors can see "their" courses
router.get('/my', authorize(['mentor']), getMyCourses);
router.post('/:courseId/chapters', authorize(['mentor']), addChapter);
router.post('/:courseId/enroll', authorize(['mentor']), enrollStudent);
router.post('/', authorize(['mentor', 'admin']), createCourse);
router.get('/my', authorize(['mentor']), getMyCourses);
router.post('/progress/:chapterId/complete', authorize(['student']), completeChapter);

// Student Route 
router.get('/assigned', authorize(['student']), getAssignedCourses);
router.get('/:courseId/chapters', authorize(['student', 'mentor']), getCourseContent);
export default router;
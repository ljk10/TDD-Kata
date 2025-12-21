import { Router } from 'express';
import { createCourse, getAllCourses, getCourseById, enrollStudent, deleteCourse } from '../controllers/course.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import chapterRoutes from './chapter.routes';

const router = Router();

router.use(authenticate);


router.get('/', getAllCourses);
router.get('/:id', getCourseById);
router.post('/', authorize(['mentor']), createCourse);


router.post('/:courseId/enroll', authorize(['mentor']), enrollStudent);


router.use('/:courseId/chapters', chapterRoutes);

router.delete('/:id', authorize(['mentor', 'admin']), deleteCourse);

router.use('/:courseId/chapters', chapterRoutes);

export default router;
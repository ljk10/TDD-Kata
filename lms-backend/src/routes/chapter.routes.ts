import { Router } from 'express';
// 👇 This import will now work
import { createChapter, getChapters } from '../controllers/chapter.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

// 1. GET all chapters for a course
router.get('/', getChapters); 

// 2. POST a new chapter (Mentor only)
router.post('/', authorize(['mentor']), createChapter);

export default router;
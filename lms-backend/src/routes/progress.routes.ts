import { Router } from 'express';
// FIX: Import from progress.controller, NOT chapter.controller
import { completeChapter } from '../controllers/progress.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);

// POST /api/progress/:chapterId/complete
router.post('/:chapterId/complete', authorize(['student']), completeChapter);

export default router;
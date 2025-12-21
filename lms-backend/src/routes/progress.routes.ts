import { Router } from 'express';

import { completeChapter } from '../controllers/progress.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

router.use(authenticate);


router.post('/:chapterId/complete', authorize(['student']), completeChapter);

export default router;
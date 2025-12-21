import { Router } from 'express';

import { createChapter, getChapters } from '../controllers/chapter.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);


router.get('/', getChapters); 


router.post('/', authorize(['mentor']), createChapter);

export default router;
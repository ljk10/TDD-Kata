import { Router } from 'express';

import { generateCertificate } from '../controllers/certificate.controller'; 
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);


router.get('/:courseId', authorize(['student']), generateCertificate);

export default router;
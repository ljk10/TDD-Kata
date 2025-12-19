import { Router } from 'express';
import { getCertificate } from '../controllers/certificate.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();
router.use(authenticate);

router.get('/:courseId', authorize(['student']), getCertificate);

export default router;
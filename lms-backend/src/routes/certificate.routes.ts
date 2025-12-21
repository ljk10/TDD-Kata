import { Router } from 'express';
// FIX: Import 'generateCertificate', not 'getCertificate'
import { generateCertificate } from '../controllers/certificate.controller'; 
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router({ mergeParams: true });

router.use(authenticate);

// GET /api/certificates/:courseId
router.get('/:courseId', authorize(['student']), generateCertificate);

export default router;
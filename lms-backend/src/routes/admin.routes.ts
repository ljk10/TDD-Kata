import { Router } from 'express';
import { authenticate, authorize } from '../middlewares/auth.middleware';
import { getPendingMentors, approveMentor, getAllUsers, createMentor } from '../controllers/admin.controller';

const router = Router();
router.use(authenticate);

// Only Admins can access these
router.get('/mentors/pending', authorize(['admin']), getPendingMentors);
router.patch('/mentors/:userId/approve', authorize(['admin']), approveMentor);
router.get('/users', authorize(['admin']), getAllUsers);
router.post('/mentors', authorize(['admin']), createMentor);

export default router;
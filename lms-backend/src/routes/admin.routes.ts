import { Router } from 'express';
import { getUsers, approveUser, deleteUser, createMentor } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();

// Protect all routes: Must be Logged In + Must be 'admin'
router.use(authenticate);
router.use(authorize(['admin']));

// GET /api/admin/users
router.get('/users', getUsers);

// PUT /api/admin/approve/:userId
router.put('/approve/:userId', approveUser);

router.delete('/users/:userId', deleteUser);
router.post('/mentors', createMentor);


export default router;
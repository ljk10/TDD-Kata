import { Router } from 'express';
import { getUsers, approveUser, deleteUser, createMentor } from '../controllers/admin.controller';
import { authenticate, authorize } from '../middlewares/auth.middleware';

const router = Router();


router.use(authenticate);
router.use(authorize(['admin']));


router.get('/users', getUsers);


router.put('/approve/:userId', approveUser);

router.delete('/users/:userId', deleteUser);
router.post('/mentors', createMentor);


export default router;
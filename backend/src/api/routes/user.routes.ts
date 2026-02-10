import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.patch('/:id/ban', authenticate, authorize([Role.ADMIN]), UserController.banUser);
router.patch('/:id/unban', authenticate, authorize([Role.ADMIN]), UserController.unbanUser);
router.post('/:id/schedule-interview', authenticate, authorize([Role.ADMIN]), UserController.scheduleInterview);

export default router;

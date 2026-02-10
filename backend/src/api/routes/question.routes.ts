import { Router } from 'express';
import { QuestionController } from '../controllers/question.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/', authenticate, QuestionController.getAll);
router.get('/:id', authenticate, QuestionController.getById);

// Admin only routes
router.post('/', authenticate, authorize([Role.ADMIN]), QuestionController.create);
router.post('/import/codeforces', authenticate, authorize([Role.ADMIN]), QuestionController.importCodeforces);
router.put('/:id', authenticate, authorize([Role.ADMIN]), QuestionController.update);
router.delete('/:id', authenticate, authorize([Role.ADMIN]), QuestionController.delete);

export default router;

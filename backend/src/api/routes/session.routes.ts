import { Router } from 'express';
import { SessionController } from '../controllers/session.controller';
import { authenticate } from '../../middleware/auth.middleware';

const router = Router();

router.use(authenticate);

router.post('/', SessionController.create);
router.get('/', SessionController.getMySessions);
router.get('/history', SessionController.getMySessions);
router.get('/:id', SessionController.getById);
router.patch('/:id/status', SessionController.updateStatus);
router.post('/:id/interact', SessionController.interact);
router.post('/:id/answer', SessionController.submitAnswer);
router.patch('/:id/publish', SessionController.publish);
router.post('/:id/execute', SessionController.executeCode);

export default router;

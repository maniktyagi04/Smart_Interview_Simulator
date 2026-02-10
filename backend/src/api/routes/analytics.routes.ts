import { Router } from 'express';
import { AnalyticsController } from '../controllers/analytics.controller';
import { authenticate, authorize } from '../../middleware/auth.middleware';
import { Role } from '@prisma/client';

const router = Router();

router.get('/student', authenticate, AnalyticsController.getStudentAnalytics);
router.get('/admin', authenticate, authorize([Role.ADMIN]), AnalyticsController.getAdminAnalytics);
router.get('/admin/students', authenticate, authorize([Role.ADMIN]), AnalyticsController.getAllStudents);
router.get('/admin/sessions', authenticate, authorize([Role.ADMIN]), AnalyticsController.getAllSessions);

export default router;

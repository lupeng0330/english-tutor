import { Router } from 'express';
import { authRequired } from '../../middleware/auth';
import { requireRole } from '../../middleware/rbac';
import contentRouter from './content';
import questionsExamsRouter from './questions-exams';
import commerceRouter from './commerce';
import operationsRouter from './operations';

const router = Router();
router.use(authRequired, requireRole('admin'));
router.use(contentRouter);
router.use(questionsExamsRouter);
router.use(commerceRouter);
router.use(operationsRouter);

export default router;

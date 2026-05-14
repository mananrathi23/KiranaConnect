import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import allowRoles    from '../middlewares/roleMiddleware.js';
import { getBatches, getNextDispatch, getBatch, dispatchBatch } from '../controllers/batchController.js';

const router = Router();
router.use(authMiddleware);

router.get('/',                  allowRoles('WHOLESALER'), getBatches);
router.get('/next-dispatch',     getNextDispatch);           // both roles
router.get('/:id',               getBatch);
router.patch('/:id/dispatch',    allowRoles('WHOLESALER'), dispatchBatch);

export default router;

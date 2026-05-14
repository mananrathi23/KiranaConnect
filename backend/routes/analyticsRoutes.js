import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import allowRoles    from '../middlewares/roleMiddleware.js';
import { getSummary, getTopProducts, getOrdersTimeline, getRevenueByCategory } from '../controllers/analyticsController.js';

const router = Router();
router.use(authMiddleware);
router.use(allowRoles('WHOLESALER'));

router.get('/summary',             getSummary);
router.get('/top-products',        getTopProducts);
router.get('/orders-timeline',     getOrdersTimeline);
router.get('/revenue-by-category', getRevenueByCategory);

export default router;

import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import allowRoles    from '../middlewares/roleMiddleware.js';
import {
  placeKhataOrder,
  getMyKhata,
  settleByShop,
  getLedger,
  settleKhata,
  getKhataSummary,
} from '../controllers/khataController.js';

const router = Router();
router.use(authMiddleware);

// SHOP_OWNER routes
router.post('/',              allowRoles('SHOP_OWNER'), placeKhataOrder);
router.get('/my',             allowRoles('SHOP_OWNER'), getMyKhata);
router.patch('/:id/settle-by-shop', allowRoles('SHOP_OWNER'), settleByShop);

// WHOLESALER routes
router.get('/ledger',         allowRoles('WHOLESALER'), getLedger);
router.get('/summary',        allowRoles('WHOLESALER'), getKhataSummary);
router.patch('/:id/settle',   allowRoles('WHOLESALER'), settleKhata);

export default router;

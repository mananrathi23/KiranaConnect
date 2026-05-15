import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import allowRoles    from '../middlewares/roleMiddleware.js';
import {
  placeOrder, getMyOrders, getIncomingOrders, getOrder, updateOrderStatus, downloadInvoice
} from '../controllers/orderController.js';

const router = Router();
router.use(authMiddleware);

router.post('/',               allowRoles('SHOP_OWNER'),  placeOrder);
router.get('/my',              allowRoles('SHOP_OWNER'),  getMyOrders);
router.get('/incoming',        allowRoles('WHOLESALER'),  getIncomingOrders);
router.get('/:id',             getOrder);                               // both roles
router.get('/:id/invoice',     downloadInvoice);                        // both roles
router.patch('/:id/status',    allowRoles('WHOLESALER'),  updateOrderStatus);

export default router;

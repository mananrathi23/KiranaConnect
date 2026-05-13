import { Router } from 'express';
import authMiddleware from '../middlewares/authMiddleware.js';
import allowRoles    from '../middlewares/roleMiddleware.js';
import {
  getAllProducts, getMyProducts, getProduct,
  createProduct, updateProduct, updateStock, deleteProduct,
} from '../controllers/productController.js';

const router = Router();
router.use(authMiddleware);

router.get('/',          getAllProducts);                              // both roles
router.get('/my',        allowRoles('WHOLESALER'), getMyProducts);    // wholesaler own products
router.get('/:id',       getProduct);                                 // both roles
router.post('/',         allowRoles('WHOLESALER'), createProduct);
router.patch('/:id',     allowRoles('WHOLESALER'), updateProduct);
router.patch('/:id/stock', allowRoles('WHOLESALER'), updateStock);
router.delete('/:id',    allowRoles('WHOLESALER'), deleteProduct);

export default router;

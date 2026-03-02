import express from 'express';
import { verifyAdminToken } from '../../middlewares/admin/authenticate-admin.js';
import { getOrderController, getOrderDetailsByIdController, getPickupController, updateOrderStatusController } from '../../controllers/admin/orderController.js';

const router = express.Router();

router.use(verifyAdminToken)

router.get("/orders",getOrderController)
router.get("/pickups",getPickupController)
router.get("/orders/:id", getOrderDetailsByIdController);
router.put("/orders/:id/status", updateOrderStatusController);

export default router;